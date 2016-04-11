var mongoose = require("mongoose");

var uri = "mongodb://heroku_1txm1n0w:nmigub57q5fqq4j9cq245bmkud@ds017678.mlab.com:17678/heroku_1txm1n0w";
mongoose.connect(uri);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open",function(callback){
    console.log("Booyah!");
});

return mongoose;
