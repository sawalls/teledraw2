var userCollection = require("./models/userCollection.js");
var gameCollection = require("./models/gameCollection.js");
var nodeUuid = require("node-uuid");
var aws = require("aws-sdk");

var revealSessions = {};

var s3 = new aws.S3();

const S3_BUCKET = process.env.S3_BUCKET;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

module.exports = function(app, io)
{
    app.get("/", function(req, res){
        res.render("teledraw.pug");
    });

    io.sockets.on("connection", function(socket){
        console.log("Connection made!");

        socket.on("login", function(data){
            console.log("Login attempted");
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
                    socket.emit("createAcctSuccessful", {username : data.username,
                        uuid : response.playerUuid});
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
                        socket.emit("createGameSuccessful", 
                            {gameName : data.gameName,
                                gameUuid : response.gameUuid});
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
                        //Package data nicely
                        var gameData = {
                            gameUuid : response.uuid,
                            gameState : response.gameState,
                            creatorUuid : response.creatorUuid,
                            creatorUsername : response.creatorUsername,
                            players : [],
                            mailbox : [],
                        };
                        for(var i = 0; i < response.players.length; ++i){
                            gameData.players.push({
                                uuid : response.players[i].uuid,
                                username : response.players[i].username,
                            });
                            if(response.players[i].uuid === data.playerUuid){
                                console.log("Found the player");
                                var mailbox = response.players[i].mailbox;
                                gameData.playerState = response.players[i].state;
                                for(var j = 0; j < mailbox.length; ++j){
                                    var chainInfo = {
                                        chainOwnerUuid : mailbox[j].ownerUuid,
                                        chainState : mailbox[j].state,
                                    };
                                    if(mailbox[j].submissions.length > 0){
                                        chainInfo.submission = mailbox[j].submissions[mailbox[j].submissions.length - 1];
                                    }
                                    gameData.mailbox.push(chainInfo);
                                }
                            }
                        }
                        console.log(gameData);
                        socket.join(data.gameUuid);
                        socket.emit("getGameInfoSuccessful", gameData);
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

        function addSubmission(data){
            gameCollection.addSubmission(data,
                function(rc, response){
                    if(rc){
                        console.error(response);
                        socket.emit("serverFailure");
                    }
                    else{
                        console.log("emitting receivedSubmission");
                        socket.emit("submissionSuccessful", {});
                        io.to(data.gameUuid).emit("receivedSubmission", response);
                        if(response.updatedPlayerState){
                            socket.emit("updatedPlayerState", {playerState: response.updatedPlayerState});
                        }
                    }
                }
            );
        }

        socket.on("submission", function(data){
            console.log("submission");
            console.log(data);
            addSubmission(data);
        });

        socket.on("getS3SignedRequest", function(data){
            console.log("getS3SignedRequest");
            var uuid = nodeUuid.v1();
            var fileName = data.fileName;
            //get file extension
            var extn = fileName.substring(fileName.lastIndexOf("."));
            var key = uuid + extn;
            var fileType = data.fileType;
            const s3Params = {
                Bucket: S3_BUCKET,
                Key: key,
                Expires: 60,
                ContentType: fileType,
                ACL: 'public-read'
            };
            s3.getSignedUrl('putObject', s3Params, (err, reqUrl) => {
                if(err){
                    console.log(err);
                    socket.emit("serverFailure");
                    return;
                }
                var url = "https://" + S3_BUCKET + 
                    ".s3.amazonaws.com/" +
                    key;
                const returnData = {
                    signedRequest: reqUrl,
                    url: url,
                };
                socket.emit("signedRequest", returnData);
            });
        });

        socket.on("uploadCanvasImg", function(data){
            console.log("UPLOAD CANVAS DATA");
            console.log(data);
            var uuid = nodeUuid.v1();
            var key = uuid + ".png";
            buf = new Buffer(data.dataUrl.replace(/^data:image\/\w+;base64,/, ""),'base64')
                var s3data = {
                    Bucket : S3_BUCKET,
                    Key: key, 
                    Body: buf,
                    ContentEncoding: 'base64',
                    ContentType: 'image/png'
                };
            s3.putObject(s3data, function(err, retData){
                if (err) { 
                    console.log(err);
                    console.log('Error uploading data: ', retData); 
                } else {
                    console.log('succesfully uploaded the image!');
                    if(retData.url){
                        console.log(retData.url);
                    }
                    var url = "https://" + S3_BUCKET + 
                        ".s3.amazonaws.com/" +
                        key;
                    subData = {
                        gameUuid : data.gameUuid,
                        playerUuid : data.playerUuid,
                        chainOwnerUuid : data.chainOwnerUuid,
                        submission : {
                            content : url,
                        },
                    };
                    console.log(subData);
                    addSubmission(subData);
                }
            });
        });


        socket.on("getFinishedGames", function(data){
            console.log("getFinishedGames");
            console.log(data);
            gameCollection.findFinishedGamesForPlayer({playerUuid : data.playerUuid},
                function(rc, response){
                    if(rc){
                        console.log(response)
                            socket.emit("serverFailure");
                    }
                    else{
                        socket.emit("finishedGames", {gameList : response});
                    }
                }
            );
        });

        socket.on("getRevealInfo", function(data){
            var gameUuid = data.gameUuid;
            var playerUuid = data.playerUuid;
            console.log("getRevealInfo");
            console.log(data);
            gameCollection.findGameForPlayer(
                {gameUuid : gameUuid, playerUuid : playerUuid},
                function(rc, response){
                    if(rc){
                        console.error(response);
                        socket.emit("serverFailure");
                    }
                    else{
                        console.log(response);
                        //Package response
                        retObj = {
                            players : response.players,
                        }
                        socket.emit("revealInfo", retObj);
                    }
                }
            )
        });

        function getRevealRoomName(gameUuid){
            return gameUuid + "_reveal";
        };

        socket.on("joinRevealSession", function(data){
            console.log("joinRevealSession");
            var revealGameUuid = data.gameUuid;
            var roomName = getRevealRoomName(data.gameUuid);
            if(revealSessions[revealGameUuid] === undefined){
                var players = [
                    {
                        playerUuid : data.playerUuid,
                        username : data.username,
                        isLeader : true,
                    }
                ];
                revealSessions[revealGameUuid] = {
                    sessionStartDate : new Date(),
                    roomName : roomName,
                    players : players,
                };
                socket.join(roomName);
                console.log("emitting createdRevealSession");
                console.log(players);
                socket.emit("createdRevealSession", {players: players});
            }
            else{
                //check if the player is already in the session
                var players = revealSessions[revealGameUuid].players;
                var i = 0;
                for(; i < players.length; ++i){
                    if(players[i].playerUuid === data.playerUuid){
                        break;
                    }
                }
                if(i >= players.length){
                    revealSessions[revealGameUuid].players.push(
                            {playerUuid : data.playerUuid, username : data.username});
                    io.to(roomName).emit("playerJoinedRevealSession", 
                            {playerUuid : data.playerUuid, username: data.username});
                }
                console.log("emitting groupRevealInfo");
                console.log(players);
                socket.emit("groupRevealInfo", {
                    players : revealSessions[revealGameUuid].players,
                });
                socket.join(roomName);
                if(revealSessions[revealGameUuid].currentSubmission){
                    socket.emit("currentRevealSubmission", 
                        revealSessions[revealGameUuid].currentSubmission);
                }
            }
        });

        socket.on("startGroupReveal", function(data){
            console.log("startGroupReveal");
            console.log(data);
            //Return the first element of the reveal
            var revealSession = revealSessions[data.gameUuid];
            if(!revealSession){
                socket.emit("serverFailure");
                return;
            }
            //Get game info
            gameCollection.findFinishedGameInfo({gameUuid : data.gameUuid},
                function(rc, response){
                    if(rc){
                        socket.emit("serverFailure");
                        return;
                    }
                    socket.emit("gameRevealInfo", response);
                }
            );
        });

        socket.on("updateRevealSession", function(data){
            console.log("updateRevealSession");
            console.log(data);
            if(!revealSessions[data.gameUuid]){
                console.error("No such reveal session" + data.gameUuid);
                socket.emit("serverFailure");
                return;
            }
            else{
                revealSessions[data.gameUuid].currentSubmission = data.submission;
                io.to(getRevealRoomName(data.gameUuid)).
                    emit("revealUpdated", {submission : data.submission});
            }
        });

    });
}
