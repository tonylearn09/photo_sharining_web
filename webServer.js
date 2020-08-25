"use strict";

/* jshint node: true */

/*
 * This builds on the webServer of previous projects in that it exports the current
 * directory via webserver listing on a hard code (see portno below) port. It also
 * establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch any file accessible
 * to the current user in the current directory or any of its children.
 *
 * This webServer exports the following URLs:
 * /              -  Returns a text status message.  Good for testing web server running.
 * /test          - (Same as /test/info)
 * /test/info     -  Returns the SchemaInfo object from the database (JSON format).  Good
 *                   for testing database connectivity.
 * /test/counts   -  Returns the population counts of the cs142 collections in the database.
 *                   Format is a JSON object with properties being the collection name and
 *                   the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the database.
 * /user/list     -  Returns an array containing all the User objects from the database.
 *                   (JSON format)
 * /user/:id      -  Returns the User object with the _id of id. (JSON format).
 * /photosOfUser/:id' - Returns an array with all the photos of the User (id). Each photo
 *                      should have all the Comments on the Photo (JSON format)
 *
 */

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var async = require('async');

var fs = require("fs");

// Load the Mongoose schema for User, Photo, and SchemaInfo
var User = require('./schema/user.js');
var Photo = require('./schema/photo.js');
var SchemaInfo = require('./schema/schemaInfo.js');

// middleware
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');

var processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');

var express = require('express');
var app = express();

// XXX - Your submission should work without this line. Comment out or delete this line for tests and before submission!
//var cs142models = require('./modelData/photoApp.js').cs142models;

mongoose.connect('mongodb://localhost/cs142project6', { useNewUrlParser: true, useUnifiedTopology: true });

// We have the express static module (http://expressjs.com/en/starter/static-files.html) do all
// the work for us.
app.use(express.static(__dirname));

// Use middle ware
app.use(session({secret: 'secretKey', resave: false, saveUninitialized: false}));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.send('Simple web server of files from ' + __dirname);
});

/*
 * Use express to handle argument passing in the URL.  This .get will cause express
 * To accept URLs with /test/<something> and return the something in request.params.p1
 * If implement the get as follows:
 * /test or /test/info - Return the SchemaInfo object of the database in JSON format. This
 *                       is good for testing connectivity with  MongoDB.
 * /test/counts - Return an object with the counts of the different collections in JSON format
 */
app.get('/test/:p1', function (request, response) {
    // Express parses the ":p1" from the URL and returns it in the request.params objects.
    console.log('/test called with param1 = ', request.params.p1);

    var param = request.params.p1 || 'info';

    if (param === 'info') {
        // Fetch the SchemaInfo. There should only one of them. The query of {} will match it.
        SchemaInfo.find({}, function (err, info) {
            if (err) {
                // Query returned an error.  We pass it back to the browser with an Internal Service
                // Error (500) error code.
                console.error('Doing /user/info error:', err);
                response.status(500).send(JSON.stringify(err));
                return;
            }
            if (info.length === 0) {
                // Query didn't return an error but didn't find the SchemaInfo object - This
                // is also an internal error return.
                response.status(500).send('Missing SchemaInfo');
                return;
            }

            // We got the object - return it in JSON format.
            console.log('SchemaInfo', info[0]);
            response.end(JSON.stringify(info[0]));
        });
    } else if (param === 'counts') {
        // In order to return the counts of all the collections we need to do an async
        // call to each collections. That is tricky to do so we use the async package
        // do the work.  We put the collections into array and use async.each to
        // do each .count() query.
        var collections = [
            {name: 'user', collection: User},
            {name: 'photo', collection: Photo},
            {name: 'schemaInfo', collection: SchemaInfo}
        ];
        async.each(collections, function (col, done_callback) {
            col.collection.countDocuments({}, function (err, count) {
                col.count = count;
                done_callback(err);
            });
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                var obj = {};
                for (var i = 0; i < collections.length; i++) {
                    obj[collections[i].name] = collections[i].count;
                }
                response.end(JSON.stringify(obj));

            }
        });
    } else {
        // If we know understand the parameter we return a (Bad Parameter) (400) status.
        response.status(400).send('Bad param ' + param);
    }
});

/*
 * URL /user/list - Return all the User object.
 */
app.get('/user/list', function (request, response) {
    if (!request.session.user_id) {
        // 401 (Unauthorized)
        response.status(401).send("not logged in");
        return;
    }
    User.find({}, (err, allUsers) => {
        let allNewUsers = allUsers;
        async.eachOf(allUsers, function (user, i, done_callback) {
            let {_id, first_name, last_name} = user;
            allNewUsers[i] = {_id, first_name, last_name};
            done_callback();
        }, function (err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                response.status(200).send(allNewUsers);
            }
        })
    });
    //response.status(200).send(cs142models.userListModel());
});

/*
 * URL /user/:id - Return the information for User (id)
 */
app.get('/user/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("not logged in");
        return;
    }

    var id = request.params.id;

    User.findOne({_id: id}, (err, user) => {
        if (err) {
            console.log('User with _id:' + id + ' not found.');
            response.status(400).send('Not found');
        } else {
            const {_id, first_name, last_name, location, description, occupation} = user;
            const newUser = {_id, first_name, last_name, location, description, occupation};
            //let newUser = JSON.parse(JSON.stringify(user));
            //delete newUser.__v;
            response.status(200).send(newUser);
        }
    });
});

/*
 * URL /photosOfUser/:id - Return the Photos for User (id)
 */
app.get('/photosOfUser/:id', function (request, response) {
    if (!request.session.user_id) {
        response.status(401).send("not logged in");
        return;
    }

    var id = request.params.id;

    Photo.find({user_id: id}, (err, photos) => {
        if (err) {
            console.log('Photos for user with _id:' + id + ' not found.');
            response.status(400).send('Not found');
            return;
        }

        let newPhotos = JSON.parse(JSON.stringify(photos));
        async.eachOf(newPhotos, function(photo, i, done_callback) {
            delete photo.__v;
            async.eachOf(photo.comments, function(comment, i, done_callback_comment) {
                const commentUser = User.findOne({_id: comment.user_id}, (err) => {
                    if (err) {
                        throw err;
                    }
                });
                commentUser.then((user) => {
                    const {_id, first_name, last_name} = user;
                    photo.comments[i] = {
                        comment: comment.comment,
                        date_time: comment.date_time,
                        _id: comment._id,
                        user: {
                            _id: _id,
                            first_name: first_name,
                            last_name: last_name
                        }
                    };
                    done_callback_comment();
                });
            }, function(err) {
                if (err) {
                    //console.log(err);
                    throw err;
                } else {
                    newPhotos[i] = photo;
                    done_callback();
                }
            });
        }, function(err) {
            if (err) {
                response.status(500).send(JSON.stringify(err));
            } else {
                response.status(200).send(newPhotos);
            }
        });
    });

});

app.post("/admin/login", function(request, response) {
    //console.log(request.session.cookie);
    // request.session is an object you can read or write (due to session)
    // parameter in request body is accessed using request.body.parameter_name (due to body-parser)
    const loginName = request.body.login_name;
    const password = request.body.password;
    User.findOne({login_name: loginName}, (err, user) => {
        if (err || !user) {
            console.log("User with login_name:" + loginName + " not found.");
            response.status(400).send("Login name was not recognized");
            return;
        }

        if (user.password != password) {
            response.status(400).send("Wrong password");
            return;
        }

        request.session.login_name = loginName;
        request.session.user_id = user._id;
        //request.session.cookie.reSave = true;
        //request.session.cookie.originalMaxAge = 1000000000000000;
        const { _id, first_name, last_name, login_name } = user;
        const newUser = { _id, first_name, last_name, login_name };
        response.status(200).send(newUser);
    });
});

app.post("/admin/logout", function(request, response) {
    if (!request.session.user_id) {
        response.status(400).send("User is not logged in");
        return;
    }
    request.session.destroy(function(err) {
        if (err) {
            response.status(400).send("unable to logout");
            return;
        }
        response.status(200).send("logout success");
    });
});

app.post("/commentsOfPhoto/:photo_id", function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("User is not logged in");
        return;
    }

    const photo_id = request.params.photo_id;
    const current_user_id = request.session.user_id;
    const comment_text = request.body.comment;
    if (!comment_text) {
        response.status(400).send("invalid comment request");
        return;
    }

    Photo.findOne({_id: photo_id}, function(err, photo) {
        if (err) {
            response.status(400).send("invalid photo id");
            return;
        }
        const now = new Date();
        photo.comments = photo.comments.concat([
            { comment: comment_text, date_time: now, user_id: current_user_id }
        ]);
        photo.save()
            .then(photo => {response.status(200).send("Comments sucessfully added");})
            .catch(err => {
                console.log("Adding comments error: ", err);
                response.status(400).send(JSON.stringify(error));
            });
    });
});

app.post("/photos/new", function(request, response) {
    if (!request.session.user_id) {
        response.status(401).send("not logged in");
        return;
    }

    // place uploaded file in images directory
    // make new photo object and store in database;

    processFormBody(request, response, function(err) {
        if (err || !request.file) {
            response.status(400).send("image file invalid");
            return;
        }

        // request.file has the following properties of interest
        //      fieldname      - Should be 'uploadedphoto' since that is what we sent
        //      originalname:  - The name of the file the user uploaded
        //      mimetype:      - The mimetype of the image (e.g. 'image/jpeg',  'image/png')
        //      buffer:        - A node Buffer containing the contents of the file
        //      size:          - The size of the file in bytes

        // XXX - Do some validation here.
        // We need to create the file in the directory "images" under an unique name. We make
        // the original file name unique by adding a unique prefix with a timestamp.
        let timestamp = new Date().valueOf();
        let filename = "U" + String(timestamp) + request.file.originalname;
        fs.writeFile("./images/" + filename, request.file.buffer, function(err) {
            // XXX - Once you have the file written into your images directory under the name
            // filename you can create the Photo object in the database
            if (err) {
                response.status(400).send("unable to write file");
                return;
            }

            Photo.create({
                file_name: filename,
                date_time: timestamp,
                user_id: request.session.user_id,
                comments: []
            }).then(photoObj => {
                photoObj.save();
                response.status(200).send("Successfully create photo");
            }).catch(err => {
                console.error("Error saving photo")
                response.status(400).send("Unable to create new photo");
            });

        });
    });
});


app.post("/user", function(request, response) {
    const {
        login_name,
        password,
        first_name,
        last_name,
        location,
        description,
        occupation
    } = request.body;

    if (!password || !first_name || !last_name || !login_name) {
        console.error("User information not valid")
        response.status(400).send("User information not valid");
        return;
    }

    // verfiy the login_name doesn't exist
    User.findOne({login_name: login_name}, function(err, user) {
        if (user) {
            response.status(400).send("Username is already taken.")
            return;
        }

        User.create({
            login_name, password, first_name, last_name, 
            location, description, occupation
        }).then(userObj => {
            userObj.save();
            request.session.login_name = login_name;
            request.session.user_id = userObj._id;
            const curr_user = {_id: userObj._id, first_name, last_name, login_name }
            response.status(200).send(curr_user);
        }).catch(err => {
            console.error('Registering user error: ', error);
            response.status(400).send(JSON.stringify(error));
        });
    });
});


var server = app.listen(3000, function () {
    var port = server.address().port;
    console.log('Listening at http://localhost:' + port + ' exporting the directory ' + __dirname);
});


