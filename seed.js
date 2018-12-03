var Hall = require("./models/hall.js");
var User = require("./models/user.js");

var datas = [
    {
        title: "De Glory Hall",
        author: "Saheed Yinka",
        image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=42b84bddac42421d6cccb79dc11c6d84&auto=format&fit=crop&w=600&q=60",
        price: "200000",
        description: "Huge hall, up to 4000 capacity with a well decorated high table"
    },
    {
        title: "Omega Hall",
        author: "Olanrewaju Olaboye",
        image: "https://images.unsplash.com/photo-1462446892934-2c17979efefd?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=ca3b2e3bded449c49be14cd0e33b7423&auto=format&fit=crop&w=600&q=60",
        price: "40000",
        description: "hugh corated high table"
    },
    {
        title: "Omega Hall",
        author: "Obang Olaj",
        image: "https://images.unsplash.com/photo-1519785051157-f48a1a372f8e?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=33490858f4ce49a6fed75bac7891e672&auto=format&fit=crop&w=600&q=60",
        price: "48000",
        description: "greater hall"
    },
    {
        title: "Town Hall woji",
        author: "Akorede Siju",
        image: "https://images.unsplash.com/photo-1519987519766-06f3f00495d8?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=aa38fd7bf0ab15d49a7d42fe24c6628e&auto=format&fit=crop&w=600&q=60",
        price: "780000",
        description: "best Port hacourt hall"
    },
    {
        title: "De Glory Hall",
        author: "Saheed Yinka",
        image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=42b84bddac42421d6cccb79dc11c6d84&auto=format&fit=crop&w=600&q=60",
        price: "200000",
        description: "Huge hall, up to 4000 capacity with a well decorated high table"
    },
    {
        title: "Omega Hall",
        author: "Olanrewaju Olaboye",
        image: "https://images.unsplash.com/photo-1462446892934-2c17979efefd?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=ca3b2e3bded449c49be14cd0e33b7423&auto=format&fit=crop&w=600&q=60",
        price: "40000",
        description: "hugh corated high table"
    },
    {
        title: "Omega Hall",
        author: "Obang Olaj",
        image: "https://images.unsplash.com/photo-1519785051157-f48a1a372f8e?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=33490858f4ce49a6fed75bac7891e672&auto=format&fit=crop&w=600&q=60",
        price: "48000",
        description: "greater hall"
    },
    {
        title: "Town Hall woji",
        author: "Akorede Siju",
        image: "https://images.unsplash.com/photo-1519987519766-06f3f00495d8?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=aa38fd7bf0ab15d49a7d42fe24c6628e&auto=format&fit=crop&w=600&q=60",
        price: "780000",
        description: "best Port hacourt hall"
    },
    {
        title: "De Glory Hall",
        author: "Saheed Yinka",
        image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=42b84bddac42421d6cccb79dc11c6d84&auto=format&fit=crop&w=600&q=60",
        price: "200000",
        description: "Huge hall, up to 4000 capacity with a well decorated high table"
    },
    {
        title: "Omega Hall",
        author: "Olanrewaju Olaboye",
        image: "https://images.unsplash.com/photo-1462446892934-2c17979efefd?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=ca3b2e3bded449c49be14cd0e33b7423&auto=format&fit=crop&w=600&q=60",
        price: "40000",
        description: "hugh corated high table"
    },
    {
        title: "Omega Hall",
        author: "Obang Olaj",
        image: "https://images.unsplash.com/photo-1519785051157-f48a1a372f8e?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=33490858f4ce49a6fed75bac7891e672&auto=format&fit=crop&w=600&q=60",
        price: "48000",
        description: "greater hall"
    },
    {
        title: "Town Hall woji",
        author: "Akorede Siju",
        image: "https://images.unsplash.com/photo-1519987519766-06f3f00495d8?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=aa38fd7bf0ab15d49a7d42fe24c6628e&auto=format&fit=crop&w=600&q=60",
        price: "780000",
        description: "best Port hacourt hall"
    }
];

function seedDB() {
    Hall.deleteMany({}, function (err, deleteHalls) {
        if (err) {
            console.log(err);
        } else {
            User.deleteMany({}, function(err, deletedUsers){
                    if(err){
                        console.log(err)
                    } else {
                        console.log("users deleted")
                    }
            });
            // datas.forEach(function (data) {
            //     Hall.create(data, function (err, createdData) {
            //         if (err) {
            //             console.log(err);
            //         } else {
            //             console.log("halls created");
            //         }
            //     });
            // });
        }
    });

}

module.exports = seedDB; 