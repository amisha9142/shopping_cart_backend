const express = require("express")
const { createCart, deleteCart, getCart, updateCart } = require("../controllers/cart")
const { isAuthenticated } = require("../middleware/auth")
const route = express.Router()

route.post("/createCart/:userId",isAuthenticated,createCart)
route.delete("/deleteCart/:userId",deleteCart)
route.get("/getdata",getCart)
route.put("/updateCart/:userId",updateCart)

module.exports = route
