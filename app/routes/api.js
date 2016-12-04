var User = require('../models/user');
var Comment = require('../models/comment');
var config = require('../../config');

var secretKey = config.secretKey;
var async = require('async');
var jsonwebtoken = require('jsonwebtoken');

function createToken(user) {

    var token = jsonwebtoken.sign({
        id: user._id,
        name: user.name,
        email: user.email
    }, secretKey, {
        expirtesInMinute: 1440
    });

    return token;

}

module.exports = function(app, express, io) {


    var api = express.Router();

    api.get('/allComments', function(req, res) {

        Comment.find({}, function(err, comments) {
            if (err) {
                res.send(err);
                return;
            }
            res.json(comments);
        });
    });

    api.post('/signup', function(req, res) {

        var user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });
        var token = createToken(user);
        user.save(function(err) {
            if (err) {
                res.send(err);
                return;
            }

            res.json({
                success: true,
                message: 'User has been created!',
                token: token
            });
        });
    });


    api.get('/users', function(req, res) {

        User.find({}, function(err, users) {
            if (err) {
                res.send(err);
                return;
            }

            res.json(users);

        });
    });

    api.post('/login', function(req, res) {

        User.findOne({
            email: req.body.email
        }).select('name email password').exec(function(err, user) {

            if (err) throw err;

            if (!user) {

                res.send({ message: "User doesn't exist" });
            } else if (user) {

                var validPassword = user.comparePassword(req.body.password);

                if (!validPassword) {
                    res.send({ message: "Invalid Password" });
                } else {

                    ///// token
                    var token = createToken(user);

                    res.json({
                        success: true,
                        message: "Successfuly login!",
                        token: token
                    });
                }
            }
        });
    });

    api.use(function(req, res, next) {

        var token = req.body.token || req.param('token') || req.headers['x-access-token'];

        // check if token exist
        if (token) {

            jsonwebtoken.verify(token, secretKey, function(err, decoded) {

                if (err) {
                    res.status(403).send({ success: false, message: "Failed to authenticate user" });

                } else {

                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.status(403).send({ success: false, message: "No Token Provided" });
        }

    });




    api.route('/')

    .post(function(req, res) {

        var comment = new Comment({
            creator: req.decoded.name,
            content: req.body.content,
            numOfUp: 0,
            numOfDown: 0,
            upvotes: [],
            downvotes: []
        });

        comment.save(function(err, newComment) {
            if (err) {
                res.send(err);
                return
            }
            io.emit('comment', newComment)
            res.json({ message: "New Comment Created!" });
        });
    })


    .get(function(req, res) {

        Comment.find({}, function(err, comments) {

            if (err) {
                res.send(err);
                return;
            }
            console.log(comments)

            res.send(comments);
        });
    });

    api.post('/upvote', function(req, res) {

        Comment.findOne({ '_id': req.body.id }, function(err, comments) {

            if (err) {
                res.send(err);
                return;
            }

            var message;
            async.waterfall([
                function(callback) {
                    var array = comments.downvotes;
                    var numOfDown = comments.numOfDown
                    array.forEach(function(element, index, array) {
                        if (element === req.decoded.id) {
                            comments.downvotes.splice(index, 1)
                            numOfDown = comments.numOfDown - 1 
                        }
                    });
                    callback(null, numOfDown);
                },
                function(numOfDown, callback) {
                    var array = comments.upvotes;
                    var found = 0
                    array.forEach(function(element, index, array) {
                        if (element === req.decoded.id) {
                            found = 1;
                            comments.upvotes.splice(index, 1)
                        }
                    });
                    callback(null, numOfDown, found);
                },
                function(numOfDown, found, callback) {
                    if (found !== 1) {
                        comments.upvotes.push(req.decoded.id);
                        Comment.findOneAndUpdate({ "_id": req.body.id }, { $set: { "upvotes": comments.upvotes, "downvotes": comments.downvotes, "numOfDown": numOfDown }, $inc: { "numOfUp": 1 } }, { new: true }, function(err, newComments) {
                            if (err) {
                                console.log(err)
                                res.send(err);
                                return
                            }
                            message = newComments.numOfUp
                            callback(null, message);

                        })

                    } else {
                        Comment.findOneAndUpdate({ "_id": req.body.id }, { $set: { "numOfUp": comments.numOfUp - 1, "upvotes": comments.upvotes } }, { new: true }, function(err, newComments) {
                            if (err) {
                                console.log(err)
                                res.send(err);
                                return
                            }
                            message = newComments.numOfUp
                            callback(null, message);
                        })

                    }
                },
            ], function(err, result) {
                if (err) {
                    res.send(err);
                    return
                }
                res.json({ message: result })

                console.log(result)

            });
        });
    })
    api.post('/downvote', function(req, res) {

        Comment.findOne({ '_id': req.body.id }, function(err, comments) {

            if (err) {
                res.send(err);
                return;
            }

            var message;
            async.waterfall([
                function(callback) {
                    var array = comments.upvotes;
                    var found = 0
                    var numOfUp = comments.numOfUp
                    array.forEach(function(element, index, array) {
                        if (element === req.decoded.id) {
                            comments.upvotes.splice(index, 1)
                            numOfUp = comments.numOfUp - 1 
                        }
                    });
                    callback(null, numOfUp);
                },
                function(numOfUp, callback) {
                    var array = comments.downvotes;
                    var found = 0
                    array.forEach(function(element, index, array) {
                        if (element === req.decoded.id) {
                            found = 1;
                            comments.downvotes.splice(index, 1)
                        }
                    });
                    callback(null, numOfUp, found);
                },
                function(numOfUp, found, callback) {
                    if (found !== 1) {
                        comments.downvotes.push(req.decoded.id);
                        Comment.findOneAndUpdate({ "_id": req.body.id }, { $set: { "downvotes": comments.downvotes, "numOfUp": numOfUp, "upvotes" : comments.upvotes}, $inc: { "numOfDown": 1 } }, { new: true }, function(err, newComments) {
                            if (err) {
                                console.log(err)
                                res.send(err);
                                return
                            }
                            console.log(newComments)
                            message = newComments.numOfDown
                            callback(null, message);

                        })

                    } else {
                        Comment.findOneAndUpdate({ "_id": req.body.id }, { $set: { "numOfDown": comments.numOfDown - 1, "downvotes": comments.downvotes } }, { new: true }, function(err, newComments) {
                            if (err) {
                                console.log(err)
                                res.send(err);
                                return
                            }
                            console.log(newComments)
                            message = newComments.numOfDown
                            callback(null, message);
                        })

                    }
                },
            ], function(err, result) {
                if (err) {
                    res.send(err);
                    return
                }
                res.json({ message: "done" })

            });
        });
    })


    api.get('/me', function(req, res) {
        res.send(req.decoded);
    });




    return api;


}
