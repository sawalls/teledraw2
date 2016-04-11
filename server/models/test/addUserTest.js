var mongoose = require("mongoose");

var uri = "mongodb://pprAdmin:Winchester1427@ds017070.mlab.com:17070/teledraw";
mongoose.connect(uri);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open",function(callback){
    console.log("Booyah!");
    var userCollection = require("../userCollection.js");
    userCollection.addUser({
            username : "testUser2",
            password : "123",
            email : "kevin2@kevin.com",
        }, 
        function(rc, response){
            if(rc){
                console.error("There was an error");
                console.error(response);
            }
            else{
                console.log("Save sucessful!");
            }
            process.exit(0);
        }
    );
});

