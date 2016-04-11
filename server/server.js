process.env.NODE_ENV = process.env.NODE_ENV || "development";

var express_io  = require("./config/express_io.js");
var Server = require("http").Server;
var session = require("express-session");

var express_io_results = express_io();
var app = express_io_results[0];
var io = express_io_results[1];
var server = Server(app);

require("./routes.js")(app, io);

module.exports = app;

console.log("Server running");
