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
            state : Number,
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

const PLAYER_STATES = {
    NOT_STARTED : 0,
    IN_PROGRESS : 1,
    COMPLETED : 2,
};

const GAMESTATES = {
    NOT_STARTED : 0,
    IN_PROGRESS : 1,
    COMPLETED : 2,
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
        gameState : GAMESTATES.NOT_STARTED,
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
            "state" : PLAYER_STATES.NOT_STARTED,
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
        gameState : GAMESTATES.NOT_STARTED,
    },
    {gameName : 1, uuid : 1, password : 1, creatorUsername : 1},
    function(err, response){
        if(err){
            callback(-1, err);
        }
        callback(0, response);
    }
);
};

exports.findCurrentGames = function(args, callback){
    Game.find({
        "gameState" : {"$in" : [GAMESTATES.NOT_STARTED, GAMESTATES.IN_PROGRESS]},
        "players" : {"$elemMatch" :  {"uuid" : args.playerUuid}}
    },
    {gameName : 1, uuid : 1, creatorUsername : 1},
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
        {gameState : GAMESTATES.IN_PROGRESS},
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
    var gameUuid = args.gameUuid;
    var playerUuid = args.playerUuid;
    var submission = args.submission;
    var chainOwnerUuid = args.chainOwnerUuid;

    //Find the game
    Game.find({uuid : gameUuid},
        dbCallbackGenerator(callback, 
        function(response){
            if(response.length === 0){
                console.error("No game with uuid " + gameUuid);
                callback(-1, {error : "No game with uuid " + gameUuid});
                return;
            }
            else{
                var game = response[0];
                var players = game.players;
                //Find the player and the next player
                //And count the number of completed chains
                var mailbox;
                var nextPlayerUuid;
                var player;
                var numCompletedChains = 0;
                for(var i = 0; i < players.length; ++i){
                    if(players[i].uuid === playerUuid){
                        player = players[i];
                        mailbox = players[i].mailbox;
                        var nextPlayerIndex = (i + 1)%players.length;
                        nextPlayerUuid = players[nextPlayerIndex].uuid;
                    }
                    for(var j = 0; j < players[i].mailbox.length; ++j)
                    {
                        if(players[i].mailbox[j].submissions.length === players.length){
                            numCompletedChains += 1;
                        }
                    }
                }
                if(!mailbox){
                    var msg = "Player " + playerUuid + " is not in game " + gameUuid;
                    console.error(msg);
                    callback(-2, msg);
                }
                var chain = mailbox.shift();
                //Check that the user is actually trying to submit to this chain
                if(chain.ownerUuid != chainOwnerUuid){
                    console.error("Tried to submit to a chain not at front of mailbox!");
                    return;
                }

                //Remove that chain from the player's mailbox
                Game.update({uuid : gameUuid,
                    "players.uuid" : playerUuid},
                    {"$pop" : {"players.$.mailbox" : -1}},
                    dbCallbackGenerator(callback,
                    function(response){
                        console.log(response);
                        chain.submissions.push({
                            content : submission.content,
                            authorUuid : playerUuid});
                        
                        var playerState = PLAYER_STATES.IN_PROGRESS;
                        if(chain.submissions.length === players.length){
                            playerState = PLAYER_STATES.COMPLETED;
                        }

                        function updateChain(updatedPlayerState, updatedGameState){
                            //Add chain to the next player's mailbox
                            Game.update({uuid : gameUuid,
                                "players.uuid" : nextPlayerUuid},
                                {"$push" : {"players.$.mailbox" : chain}},
                                dbCallbackGenerator(callback,
                                function(response){
                                    if(response.nModified === 0){
                                        console.error("Failed to update mailbox");
                                        callback(-3, {error : "Failed to update mailbox"});
                                    }
                                    else{
                                        callback(0, {
                                            chainOwnerUuid : chain.ownerUuid,
                                            chainState : chain.state,
                                            targetPlayerUuid : nextPlayerUuid,
                                            updatedPlayerState : 
                                                updatedPlayerState ? updatedPlayerState : undefined,
                                            updatedGameState : 
                                                updatedGameState ? updatedGameState : undefined,
                                            gameUuid : gameUuid,
                                            creatorUsername : game.creatorUsername,
                                            gameName : game.gameName,
                                            submission : {
                                                content : submission.content,
                                                authorUuid : playerUuid,
                                            }}
                                        );
                                    }
                                })
                            );
                        };

                        if(player.state != playerState){
                            var updateObj = {"$set" : {"players.$.state" : playerState}};
                            var updatedGameState = undefined;
                            if(playerState === PLAYER_STATES.COMPLETED
                                    && numCompletedChains === (players.length - 1)){
                                //The final chain was completed
                                updatedGameState = GAMESTATES.COMPLETED;
                                updateObj = {"$set" : {"players.$.state" : playerState, 
                                    "gameState" : updatedGameState}}

                            }
                            console.log("Updating player state in game");
                            if(updatedGameState){
                                console.log("Updating game state");
                            }
                            Game.update(
                                {"uuid" : gameUuid, "players.uuid" : player.uuid},
                                updateObj,
                                dbCallbackGenerator(callback,
                                function(response){
                                    console.log(response);
                                    updateChain(playerState, updatedGameState);
                                })
                            );
                        }
                        else{
                            updateChain();
                        }
                    })
                );
            }
        })
    );
};

exports.findFinishedGamesForPlayer = function(args, callback){
    var playerUuid = args.playerUuid;
    Game.find({"gameState" : GAMESTATES.COMPLETED/*, "players.uuid" : playerUuid*/},
        {"gameName" : 1, "uuid" : 1, "creatorUsername" : 1},
        dbCallbackGenerator(callback,
            function(response){
                console.log(response);
                callback(0, response);
            }
        )
    );
};

exports.findFinishedGameInfo = function(args, callback){
    Game.find({"gameState" : GAMESTATES.COMPLETED,
        "uuid" : args.gameUuid}, {"players" : 1},
        dbCallbackGenerator(callback,
            function(response){
                if(response.length === 0){
                    callback(1, {error : "No such completed game"});
                    return;
                }
                callback(0, response[0]);
                return;
            }
        )
    );
};


function dbCallbackGenerator(controllerCallback, successCallback){
    var dbCallback = function(err, response){
        if(err){
            console.error(err);
            controllerCallback(-1, err);
            return;
        }
        else{
            successCallback(response);
        }
    };
    return dbCallback;
};
