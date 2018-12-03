require('dotenv').config();
var Hall = require("../models/hall.js");
var express = require("express");
var router = express.Router({ mergeParams: true });


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


// Index route for Halls
router.get("/", function (req, res) {
    Hall.find({}, function (err, foundhalls) {
        if (err) {
            console.log(err);
        } else {
            res.render("hall/index", { halls: foundhalls });
        }
    });
});

// New route for Hall
router.get("/new", isLoggedIn, function (req, res) {
    res.render("hall/new");
});

// Create route for Hall
router.post("/", isLoggedIn, upload.single('image'), function (req, res) {
    cloudinary.v2.uploader.upload(req.file.path, function (err, result) { 
        if(err){
            req.flash("error", "There is a problem Uploading your picture");
            return res.redirect ("/halls/new");
        }
        req.body.image = result.secure_url;
        req.body.imageId = result.public_id;
        
    var hallname = req.body.hallname;
    var price = req.body.price;
    var description = req.body.description;
    
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var hall = { title: hallname, price: price, image: req.body.image, imageId:req.body.imageId, description: description, author: author }
    Hall.create(hall, function (err, createdHall) {
        if (err) {
            console.log(err);
        } else {
            
            req.flash("success", createdHall.title+" succcessfully created");
            res.redirect("/halls/"+ createdHall._id);
        }
    });
    });
});


// Show route for halls
router.get("/:id", function (req, res) {
    var id = req.params.id;
    Hall.findById(id).populate("comments").exec(function (err, foundHall) {
        if (err) {
            console.log(err);
            console.log("error occured");
        } else {
            res.render("hall/show", { hall: foundHall });
        }
    });
});

// Edit Route for Halls
router.get("/:id/edit", checkHallOwnership, function (req, res) {
    var id = req.params.id;
    Hall.findById(id, function (err, foundHall) {
        if (err) {
            console.log(err);
        } else {
            res.render("hall/edit", { hall: foundHall });
        }
    });
});

// // Update Route for hall
// router.put("/:id", checkHallOwnership, upload.single('image'), function (req, res) {
//     cloudinary.v2.uploader.upload(req.file.path, function (err, result) {
//         if(err){
//             console.log(err);
//             req.flash("error", "There is a problem uploading your picture")
//         }
//         req.body.halls.image = result.secure_url;
//         req.body.halls.imageId = result.public_id;
//         Hall.findByIdAndUpdate(req.params.id, req.body.halls, function (err, editedHall) {
//             if (err) {
//                 console.log(err);
//             } else {
//                 console.log(editedHall.title + " edited")
//                 req.flash("success", editedHall.title+" was successfully edited");
//                 res.redirect("/halls/" + editedHall._id);
//             }
//         });
//     });
// });
router.put("/:id", checkHallOwnership, upload.single('image'), function (req, res) {
    Hall.findById(req.params.id, async function (err, hall) {
        if (err) {
            console.log(err);
            req.flash("error", "Something went wrong!");
            res.redirect("back");
        } else {
            if (req.file) {
                try {
                    console.log(hall.imageId);
                    await cloudinary.v2.uploader.destroy(hall.imageId);
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    hall.image = result.secure_url;
                    hall.imageId = result.public_id;
                    
                } catch (err) {
                    req.flash("error", "Something went wrong here!" );
                    return res.redirect("back");
                }
            }
            hall.title = req.body.halls.title;
            hall.description = req.body.halls.description;
            hall.price = req.body.halls.price;
            hall.save();
            req.flash("success", "Hall Successfully Updated!");
            res.redirect("/halls/" + hall._id);
        }
    });
});



// Delete route for halls
// router.delete("/:id", checkHallOwnership, function (req, res) {
//     Hall.findByIdAndDelete(req.params.id, function (err, deletedHall) {
//         if (err) {
//             console.log(err);
//         } else {
//             res.redirect("/halls");
//         }
//     });
// });
router.delete('/:id', function (req, res) {
    Hall.findById(req.params.id, async function (err, hall) {
        if (err) {
            req.flash("error", "Error finding your hall");
            return res.redirect("back");
        }
        try {
            await cloudinary.v2.uploader.destroy(hall.imageId);
            hall.remove();
            req.flash('success', 'Hall deleted successfully!');
            res.redirect('/halls');
        } catch (err) {
            if (err) {
                req.flash("error", "Error deleting hall");
                return res.redirect("back");
            }
        }
    });
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
      req.flash("error", "You need to be logged in")
        res.redirect("/login");
    }
}

function checkHallOwnership (req, res, next){
    if (req.isAuthenticated()) {
        Hall.findById (req.params.id, function(err, hall){
            if (err){
                console.log(err);
                res.render("/halls");
            } else {
                console.log(req.user._id);
                console.log(hall.author.id);
                if (hall.author.id.equals(req.user._id) || req.user.isAdmin) {
                    return next ()
                } 
                    req.flash ("error", "You cannot edit another man's property");
                    res.redirect("/halls/"+hall._id)             
            }
        });
    } else {
        req.flash("error", "You need to log in to do that")
        res.redirect("/halls/" + req.params.id);
    }
}

module.exports = router;
