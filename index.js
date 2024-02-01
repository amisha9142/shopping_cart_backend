const express = require("express");
const mongoose = require("mongoose");
const userRoute = require("./src/routes/user");
const productRoute = require("./src/routes/product");
const cartRoute = require("./src/routes/cart")
const orderRoute = require("./src/routes/order")
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config({path:"./.env"})


const app = express();
app.use(express.json()); 

app.use("/api/user", userRoute);
app.use("/api/product",productRoute);
app.use("/api/cart",cartRoute);
app.use("/api/order",orderRoute);

app.use(multer().any());


// mongoose.connect(
//     "mongodb+srv://prashantpkc123:Prashant123@prashant.2lyameg.mongodb.net/shoppingCart"
//   )
//   .then(() => console.log("mongoDb is connected"))
//   .catch((err) => console.log(err));

mongoose.connect(process.env.DB).then(()=>{
    console.log("monogdb is connected.")
}).catch((error)=>{
    console.log(error)
})

const port = process.env.PORT

app.listen(port, function () {
  console.log("express app is running on port ", 3000);
});