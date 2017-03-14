var express = require("express");
var app = express();
var session = require("express-session");
var mongourl = process.env.MONGOLAB_URI || "mongodb://localhost:27017/data";
var mongoose = require("mongoose");
var routes = require("./routes/index.js");

mongoose.connect(mongourl);
mongoose.Promise = global.Promise;

app.use("/public", express.static(process.cwd() + "/public"));
app.use("/controllers", express.static(process.cwd() + "/controllers"));

app.use(session({
    secret: "sessionsecret",
    resave: false,
    saveUninitialized: true
}));

routes(app);

var port = process.env.PORT || 8080;
app.listen(port, function(){
    console.log("Listening on " + port);
})