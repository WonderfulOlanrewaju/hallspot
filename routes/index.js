var express = require ("express");
var router = express.Router({ mergeParams: true });
var passport = require ("passport");
var User = require("../models/user");
var Hall = require ("../models/hall");
var async= require("async");
var crypto = require("crypto");
var nodemailer = require ("nodemailer");
require('dotenv').config();

// Multer and cloudinary configuration
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter })

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'hallspot',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Landing page
router.get("/", function (req, res) {
    res.render("index/home");
});

// Login form route
router.get("/login", function (req, res) {
    res.render("index/login");
});

// Login Session creation Route
router.post("/login", passport.authenticate("local", {
    successRedirect: "/halls",
    successFlash: " You Successfully signed in",
    failureRedirect: "/login",
    failureFlash : "There's an error check your credentials or Sign up if you have no account"
}), function (req, res) {

});

router.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", " See you later!")
    res.redirect("/halls");
});

// Register form route
router.get("/register", function (req, res) {
    res.render("index/register");
});

// User Register Route
router.post('/register', upload.single('avatar'), function (req, res) {  
    cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
        if (err) {
            console.log(err);
            req.flash("error", "There is a problem Uploading your profile picture");
            return res.redirect("/register");
        }
        console.log(result);
        req.body.avatar = result.secure_url;
        req.body.avatarId = result.public_id;
        var newUser = new User ({ 
            username: req.body.username,
            email:req.body.email,
            avatar: req.body.avatar,
            avatarId: req.body.avatarId,
            firstName: req.body.firstName,
            lastName : req.body.lastName,
        });
        if(req.body.isAdmin === "123456789") {
            newUser.isAdmin = true;
        }
        User.register(newUser, req.body.password, function (err, userCreated) {    
            if (err) {
                console.log(err);
                req.flash("error", err.message);
                return res.redirect('/register');          
            }
            passport.authenticate('local')(req, res, function () {
                req.flash("success", req.user.username + " Your account has been successfully created and Logged in");
                res.redirect('/users/'+userCreated._id);
            });
        });
    });
});

// User Show Routes
router.get("/users/:id", function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) {
            console.log(err);
            req.flash("error", "Something is not right");
            res.redirect("/halls");
        } else {
            Hall.find().where("author.id").equals(user._id).exec(function (err, hall) {
                if (err) {
                    console.log(err);
                    req.flash("error", "Something went wrong");
                } else {
                    res.render("user/show", { user: user, halls: hall });
                }
            })
        }
    });
});

// Password forgot route
router.get("/forgot", function(req, res){
    res.render("index/forgot");
});

router.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'eyiwumiolaboye@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'eyiwumiolaboye@gmail.com',
                subject: 'Hallspot.com Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', function (req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('index/reset', { token: req.params.token });
    });
});

router.post('/reset/:token', function (req, res) {
    async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm_password) {
                    user.setPassword(req.body.password, function (err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function (err) {
                            req.logIn(user, function (err) {
                                done(err, user);
                            });
                        });
                    })
                } else {
                    req.flash("error", "Passwords do not match.");
                    return res.redirect('back');
                }
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'eyiwumiolaboye@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'eyiwumiolaboye@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function (err) {
        res.redirect('/halls');
    });
});


module.exports = router;