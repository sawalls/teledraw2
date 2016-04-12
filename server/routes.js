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
                    socket.emit("loginSuccessful", {username : data.username});
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
        
    });
}
