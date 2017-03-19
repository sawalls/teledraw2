var mongoose = require("mongoose");

var uri = process.env.MONGO_URI;
mongoose.connect(uri);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open",function(callback){
    console.log("Booyah!");
});

return mongoose;
