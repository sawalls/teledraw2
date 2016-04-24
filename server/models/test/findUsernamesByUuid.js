var mongoose = require("mongoose");

var uri = "mongodb://pprAdmin:Winchester1427@ds017070.mlab.com:17070/teledraw";
mongoose.connect(uri);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open",function(callback){
    console.log("Booyah!");
    var userCollection = require("../userCollection.js");
    userCollection.findUsernamesByUuid({
        uuids : [
            "70a81ec0-0101-11e6-a96d-e389ff38d7bb",
            "e85f1ea0-023c-11e6-a289-671ca4e88c30",
            ]
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

