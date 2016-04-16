var mongoose = require("mongoose");

var uri = "mongodb://pprAdmin:Winchester1427@ds017070.mlab.com:17070/teledraw";
mongoose.connect(uri);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open",function(callback){
    console.log("Booyah!");
    var gameCollection = require("../gameCollection.js");
    gameCollection.findGameForPlayer({
            playerUuid : "70a81ec0-0101-11e6-a96d-e389ff38d7bb",
            gameUuid : "2b90f8b0-024c-11e6-a933-f754feae506c",
        },
        function(rc, response){
            if(rc){
                console.error("There was an error");
                console.error(response);
            }
            else{
                console.log(response);
            }
            process.exit(0);
        }
    );
});

