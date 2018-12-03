var mongoose = require("mongoose");
// Schema for Comment
var Schema = mongoose.Schema;

var commentSchema = new Schema({
    author: {
        id : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String,
    },
    text: String,
    createdAt: { type: Date, default: Date.now },
});

// creating halls model/collection in the DB

module.exports = mongoose.model("Comment", commentSchema);

