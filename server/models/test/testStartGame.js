var mongoose = require("mongoose");

var uri = "mongodb://pprAdmin:Winchester1427@ds017070.mlab.com:17070/teledraw";
mongoose.connect(uri);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open",function(callback){
    console.log("Booyah!");
    var gameCollection = require("../gameCollection.js");
    gameCollection.startGame({
        uuid : "21373220-03dd-11e6-a4e9-0349af69d7c0",
    }, function(rc, response){
            if(rc){
                console.error("Something went wrong!");
                console.error(response);
                process.exit(1);
            }
            else{
                console.error("Success!");
                process.exit(0);
            }
        });
    }
);

