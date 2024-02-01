const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    fname:{
        type:String,
        required:true
    },
    lname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    profileImage:{
        type:String,
        // required:true
    },
    phone:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        min:8,
        max:15
    },
    role:{
        type:String,
        default: "user"
    },
    // address:{
    //     shipping:{
    //         street:{
    //             type:String,
    //             required:true
    //         },
    //         city:{
    //             type:String,
    //             required:true
    //         },
    //         pincode:{
    //             type:Number,
    //             required:true
    //         },
        
    //     },
    //     billing:{
    //         street:{
    //             type:String,
    //             required:true
    //         },
    //         city:{
    //             type:String,
    //             required:true
    //         },
    //         pincode:{
    //             type:Number,
    //             required:true
    //         }
    //     }
    // },
  
},{timestamp:true})
const User = mongoose.model("User",userSchema)
module.exports = User


