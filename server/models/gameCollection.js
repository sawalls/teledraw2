var mongoose = require("mongoose");
var passHash = require("password-hash-and-salt");
var uuid = require("node-uuid");

var Schema = mongoose.Schema;
var GameSchema = new Schema({
    gameName : String,
    password : String,
    uuid : String,
    creatorUuid : String,
    createDate : Date,
    gameState : Number,
    players : [
        {
            uuid : String,
            mailbox : [
            {
                ownerUuid : String,
                submissions : [
                {
                    author : String,
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
                       {"uuid" : playerUuid}}},
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
        {gameName : 1, uuid : 1},
        function(err, response){
            if(err){
                callback(-1, err);
            }
            callback(0, response);
        }
    );
};

