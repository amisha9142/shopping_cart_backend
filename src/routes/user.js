const express = require("express");

const { createUser, login, getUser, updateUser} = require("../controllers/user");
const { isAuthenticated, authorizeRoles} = require("../middleware/auth");
const route = express.Router();
const upload = require("../utilis/aws")


route.post("/createuser",upload.fields([{name:"profileImage"}]),createUser);
route.put("/updateuser/:id", upload.fields([{ name: "profileImage" }]), isAuthenticated,authorizeRoles("admin"),updateUser);  // authorizerole(admin) means sirf admin hi user k data ko update kr skta h ,role - user h to vo  ni kr skta h khud k data ko update.
// authenticated means agr koi user signup and login kr liya aur uske token to paste kr diya getdata k api m tb vo data access kr payega means vo ek valid user hoga.

route.post("/login",login);
route.get("/getusers",isAuthenticated,getUser);


module.exports = route