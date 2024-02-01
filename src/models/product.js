const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    currencyId:{
        type:String,
        required:true
    },
    currencyFormat:{
        type:String,
        required:true
    },
    isFreeShipping:{
        type:Boolean,
        default:false
    },
    style:{
        type:String
    },
    productImage:{
        type:String,
        required:true
    },
    availableSizes:{
        type:String,
        enum:["S","XS","M","X","L","XL","XXL"],
        required:true
    },
    installments:{
        type:Number
    },
    deletedAt:{
        type:Date
    },
    isDeleted:{
        type:Boolean,
        default:false
    }

},{timestamp:true})

const Product = mongoose.model("Product",productSchema)
module.exports = Product

// FEATTURE II - Product Models Product Model { title: {string, mandatory, unique}, description: {string, mandatory}, price: {number, mandatory, valid number/decimal}, currencyId: {string, mandatory, INR}, currencyFormat: {string, mandatory, Rupee symbol}, isFreeShipping: {boolean, default: false}, productImage: {string, mandatory}, // s3 link style: {string}, availableSizes: {array of string, at least one size, enum["S", "XS","M","X", "L","XXL", "XL"]}, installments: {number}, deletedAt: {Date, when the document is deleted}, isDeleted: {boolean, default: false}, createdAt: {timestamp}, updatedAt: {timestamp}, } Products API (No authentication required)
