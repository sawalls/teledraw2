var userCollection = require("./models/userCollection.js");
var gameCollection = require("./models/gameCollection.js");

module.exports = function(app, io)
{
    app.get("/", function(req, res){
        res.render("teledraw.jade");
    });

    io.sockets.on("connection", function(socket){
        console.log("Connection made!");

        socket.on("login", function(data){
            console.log("Login attempted");
            console.log(data);
            userCollection.loginUser(data, function(rc, response){
                if(rc){
                    if(rc < -1){
                        console.error("DB error");
                        socket.emit("loginError", {rc : rc, msg : "Database error - please try again later"});
                    }
                    else{
                        console.log(response);
                        socket.emit("loginError", {rc : rc, msg : response.error});
                    }
                }
                else{
                    console.log("Login Successful");
                    console.log(response);
                    socket.emit("loginSuccessful", {username : data.username, uuid : response.uuid});
                }
            });
        });

        socket.on("createAcct", function(data){
            console.log("Create Acct attempted");
            console.log(data);
            userCollection.addUser(data, function(rc, response){
                if(rc){
                    if(rc < 0){
                        console.error("DB error");
                        socket.emit("createAcctError", {rc : rc, msg : "Database error - please try again later"});
                    }
                    else{
                        console.log("createAcctError");
                        socket.emit("createAcctError", {rc : rc, msg : response.error});
                    }
                }
                else{
                    console.log("createAcctSuccessful");
                    socket.emit("createAcctSuccessful", {username : data.username});
                }
            });
        });

        socket.on("createGame", function(data){
            console.log("Create Game attempted");
            console.log(data);
            gameCollection.addGame({
                gameName : data.gameName,
                password : data.password,
                creatorUuid : data.creatorUuid,
                creatorUsername : data.creatorUsername,
                }, function(rc, response){
                    if(rc){
                        console.error(response.error);
                        socket.emit("createGameError", {rc : rc, msg : response.error});
                    }
                    else{
                        socket.join(response.gameUuid);
                        socket.emit("createGameSuccessful", {gameUuid : response.gameUuid});
                        socket.broadcast.emit("gameAdded", 
                            {gameName : data.gameName, 
                            uuid : response.gameUuid,
                            hasPassword : data.password === undefined ? false : true
                            });
                    }
                }
            );
        });

        socket.on("getOpenGameList", function(data){
            console.log("getOpenGameList");
            gameCollection.findOpenGames({}, function(rc, response){
                data = {};
                if(rc){
                    console.error("Failed to get initial game list!");
                    data.error = "There is a problem with the server. Please try again later";
                }
                else{
                    data.gameList = [];
                    for(var i = 0; i < response.length; ++i){
                        console.log(response[i]);
                        data.gameList.push({
                            gameName : response[i].gameName,
                            uuid : response[i].uuid,
                            hasPassword : response[i].password === undefined ? false : true,
                        });
                    }
                }
                console.log(data);
                socket.emit("openGameList", data);
                }
            );
        });

        socket.on("joinGame", function(data){
            console.log("joinGame");
            console.log(data);
            gameCollection.addPlayerToGame({
                playerUuid : data.playerUuid,
                username : data.playerUsername,
                gameUuid : data.gameUuid,
                password : data.password,},
                function(rc, response){
                    if(rc < 0){
                        console.error(response);
                        socket.emit("serverFailure");
                    }
                    else if(rc > 0){
                        socket.emit("joinGameError", {msg : response.error});
                    }
                    else{
                        socket.join(data.gameUuid);
                        socket.emit("joinGameSuccessful", data);
                        io.to(data.gameUuid).emit("playerJoined",{
                            uuid : data.playerUuid,
                            username : data.playerUsername,
                        });
                    }
                }
            );
        });

        socket.on("getCurrentGames", function(data){
            console.log("getCurrentGames");
            console.log(data);
            gameCollection.findCurrentGames({
                playerUuid : data.playerUuid,
                }, function(rc, response){
                    if(rc){
                        console.error(response);
                        socket.emit("serverFailure");
                    }
                    else{
                        socket.emit("currentGames", {gameList : response});
                    }
                }
            );
        });

        socket.on("getGameInfo", function(data){
            console.log("getGameInfo");
            console.log(data);
            gameCollection.findGameForPlayer(data, 
                function(rc, response){
                    if(rc < 0){
                        console.error(response);
                        socket.emit("serverFailure");
                    }
                    else if(rc > 0){
                        console.log(response);
                        socket.emit("getGameInfoError", response);
                    }
                    else{
                        console.log(response);
                        socket.emit("getGameInfoSuccessful", response);
                    }
                }
            );
        });

        socket.on("startGame", function(data){
            console.log("startGame");
            console.log(data);
            gameCollection.startGame({uuid : data.gameUuid},
                function(rc, response){
                    console.log(response);
                    if(rc < 0){
                        console.log(response);
                        socket.emit("serverFailure");
                    }
                    else if(rc > 0){
                        console.log(response);
                        socket.emit("startGameError", response);
                    }
                    else{
                        console.log(response);
                        socket.emit("startGameSuccessful");
                        io.to(data.gameUuid).emit("gameStarted", {});
                    }
                }
            );

        });


    });

}
