const express = require("express");
const { createOrder, updateOrder } = require("../controllers/order");
const { isAuthenticated, authorizeRoles } = require("../middleware/auth");
const route = express.Router();


route.post("/createOrder/:userId" ,isAuthenticated,authorizeRoles("user"), createOrder)
route.put("/updateorder/:userId",updateOrder)


module.exports = route;
