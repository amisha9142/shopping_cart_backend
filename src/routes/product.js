const express = require("express");
const { createProduct, getProduct, updateProduct, deleteProduct, getProductById } = require("../controllers/product");
const route = express.Router();
const upload = require("../utilis/aws");
const productImage = 'productImage';

route.post("/createproduct",upload.fields([{name:productImage}]),createProduct)
route.put("/updateproduct/:id",upload.fields([{name:productImage}]),updateProduct)
route.get("/get-product-by-filter",getProduct)
route.delete("/deleteproduct/:id",deleteProduct)

route.get("/getproductbyid/:id", getProductById)
module.exports = route;
