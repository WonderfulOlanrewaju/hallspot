var mongoose = require("mongoose");
var passportLocalMongoose = require('passport-local-mongoose');

// Schema for Halls
var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: String,
    email: {type: String, unique:true, required:true},
    password: String,
    avatar : String,
    avatarId: String,
    firstName: String,
    lastName: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {
        type: Boolean,
        default: false,
    },
    createdAt: { type: Date, default: Date.now },
});

userSchema.plugin(passportLocalMongoose);
// creating halls model/collection in the DB
var User = mongoose.model("User", userSchema);
module.exports = User;
