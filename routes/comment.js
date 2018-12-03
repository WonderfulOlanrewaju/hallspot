var Hall = require("../models/hall.js");
var Comment = require("../models/comment.js");
var express = require ("express");
var router = express.Router({ mergeParams: true });
// Comment Routes
router.get("/new", isLoggedIn, function (req, res) {
    Hall.findById(req.params.id, function (err, foundHall) {
        if (err) {
            console.log(err);
            res.redirect("/halls/" + req.params.id);
        } else {
            console.log(foundHall._id);
            res.render("comment/new", { hall: foundHall });
        }
    });
});

router.post("/", isLoggedIn, function (req, res) {
    Hall.findById(req.params.id, function (err, foundHall) {
        if (err) {
            res.redirect("/halls");
            console.log(err);
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    foundHall.comments.push(comment);
                    foundHall.save();
                    res.redirect("/halls/" + foundHall._id);
                }
            });
        }
    });
});

router.get("/:comment_id/edit", checkCommentOwnership, function(req, res){
    Hall.findById(req.params.id, function (err, hall){
        if(err){
            console.log(err);
            res.redirect(back);
        } else {
            Comment.findById(req.params.comment_id, function(err, comment){
                if (err){
                    console.log(err);
                    res.redirect(back);
                } else {
                    console.log(hall._id, comment);
                    res.render("comment/edit", {hall:hall, comment:comment});
                }
            });
        }
    });
});

// Update route for comments
router.put("/:comment_id", checkCommentOwnership, function(req, res){
    Hall.findById(req.params.id, function(err, hall){
        if (err) {
            console.log(err);
            res.redirect(back);
        } else {
            Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, comment){
                if (err){
                    console.log(err);
                    res.redirect("/halls/" + hall._id);
                } else {
                    console.log("comment edited");
                    res.redirect("/halls/"+hall._id );
                }
            });
        }
    });
});

router.delete("/:comment_id", checkCommentOwnership, function (req, res){
    Hall.findById(req.params.id, function(err, hall){
        if(err){
            console.log(err);
            res.redirect("back");
        } else {
            Comment.findByIdAndDelete(req.params.comment_id, function (err, comment){
                if (err){
                    console.log(err);
                    res.redirect("back");
                } else {
                    res.redirect("back");
                }
            });
        }
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect("/login");
    }
}

function checkCommentOwnership (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, comment) {
            if (err){
                console.log(err);
            } else {
                if (comment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    return next();
                }
                req.flash( "error", "You are not authorise to control other people's comment");
                res.redirect("/halls/"+ req.params.id);
            }
        });
    }
}

module.exports = router;