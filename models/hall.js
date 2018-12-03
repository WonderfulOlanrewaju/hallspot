var mongoose = require("mongoose");
// Schema for Halls
var Schema = mongoose.Schema;

var hallSchema = new Schema({
    title: String,
    author: {
        id : {
            type:mongoose.Schema.Types.ObjectId,
            ref : "User"
        },
        username: String,
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        } 
    ],
    image: String,
    imageId: String,
    price: String,
    description: String,
    createdAt: { type: Date, default: Date.now },
});

// creating halls model/collection in the DB
var Hall = mongoose.model("Hall", hallSchema);

module.exports = Hall;