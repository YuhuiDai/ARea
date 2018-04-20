var express = require('express');
var Request = require('request');
var bodyParser = require('body-parser');
var busboyBodyParser = require('busboy-body-parser');
var path = require('path');
var fs = require('fs');
var port = process.env.PORT || 3000;
var app = express();
var mongoose = require('mongoose');
var multer = require('multer');
var cookieParser = require('cookie-parser');
var session = require('express-session');
const url = require('url');
const User = require('./public/js/models/User.js');

//Set up the views directory
app.set("views", __dirname + '/views');
//Set EJS as templating language WITH html as an extension
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
//Add connection to the public folder for css & js files
app.use(express.static(__dirname + '/public'));

//app.use(multer({ dest: './uploads/', rename: function (fieldname, filename) {return filename;}}));
// Set The Storage Engine
 const storage = multer.diskStorage({
     destination: './public/uploads/',
     filename: function(req, file, cb){
         cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
     }
 });
// // Init Upload
const upload = multer({
     storage: storage,
     limits:{fileSize: 2000000},
     fileFilter: function(req, file, cb){
         checkFileType(file, cb);
     }
 });
//const upload = multer({ dest: 'uploads/' })
function checkFileType(file, cb){
    console.log("checking the file type");
    // Allowed ext
    const filetypes = /jpeg|jpg|png/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null,true);
    } else {
        cb('Error: Images Only!');
    }
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser());
//app.use(busboyBodyParser());
app.use(cookieParser());
app.use(session({secret: 'ARea session', resave: true, saveUninitialized: false}));

mongoose.connect('mongodb://localhost/userdb');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {});


app.get("/", function (req, res) {
    console.log("Login Page");
    res.render('login');
});

app.post("/createUser", function (req, res) {
    console.log("Post to CreateUser");
    console.log("BODY",req.body);

    if (!req.body.username) {
        return res.sendStatus(500);
    }
    if (req.body.user_status && req.body.username && req.body.password && req.body.passwordConf) {
        if (req.body.password == req.body.passwordConf) {
            var userData = {
                username: req.body.username,
                password: req.body.password,
            }
            //use schema.create to insert data into the db
            User.create(userData, function (err, user) {
                if (err) {
                    return next(err)
                } else {
                    console.log(user);
                    return res.cookie('username', req.body.username).redirect('/guideline');
                }
            });
        }
    }
});

app.post("/login", function (req, res) {
    console.log("Put to Login");
    console.log(req.body);
    User.find({username: req.body.username, password:req.body.password}, function (err, curr_user) {
        if (err) {
            console.log(err);
        }
        console.log(curr_user[0]);
        if (curr_user == null) {
            return res.sendStatus(500);
        }
        var section = curr_user[0].section;
        var username = curr_user[0].username;
        if (section == 1) res.cookie('username', username).redirect("/personal");
        else if (section == 2) res.cookie('username', username).redirect("/profile");
        else if (section == 3) res.cookie('username', username).redirect("/bio");
        else if (section == 4) res.cookie('username', username).redirect("/fun_facts");
        else if (section == 5) res.cookie('username', username).redirect("/marker");
        else if (section == 6) res.cookie('username', username).redirect("/summary");
    });
});

app.get("/guideline", function (req, res) {
    console.log(req.cookies.username);
    User.find({username: req.cookies.username}, function (err, curr_user) {
        if (err) {
            console.log(err);
        }
        if (curr_user == null) {
            return res.sendStatus(500);
        }

        res.cookie('username', req.cookies.username).render('guideline', {section: curr_user[0].section});
    });

});

app.get("/personal", function (req, res) {
    console.log("personal Page");
    console.log(req.cookies.username);
    User.find({username: req.cookies.username}, function (err, curr_user) {
        if (err) {
            console.log(err);
        }
        if (curr_user == null) {
            return res.sendStatus(500);
        }
        res.cookie('username', req.cookies.username).render('personal_info', {section: curr_user[0].section});
    });
});

app.post("/personal", function (req, res) {
    console.log("personal post",req.cookies.username);
    console.log(req.body);
        User.find({username: req.cookies.username}, function (err, curr_user) {
            if (err) {
                console.log(err);
            }
            if (curr_user == null) {
                return res.sendStatus(500);
            }
            var personalData = {
                email: req.body.email,
                LinkedIn: req.body.linkedIn,
                Title: req.body.work_title,
                Department: req.body.department,
                lastName: req.body.last_name,
                firstName: req.body.first_name
            };
            curr_user[0].information.personal = personalData;
            curr_user[0].section = Math.max(2, curr_user[0].section);
            curr_user[0].save(function(err, info) {
                if (err) {
                    return console.error(err);
                } else {
                    console.log("saving from personal page");
                    console.log(info);
                }

            });
        });

    if (req.body.myButton == "Save & Exit") res.redirect("/");
    else res.cookie('username', req.cookies.username).redirect("/profile");
});

app.get("/profile", function (req, res) {
    console.log("profile Page");
    console.log(req.cookies.username);
    User.find({username: req.cookies.username}, function (err, curr_user) {
        if (err) {
            console.log(err);
        }
        if (curr_user == null) {
            return res.sendStatus(500);
        }
        res.cookie('username', req.cookies.username).render('profile_pic', {section: curr_user[0].section});
    });
});

app.post("/profile", upload.single('profile_pic'), function (req, res, next) {
    console.log("profile post",req.cookies.username);
    console.log(req.file);
    if (req.file) {
        User.find({username: req.cookies.username}, function (err, curr_user) {
            if (err) {
                console.log(err);
            }
            if (curr_user == null) {
                return res.sendStatus(500);
            }
            curr_user[0].information.profilePic = req.file.filename;
            curr_user[0].section = Math.max(3, curr_user[0].section);
            curr_user[0].save(function(err, info) {
                if (err) {
                    return console.error(err);
                } else {
                    console.log("saving from profile page");
                    console.log(info);
                }

            });
        });
    } else {
        res.cookie('username', req.cookies.username).render('profile_pic', {msg:"NO IMAGE UPLOADED"})
    }

    if (req.body.myButton == "Save & Exit") res.redirect("/");
    else res.cookie('username', req.cookies.username).redirect("/bio");
});

app.get("/bio", function (req, res) {
    console.log("bio Page");
    console.log('bio: ', req.cookies.username);
    User.find({username: req.cookies.username}, function (err, curr_user) {
        if (err) {
            console.log(err);
        }
        if (curr_user == null) {
            return res.sendStatus(500);
        }
        res.cookie('username', req.cookies.username).render('bio', {section: curr_user[0].section});
    });
});

app.post("/bio", function (req, res) {
    console.log(req.body);
    User.find({username: req.cookies.username}, function (err, curr_user) {
        if (err) {
            console.log(err);
        }
        if (curr_user == null) {
            return res.sendStatus(500);
        }
        curr_user[0].information.bio = req.body.note;
        curr_user[0].section = Math.max(4, curr_user[0].section);
        curr_user[0].save(function(err, info) {
            if (err) {
                return console.error(err);
            } else {
                console.log("saving from bio page");
                console.log(info);
            }

        });
    });
    if (req.body.myButton == "Save & Exit") res.redirect("/");
    else res.cookie('username', req.cookies.username).redirect("/fun_facts");
});

app.get("/fun_facts", function (req, res) {
    console.log("fun Page");
    console.log('fun user: ', req.cookies.username);
    User.find({username: req.cookies.username}, function (err, curr_user) {
        if (err) {
            console.log(err);
        }
        if (curr_user == null) {
            return res.sendStatus(500);
        }
        res.cookie('username', req.cookies.username).render('fun_facts', {section: curr_user[0].section});
    });
});

app.post("/fun_facts", function (req, res) {
    console.log(req.cookies.username);
    User.find({username: req.cookies.username}, function (err, curr_user) {
        if (err) {
            console.log(err);
        }
        if (curr_user == null) {
            return res.sendStatus(500);
        }
        var fun = {
            fun1: req.body.fun_fact1,
            fun2: req.body.fun_fact2,
            fun3: req.body.fun_fact3,
        };
        curr_user[0].information.fun_facts = fun;
        curr_user[0].section = Math.max(5, curr_user[0].section);
        curr_user[0].save(function(err, info) {
            if (err) {
                return console.error(err);
            } else {
                console.log("saving from fun page");
                console.log(info);
            }

        });
    });
    if (req.body.myButton == "Save & Exit") res.redirect("/");
    else res.cookie('username', req.cookies.username).redirect("/marker");
});

app.get("/marker", function (req, res) {
    console.log("marker Page");
    console.log('maker user: ', req.cookies.username);
    User.find({username: req.cookies.username}, function (err, curr_user) {
        if (err) {
            console.log(err);
        }
        if (curr_user == null) {
            return res.sendStatus(500);
        }
        res.cookie('username', req.cookies.username).render('marker', {section: curr_user[0].section});
    });
});

app.post("/marker", upload.single('marker_pic'), function (req, res, next) {
    console.log("marker Page-----required file");
    console.log(req.file);
    if (req.file) {
        User.find({username: req.cookies.username}, function (err, curr_user) {
            if (err) {
                console.log(err);
            }
            if (curr_user == null) {
                return res.sendStatus(500);
            }

            curr_user[0].marker = req.file.filename;
            curr_user[0].section = Math.max(6, curr_user[0].section);
            curr_user[0].save(function(err, info) {
                if (err) {
                    return console.error(err);
                } else {
                    console.log("saving from marker page");
                    console.log(info);
                }
                res.cookie('username', req.cookies.username).redirect("/summary"); // todo: display the uploaded image or text
            });
        });
    } else {
        console.log("NNNNNOOOOOOO IMAGE")
        res.render("marker",{msg: "NO IMAGE UPLOADED"})
    }
    if (req.body.myButton == "Save & Exit") res.redirect("/");

});

app.get("/summary", function (req, res) {

    User.find({username: req.cookies.username}, function (err, curr_user) {
        if (err) {
            console.log(err);
        }
        if (curr_user == null) {
            return res.sendStatus(500);
        }

        res.cookie('username', req.cookies.username).render('summary',{section: curr_user[0].section});
    });
});


app.get("/userInfo", function (req, res) {

    User.find({username: req.cookies.username}, function (err, curr_user) {
        if (err) {
            console.log(err);
        }
        if (curr_user == null) {
            return res.sendStatus(500);
        }

        res.json(curr_user[0]);
    });
});


app.listen(port);
console.log('Express started on port '+ port);