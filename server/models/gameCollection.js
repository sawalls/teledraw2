var mongoose = require("mongoose");
var passHash = require("password-hash-and-salt");
var uuid = require("node-uuid");

var Schema = mongoose.Schema;
var GameSchema = new Schema({
    gameName : String,
    password : String,
    uuid : String,
    creatorUuid : String,
    creatorUsername : String,
    createDate : Date,
    gameState : Number,
    players : [
        {
            uuid : String,
            username : String,
            mailbox : [
                {
                    ownerUuid : String,
                    ownerUsername : String,
                    submissions : [
                        {
                            authorUuid : String,
                            content : String,
                        }
                    ]
                }
            ]
        }
    ],
});

const GAMESTATES = {
    GAME_NOT_STARTED : 0,
    GAME_STARTED : 1,
    GAME_COMPLETE : 2,
};

var Game = mongoose.model("Game", GameSchema);

exports.addGame = function(args, callback)
{
    var gameName = args.gameName;
    var password = args.password;
    var gameUuid = uuid.v1();
    var creatorUuid = args.creatorUuid;
    var creatorUsername = args.creatorUsername;

    function saveGame(gameData){
        var gameRecord = new Game(gameData);
        gameRecord.save(function(err){
            if(err){
                console.error("Failed to create new game");
                callback(-1, err);
            }
            else{
                exports.addPlayerToGame({
                    playerUuid : creatorUuid,
                    username : creatorUsername,
                    gameUuid : gameUuid,
                    password : password,
                }, callback);
            }
        });
    };

    var gameData = {
        gameName : gameName,
        uuid : gameUuid,
        creatorUuid : creatorUuid,
        creatorUsername : creatorUsername,
        createDate : new Date(),
        gameState : GAMESTATES.GAME_NOT_STARTED,
    };

    if(args.password === undefined){
        saveGame(gameData);
    }
    else{
        passHash(args.password).hash(function(error, hash){
            if(error){
                callback(-1, error);
                return;
            }
            gameData.password = hash;
            saveGame(gameData);
        });
    }
};

exports.addPlayerToGame = function(args, callback){
    var playerUuid = args.playerUuid;
    var username = args.username;
    var gameUuid = args.gameUuid;
    var password = args.password;
    Game.find({"uuid" : gameUuid},
    function(err, response){
        if(err){
            console.error(err);
            callback(-1, err);
            return;
        }
        if(response.length === 0){
            callback(1, {error : "Invalid gameUuid"});
            return;
        }
        var players = response[0].players;
        //Check if player is already in game
        for(var i = 0; i < players.length; ++i)
        {
            if(players[i].uuid === playerUuid){
                callback(2, {error : "Player is already in game"});
                return;
            }
        }

        function addUser(){
            Game.update({"uuid" : gameUuid},
            {"$push" : {"players" :
            {"uuid" : playerUuid,
            "username" : username,
            "mailbox" : [
                {
                    ownerUuid : playerUuid,
                    ownerUsername : username,
                }
            ]}}},
            function(err, response){
                if(err){
                    callback(-1, err);
                    return;
                }
                callback(0, {gameUuid : gameUuid});
                return;
            }
        );
    };

    //If there's a password, check it
    if(response[0].password){
        passHash(password).verifyAgainst(
            response[0].password,
            function(err, validated){
                if(err){
                    callback(-1, err);
                    return;
                }
                if(!validated){
                    callback(3, {error : "Invalid password"});
                }
                else{
                    addUser();
                }
            }
        );
    }
    else{
        addUser();
    }
}
);
};

exports.findOpenGames = function(args, callback){
    Game.find({
        gameState : GAMESTATES.GAME_NOT_STARTED,
    },
    {gameName : 1, uuid : 1, password : 1},
    function(err, response){
        if(err){
            callback(-1, err);
        }
        callback(0, response);
    }
);
};

exports.findCurrentGames = function(args, callback){
    console.log(args);
    Game.find({
        "players" : {"$elemMatch" :  {"uuid" : args.playerUuid}}
    },
    {gameName : 1, uuid : 1},
    function(err, response){
        if(err){
            callback(-1, err);
        }
        else{
            callback(0, response);
        }
    }
);
};

exports.findGameForPlayer = function(args, callback){
    console.log(args);
    Game.find({
        uuid : args.gameUuid,
    },
    {},
    function(err, response){
        if(err){
            console.error(err);
            callback(-1, err);
        }
        else{
            if(response.size === 0){
                callback(1, {error : "No such game uuid"});
                return;
            }
            var players = response[0].players;
            for(var i = 0; i < players.length; ++i)
            {
                if(players[i].uuid === args.playerUuid){
                    callback(0, response[0]);
                    return;
                }
            }
            callback(2, {error : "Player is not in game"});
        }
    }
);
};

exports.startGame = function(args, callback){
    console.log(args);
    Game.update({uuid : args.uuid},
        {gameState : GAMESTATES.GAME_STARTED},
        function(err, response){
            if(err){
                callback(-1, err);
            }
            else{
                callback(0, response);
            }
        });
    };

exports.addSubmission = function(args, callback){
    console.log(args);
    Game.find({uuid : args.gameUuid},
        function(err, response){
            if(err){
                console.error(err);
                callback(-1, err);
            }
            if(response.length === 0){
                console.error("No game with uuid ")
            }
            else{
                var game = response[0];
                //Find the chain that was submitted to
                var players = game.players;
                var mailbox;
                var nextPlayerUuid;
                for(var i = 0; i < players.length; ++i){
                    if(players[i].uuid === args.playerUuid){
                        mailbox = players[i].mailbox;
                        var nextPlayerIndex = (i + 1)%players.length;
                        console.log("INDEX IS : " + i);
                        nextPlayerUuid = players[nextPlayerIndex].uuid;
                        console.log("NEXT PLAYER UUID: " + nextPlayerUuid);
                        break;
                    }
                }
                console.log("NEXT PLAYER UUID: " + nextPlayerUuid);
                if(!mailbox){
                    var msg = "Player " + args.playerUuid + " is not in game " + args.gameUuid;
                    console.error(msg);
                    callback(-2, msg);
                }
                console.log("Mailbox: " + mailbox);
                var chain = mailbox.shift();
                console.log("Chain: " + chain);
                //Remove that chain from the player's mailbox

                Game.update({uuid : args.gameUuid,
                    "players.uuid" : args.playerUuid},
                    {"$pop" : {"players.$.mailbox" : -1}},
                    function(err, response){
                        if(err){
                            console.error(err);
                            callback(-1, err);
                        }
                        console.log(response);
                        chain.submissions.push({
                            content : args.submission.content,
                            authorUuid : args.playerUuid});
                        //Add chain to the next player's mailbox
                        Game.update({uuid : args.gameUuid,
                            "players.uuid" : nextPlayerUuid},
                            {"$push" : {"players.$.mailbox" : chain}},
                            function(err, response){
                                if(err){
                                    console.error(err);
                                    callback(-1, err);
                                }
                                else{
                                    if(response.nModified === 0){
                                        console.error("Failed to update mailbox");
                                        callback(-2, {error : "Failed to update mailbox"});
                                    }
                                    else{
                                        callback(0);
                                    }
                                }
                            }
                        );
                    }
                );
            }
        }
    );
};
