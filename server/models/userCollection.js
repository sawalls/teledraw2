var mongoose = require("mongoose");
var passHash = require("password-hash-and-salt");
var uuid = require("node-uuid");

var Schema = mongoose.Schema;
var UserSchema = new Schema({
    username : String,
    password : String,
    usernameLower : String,
    uuid : String,
    email : String,
    emailLower : String,
    createDate : Date,
});

var User = mongoose.model("User", UserSchema);

exports.addUser = function(args, callback)
{
    var username = args.username;
    var password = args.password;
    passHash(password).hash(function(error, hash){
        if(error){
            throw new Error("Something went wrong!");
        }

        User.find({"$or" : [{"usernameLower" : username.toLowerCase()},
                            {"emailLower" : args.email.toLowerCase()}]}).
            exec(function(err, users){
            var playerUuid = uuid.v1();
            if(users.length === 0){
                var userData = 
                {
                    "username": username,
                    "usernameLower" : username.toLowerCase(),
                    "password": hash,
                    "uuid" : playerUuid,
                    "email" : args.email,
                    "emailLower" : args.email.toLowerCase(),
                    "createDate" : new Date(),
                };
                var userRecord = new User(userData);
                console.log("new user: " + userData.username);
                userRecord.save(function(err){
                    if(err){
                        console.error("Failed to save new user!");
                        callback(-1);
                        return;
                    }
                    else{
                        callback(0, {playerUuid : playerUuid});
                        return;
                    }
                });
            }
            else{
                if(users[0].usernameLower === username.toLowerCase()){
                    console.error("Tried to create acct with existing username");
                    callback(1);
                    return;
                }
                else{
                    console.error("Tried to create acct with existing email");
                    callback(2);
                    return;
                }
            }
        });
    });
};

exports.loginUser = function(args, callback)
{
    var username = args.username;
    var password = args.password;
    User.find({"username" : username}).
        exec(function(err, users){
            if(err){
                console.error("Error finding user");
                callback(-1, err);
            }
            if(users.length === 0){
                callback(1, {error : "No users match that name"});
                return;
            }
            passHash(password).verifyAgainst(
                users[0].password, function(err, verified){
                    if(err){
                        callback(2, {error: "Something went wrong with verifying hash"});
                    }
                    if(!verified){
                        console.log("Don't try, we got you!");
                        callback(3, {error : "Invalid password"});
                        return;
                    }
                    else if(verified){
                        callback(0, users[0]);
                        return;
                    }
                });
    });
};

exports.findByUsername = function(args, callback)
{
    User.find({usernameLower : args.username.toLowerCase()}).
        exec(function(err, users){
            if(err){
                console.error(err);
                callback(-1, err);
            }
            callback(0, users);
        });
};

exports.findUsernamesByUuid = function(args, callback){
    User.find({
        uuid : {"$in" : args.uuids}
        },
        {username : 1, uuid : 1},
        function(err, response){
            if(err){
                console.error(err);
                callback(-1, err);
            }
            callback(0, response);
        }
    );

};

