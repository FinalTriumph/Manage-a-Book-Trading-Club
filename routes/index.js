"use strict";

var path = process.cwd();
var User = require("../models/users");
var Book = require("../models/books");
var googleBookSearch = require("google-books-search");
var passwordHash = require('password-hash');

module.exports = function(app) {
    
    function isLoggedIn (req, res, next) {
        if (req.session.user) {
            return next();
        } else {
            res.sendFile(path + "/public/homeNLI.html");
        }
    }
    
    app.get("/", isLoggedIn, function(req, res) {
            res.sendFile(path + "/public/homeLI.html");
    });
    
    app.get("/signuprequest/:username/:password", function(req, res) {
        var username = req.params.username;
        var password = req.params.password;
        User.findOne({ "user.username": username }, function(err, doc) {
            if (err) console.log(err);
            if (doc) {
                res.json({ "status": "Username already registered."});
            } else {
                var newUser = new User();
                
                var hashedPassword = passwordHash.generate(password);
                
                newUser.user.username = username;
                newUser.user.password = hashedPassword;
                
                newUser.save(function(err){
                    if(err) console.log(err);
                });
                req.session.user = username;
                res.json({ "status": "redirect"});
            }
        });
    });
    
    app.get("/loginrequest/:username/:password", function(req, res) {
        var username = req.params.username;
        var password = req.params.password;
        User.findOne({ "user.username": username }, function(err, doc) {
            if (err) console.log(err);
            if (doc) {
                var hashedPassword = passwordHash.generate(password);
                
                if (passwordHash.verify(doc.user.password, hashedPassword)) {
                    req.session.user = username;
                    res.json({ "status": "redirect" });
                } else {
                    res.json({ "status": "Incorrect password." });
                }
            } else {
                res.json({ "status": "Username not found." });
            }
        });
    });
    
    app.get("/logout", function(req, res) {
        req.session.destroy(function(err) {
            if (err) console.log(err);
            res.redirect('/');
        });
    });
    
    app.get("/mybooks", isLoggedIn, function(req, res) {
        res.sendFile(path + "/public/mybooks.html");
    });
    
    app.get("/getmybooks", isLoggedIn, function(req, res) {
        var username = req.session.user;
        Book.find({ "book.owner": username }, function(err, docs) {
            if (err) console.log(err);
            res.json(docs);
        });
    });
    
    app.get("/getallbooks", isLoggedIn, function(req, res) {
        Book.find({}, function(err, docs) {
            if (err) console.log(err);
            res.json(docs);
        });
    });
    
    app.get("/profile", isLoggedIn, function(req, res) {
        res.sendFile(path + "/public/profile.html");
    });
    
    app.get("/userinfo", isLoggedIn, function(req, res) {
        var username = req.session.user;
        User.findOne({ "user.username": username }, function(err, doc) {
            if (err) console.log(err);
            var readyUser = doc.user;
            readyUser.password = undefined;
            res.json(readyUser);
        });
    });
    
    app.get("/user/:user", isLoggedIn, function(req, res) {
        var username = req.params.user;
        User.findOne({ "user.username": username }, function(err, doc) {
            if (err) console.log(err);
            var readyUser = doc.user;
            readyUser.password = undefined;
            res.json(readyUser);
        });
    });
    
    app.get("/updateuserinfo/:name/:city/:state/:contact", isLoggedIn, function(req, res) {
        var username = req.session.user;
        User.findOne({ "user.username": username }, function(err, user) {
            if (err) console.log(err);
            user.user.name = req.params.name;
            user.user.city = req.params.city;
            user.user.state = req.params.state;
            user.user.contact = req.params.contact;
            
            user.save(function(err){
                if(err) console.log(err);
            });
            res.json({ "status": "saved" });
        });
    });
    
    app.get("/bookinfo/:id", isLoggedIn, function(req, res) {
        Book.findById(req.params.id, function(err, book) {
            if (err) console.log(err);
            res.json(book);
        });
    });
    
    app.get("/addbook/:title/:author", isLoggedIn, function(req, res) {
        var title = req.params.title;
        var author = req.params.author;
        var owner = req.session.user;
        
        googleBookSearch.search(title + " " + author, { limit: 1 }, function(err, doc) {
            if (err) console.log(err);
            
            var newBook = new Book();
            
            var bookimage = "https://i.imgsafe.org/9b757effea.png";
            
            newBook.book.title = title;
            newBook.book.author = author;
            newBook.book.owner = owner;
            newBook.book.now = owner;
            if (doc[0] !== undefined && doc[0].thumbnail) {
                bookimage = doc[0].thumbnail;
            }
            newBook.book.image = bookimage;
            newBook.save(function(err){
                if(err) console.log(err);
            });
            
            res.json({ "status": "saved", newBook });
        });
    });
    
    app.get("/removebook/:id", isLoggedIn, function(req, res){
        var username = req.session.user;
        var id = req.params.id;
        Book.findById(id, function(err, doc) {
            if (err) console.log(err);
            if (username === doc.book.owner && username === doc.book.now) {
                if (doc.book.inreq) {
                    for (var i = 0; i < doc.book.inreq.length; i++) {
                        User.findOne({ "user.username": doc.book.inreq[i] }, function(err, user) {
                            if (err) console.log(err);
                            var outreq = user.user.outreq;
                            for (var j = 0; j < outreq.length; j++) {
                                if (outreq[j] === id) {
                                    outreq.splice(j, 1);
                                    break;
                                }
                            }
                            user.user.outreq = outreq;
                            user.save(function(err) {
                                if (err) console.log(err);
                            });
                        });
                    }
                }
                Book.findByIdAndRemove(id, function(err) {
                    if (err) {
                        res.json({ "status": err });
                    } else {
                        res.json({ "status": "deleted" });
                    }
                });
            } else {
                res.json({ "status": "error" });
            }
        });
    });
    
    app.get("/requestbook/:id", isLoggedIn, function(req, res) {
        var id = req.params.id;
        var username = req.session.user;
        Book.findById(id, function(err, book) {
            if (err) console.log(err);
            var inreq = book.book.inreq;
            inreq.push(username);
            book.book.inreq = inreq;
            book.save(function (err) {
                if (err) console.log(err);
            });
            User.findOne({ "user.username": username }, function(err, user) {
                if (err) console.log(err);
                var outreq = user.user.outreq;
                outreq.push(id);
                user.user.outreq = outreq;
                user.save(function (err) {
                    if (err) console.log(err);
                });
            });
            res.json({ "status": "requested"});
        });
    });
    
    app.get("/removerequest/:id", isLoggedIn, function(req, res) {
        var id = req.params.id;
        var username = req.session.user;
        Book.findById(id, function(err, book) {
            if (err) console.log(err);
            var inreq = book.book.inreq;
            for (var i = 0; i < inreq.length; i++) {
                if (inreq[i] === username) {
                    inreq.splice(i, 1);
                    break;
                }
            }
            book.book.inreq = inreq;
            book.save(function(err) {
                if (err) console.log(err);
            });
            User.findOne({ "user.username": username }, function(err, user) {
                if (err) console.log(err);
                var outreq = user.user.outreq;
                for (var j = 0; j < outreq.length; j++) {
                    if (outreq[j] === id) {
                        outreq.splice(j, 1);
                        break;
                    }
                }
                user.user.outreq = outreq;
                user.save(function(err) {
                    if (err) console.log(err);
                });
            });
            res.json({ "status": "removed" });
        });
    });
    
    app.get("/rejectrequest/:id/:user", isLoggedIn, function(req, res) {
        var id = req.params.id;
        var username = req.params.user;
        Book.findById(id, function(err, book) {
            if (err) console.log(err);
            var inreq = book.book.inreq;
            for (var i = 0; i < inreq.length; i++) {
                if (inreq[i] === username) {
                    inreq.splice(i, 1);
                    break;
                }
            }
            book.book.inreq = inreq;
            book.save(function(err) {
                if (err) console.log(err);
            });
            User.findOne({ "user.username": username }, function(err, user) {
                if (err) console.log(err);
                var outreq = user.user.outreq;
                for (var j = 0; j < outreq.length; j++) {
                    if (outreq[j] === id) {
                        outreq.splice(j, 1);
                        break;
                    }
                }
                user.user.outreq = outreq;
                user.save(function(err) {
                    if (err) console.log(err);
                });
            });
            res.json({ "status": "removed" });
        });
    });
    
    app.get("/acceptrequest/:id/:user", isLoggedIn, function(req, res) {
        var id = req.params.id;
        var username = req.params.user;
        Book.findById(id, function(err, book) {
            if (err) console.log(err);
            if (book.book.owner === book.book.now) {
                var inreq = book.book.inreq;
                for (var i = 0; i < inreq.length; i++) {
                    if (inreq[i] === username) {
                        inreq.splice(i, 1);
                        break;
                    }
                }
                book.book.inreq = inreq;
                book.book.now = username;
            
                book.save(function(err) {
                    if (err) console.log(err);
                });
                User.findOne({ "user.username": username }, function(err, user) {
                    if (err) console.log(err);
                    var outreq = user.user.outreq;
                    for (var j = 0; j < outreq.length; j++) {
                        if (outreq[j] === id) {
                            outreq.splice(j, 1);
                            break;
                        }
                    }
                    user.user.outreq = outreq;
                
                    var borrowed = user.user.borrowed;
                    borrowed.push(id);
                    user.user.borrowed = borrowed;
                
                    user.save(function(err) {
                        if (err) console.log(err);
                    });
                });
                res.json({ "status": "accepted" });
            } else {
                res.json({ "status": "not available", "now": book.book.now });
            }
        });
    });
    
    app.get("/returnbook/:id", isLoggedIn, function(req, res) {
        var id = req.params.id;
        var username = req.session.user;
        Book.findById(id, function(err, book) {
            if (err) console.log(err);
            
            book.book.now = book.book.owner;
            
            book.save(function(err) {
                if (err) console.log(err);
            });
            User.findOne({ "user.username": username }, function(err, user) {
                if (err) console.log(err);
                
                var borrowed = user.user.borrowed;
                
                for (var b = 0; b < borrowed.length; b++) {
                        if (borrowed[b] === id) {
                            borrowed.splice(b, 1);
                            break;
                        }
                    }
                user.user.borrowed = borrowed;
                
                user.save(function(err) {
                    if (err) console.log(err);
                });
            });
            res.json({ "status": "returned" });
        });
    });

};