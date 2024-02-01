const { isValidObjectId } = require("mongoose");
const Cart = require("../models/cart");
const Product = require("../models/product");
const User = require("../models/user")

exports.createCart = async (req, res) => {

  try {
    // Extracting data from request
    const { userId } = req.params;
    const { productId, cartId, quantity} = req.body;

    // Default quantity to 1 if not provided
    const defaultQuantity = 1;
    const actualQuantity = quantity || defaultQuantity;

    // Check if product and user IDs are valid
    if (!isValidObjectId(productId))
      return res
        .status(400)
        .send({ status: false, message: "Please provide a valid product ID" });
    if (!isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Please provide a valid user ID" });

    // Fetch product data
    const productData = await Product.findOne({
      _id: productId,
      isDeleted: false,
    });

    // Return error if product not found
    if (!productData) {
      return res
        .status(404)
        .send({ status: false, message: "Product not found" });
    }

    // Calculate product price
    const productPrice = productData.price;

    // Check if a cart with the given ID exists for the user
    const existingCart = await Cart.findOne({ userId: userId, _id: cartId });

    if (!existingCart) {
      // Create a new cart if it doesn't exist
      // const newCartData = {
      //     userId: userId,
      //     items: [{ productId: productId, quantity: actualQuantity }],
      //     totalPrice: (productPrice * actualQuantity),
      //     totalItems: 1,
      // };

      // Check if a cart with the same ID already exists
      // const checkExistingCart = await Cart.findOne({ userId: userId, _id: cartId });
      // if (checkExistingCart) return res.status(400).send({ status: false, message: "Please provide a valid cart ID" });

      // Create the new cart
      const createdCart = await Cart.create({
        userId: userId,
        items: [{ productId: productId, quantity: actualQuantity }],
        totalPrice: productPrice * actualQuantity,
        totalItems: 1,
      });

      return res.status(201).send({
        status: true,
        message: "Cart created successfully",
        data: createdCart,
      });
    } else {
      // Update existing cart if it already exists
      // agr phle s koi cart exist kr rha h to hm use update krenge and update k v 2 condition h yha
      // hm check krenge ki kya same product hi multiple times order kiya hua h
      // ya fir diffrent product order kiye gye h
      const cartItems = existingCart.items;
      let totalPrice = existingCart.totalPrice;
      let totalItems = existingCart.totalItems;

      let itemFound = false;

      // Check if the product is already in the cart
      // agr same product multiple time order kiya hua h to ye condition chlayenge.
      //agr mere cart m apple phone  4 bar hmne order kiya h av and phle s 1 apple phoone whi wala same , cart m tha means order kiya tha
      // to hmlog yha jitna product av dale h cart m 4 uska product id match krenge database wale product id s and uska quantity bdhate jayenge ek ek s
      // and itemfound k value true ho jayega
      for (let i = 0; i < cartItems.length; i++) {
        console.log(cartItems[i]);
        if (cartItems[i].productId === productId) {
          cartItems[i].quantity += actualQuantity;
          itemFound = true;
        }
      }

      if (itemFound) {
        // Update total price if the item is found
        totalPrice = actualQuantity * productPrice + totalPrice;

        const updatedCartData = {
          totalPrice: totalPrice,
          items: cartItems, // cartitmes.quantity k value aayega yha
          // phle wala 1 and av wala 4 total 5 hoga.
          totalItems: cartItems.length, // ye phle wla hi same rhega 1 .
          // bcz phle v hm applephone hi order kiye the 1 and av v hmne 4 applephone hi order kiya h to total item to ek hi h n av v sirf applephone.
        };

        const updatedCart = await Cart.findOneAndUpdate(
          { userId: userId },
          { $set: updatedCartData },
          { new: true }
        );

        return res.status(201).send({
          status: true,
          message: "Cart updated successfully",
          data: updatedCart,
        });
      } else {
        // Add the product to the cart if not found

        // agr hmne diffrent diffrent product order kiya h to ye condition chlega.
        // agr hmne phle s applephone order kiya tha aur av boat bluetooth order kiya h to us case m cartitems m to phle s sirf applephone hi tha store then
        // hm cartitems m ab new wala boat bluetooth v add (push) krna pdega .
        cartItems.push({ productId: productId, quantity: actualQuantity });
        totalPrice = productPrice * actualQuantity + totalPrice;
        totalItems += 1;

        // and yha cart k data ko update kr denge.
        const updatedCartData = {
          items: cartItems, // is cartitems m cartitems.push wala value gya.
          totalPrice: totalPrice.toFixed(2), // 102 line k value gya.
          totalItems: totalItems, // 103 line k value jayega
        };

        const updatedCart = await Cart.findOneAndUpdate(
          { userId: userId },
          { $set: updatedCartData },
          { new: true }
        );

        return res.status(201).send({
          status: true,
          message: "Cart updated successfully",
          data: updatedCart,
        });
      }
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: false, message: "cartId is required" });
  }
};



// get cart data


//get cart
exports.getCart = async (req, res) => {
  try {
    const getData = await Cart.find({ isDeleted: false });  // isdeleted false means jo data delete nii hua h usme s hme sara data chahyie(get)
    return res.status(200).json({ status: true, data: getData });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ status: false, message: "internal server error" });
  }
};



// // delete cart
exports.deleteCart = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
      return res
        .status(400)
        .json({ status: false, message: "userId is not valid" });
    }
    const updateToCart = await Cart.findOneAndUpdate(
      { userId: userId },
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!updateToCart) {
      return res.status(404).json({ status: false, message: "cart not exist" });
    }
    return res.status(204).json();
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ status: false, message: "internal server error" });
  }
};


// update cart
exports.updateCart = async function (req, res) {
  try {
     let data = req.body;
     let userId = req.params.userId

     let { cartId, productId, removeProduct } = data

     let findUser = await User.findById({ _id: userId })
     if (!findUser) return res.status(404).send({ status: false, message: "User not found" })

     if (!cartId) return res.status(400).send({ status: false, message: "please enter your cartId" })
     if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: "card Id is invalid" })

     const findCart = await Cart.findOne({ _id: cartId })
     if (!findCart) return res.status(404).send({ status: false, message: "Cart id not found" })

     if (!productId) return res.status(400).send({ status: false, message: "please enter your productId" })
     if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "product Id is invalid" })

     const findProduct = await Product.findOne({ _id: productId, isDeleted: false })
     if (!findProduct) return res.status(404).send({ status: false, message: "product not found" })

     if (![0, 1].includes(removeProduct)) return res.status(400).send({ status: false, message: "Remove product value should be  only in 0 or 1 " })

     for (let i = 0; i < findCart.items.length; i++) {

      // explanation below this code

         if (findProduct._id.toString() == findCart.items[i].productId.toString()) {
             if (removeProduct == 1 && findCart.items[i].quantity > 1) {
                 let updateCart = await Cart.findOneAndUpdate({ _id: cartId, "items.productId": productId }, { $inc: { "items.$.quantity": -1, totalPrice: -(findProduct.price) } }, { new: true }).select({ __v: 0, "items._id": 0 })
                 return res.status(200).send({ status: true, message: "cart updated successfully", data: updateCart })
             } else {
                 let updateCart = await Cart.findOneAndUpdate({ _id: cartId }, { $pull: { items: { productId: productId } }, $inc: { totalItems: -1, totalPrice: -(findProduct.price * (findCart.items[i].quantity)) } }, { new: true }).select({ __v: 0, "items._id": 0 })
                 return res.status(200).send({ status: true, message: "removed successfully", data: updateCart })
              }
         }
     } return res.status(404).send({ status: false, message: "product not found with cartId" })

 } catch (err) {
     return res.status(500).send({ status: false, message: err.message })
 }
}

// if part explanation line 280
// toString() - convert in string form
// $inc - increment hota h 1 s but agr -1 lga denge to minus ho jayega 1 s.
// $pull - remove krta h .
// agr findproduct ka productid  equal h findcart k items k productid ke , to fir check krenge ki agr mera removeproduct 1 k equal h and findcart k item k quantity 1 s bda h ,to hmlog jis cart ko update krna h uska cartid and productid dekr updatecart m value store kra lenge. 
// a/c to instrunction removeproduct 1 h to uske quantity ko 1 s minus krna hoga
// $inc s hmlog item k quantity ko 1 s minus kr denge to uska price v to 1 product k km krna hoga to uske liye findproduct k price to totalprice s minus kr diye h and last m value return kra diye . 


// else part explanation line 283
// agr removeproduct k value 1 nii hoga means agr 0 hoga to else k condition execute hoga.(agr 1 or 0 chorkr koi value hoga to upr validation k time p hi error de dega)
// cartid dekr updatecart m us cart k data ko store kra lenge and fir 
// a/c to instrunction agr removeproduct == 0 to hme us item ko hi pura k pura delete kr dena h (means uske items ko khali kr dena h , price ko 0 , quantity ko v 0 .....)
// $pull s hm phle remove kr denge items k product ko and then $inc s totalitem ko v -1 kr denge means 0 ho jayega ab (bcz phle if part m quantity 1 s jyada tha to offcourse yha quantity 1 hi hoga to , 1-1 == 0 ) totalitem v khali ho gya
// totalprice m hm product k price multiply kr denge cart k item k quantity s and fir use totalprice s minus kr denge to vo vi khali ho jayega means(0)
// ex:- 5000 * 10 = 50000     , 50000-50000 = 0 
// then use return kra denge hm 


// readme instrunction for update cart 
// PUT /users/:userId/cart (Remove product / Reduce a product's quantity from the cart)
// Updates a cart by either decrementing the quantity of a product by 1 or deleting a product from the cart. Get cart id in request body. Get productId in request body. Get key 'removeProduct' in request body. Make sure that cart exist. Key 'removeProduct' denotes whether a product is to be removed({removeProduct: 0}) or its quantity has to be decremented by 1({removeProduct: 1}). Make sure the userId in params and in JWT token match. Make sure the user exist Get product(s) details in response body. Check if the productId exists and is not deleted before updating the cart. Response format On success - Return HTTP status 200. Also return the updated cart document. The response should be a JSON object like this On error - Return a suitable error message with a valid HTTP status code. The response should be a JSON object like this