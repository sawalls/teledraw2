var mongoose = require("mongoose");

var uri = "mongodb://pprAdmin:Winchester1427@ds017070.mlab.com:17070/teledraw";
mongoose.connect(uri);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open",function(callback){
    console.log("Booyah!");
});

return mongoose;
