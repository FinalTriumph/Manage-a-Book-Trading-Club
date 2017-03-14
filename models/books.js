"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Book = new Schema({
    book: {
        title: String,
        author: String,
        image: String,
        owner: String,
        now: String,
        inreq: Array
    }
});

module.exports = mongoose.model("Book", Book);