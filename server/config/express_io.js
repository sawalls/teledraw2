var config = require("./config"),
    express = require("express"),
    morgan = require("morgan"),
    session = require("express-session"),
    sessionStore = require('session-file-store')(session);
    socketio = require("socket.io");


module.exports = function(){
    var app = express(),
        io = socketio().listen(app.listen(process.env.PORT || 3000));

    if(process.env.NODE_ENV === "development"){
        app.use(morgan("dev"));
    }

    var sessionMiddleware = session({
        store: new sessionStore({ path: './tmp/sessions' }),
        saveUninitialized : true,
        resave : true,
        secret : config.sessionSecret
    });

    io.use(function(socket, next) {
        sessionMiddleware(socket.handshake, {}, next);
    });
    app.use(sessionMiddleware);

    app.set("views", "./views");
    app.set("view engine", "jade");

    app.use(express.static("./public"));

    return [app, io];
}
