require('dotenv').config();
var express = require("express");
var app = express();
var mongoose = require("mongoose");
var seedDB = require("./seed");
var flash = require("connect-flash");
var User = 	require("./models/user.js");
var bodyParser = require("body-parser");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var expressSession = require("express-session");
var methodOverride = require('method-override');
var moment = require('moment');
moment().format();

// importing route files
var hallRoutes = require("./routes/hall");
var commentRoutes = require("./routes/comment"),
	indexRoutes = require("./routes/index");
	// seedDB();

	// Connect flash module configuration
app.use(flash());
// Mongoose configuration
// var url = 'mongodb://localhost:27017/hallspot';
mongoose.connect(process.env.DATABASEURL);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// BodyParser configuration
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// MethodOverride configuration
app.use(methodOverride('_method'));

// momentJs configuration
app.locals.moment = require('moment');
// Requiring and using express session used to encode/decode user session
app.use(expressSession({
	secret: "Boye is the best",
	resave:false,
	saveUninitialized: false,
}))
// Configuration of session in passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware to pass currentUser details into every route template
app.use(function (req, res, next) {
	res.locals.error  =  req.flash("error");
	res.locals.success  =  req.flash("success");
	res.locals.currentUser = req.user;
	next();
});

// Requiring routes (route templates)
app.use("/halls", hallRoutes);
app.use("/halls/:id/comments/", commentRoutes);
app.use("/", indexRoutes);

// Listening code
app.listen(process.env.PORT, process.env.IP, function(req, res){
	console.log("hallspot app started");
});
