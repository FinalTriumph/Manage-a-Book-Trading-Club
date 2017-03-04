var express = require("express");
var app = express();
var port = process.env.PORT || 8080;

app.get("/", function(req, res) {
    res.sendFile(process.cwd() + "/index.html");
});

app.listen(port, function(){
    console.log("Listening on " + port);
})