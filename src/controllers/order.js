const Order = require("../models/order");
const Cart = require("../models/cart");
const { isValidObjectId } = require("mongoose");
exports.createOrder = async (req, res) => {
  try {
    const { userId } = req.params;
    const { cancellable, status} = req.body;
    const cartItem = await Cart.findOne({ userId: userId });
    if (!cartItem) {
      return res.status(404).json({ status: false, message: "cart not found" });
    }
    const items = cartItem.items;
    // const totalQuantity = cartItem.items.quantity
    const totalQuantity = items.reduce((total, items) => total + items.quantity,0);
    console.log(totalQuantity);
    if (items.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "there is no item left in the cart" });
    }
    const order = {
      userId: userId,
      items: items,
      totalPrice: cartItem.totalPrice,
      totalItems: cartItem.totalItems,
      totalQuantity: totalQuantity,
      cancellable: cancellable,
      status: status,
    };
    const orderCreate = await Order.create(order);

    // order de dene k bad hmara cart empty ho jana chahyie ye usi k code h.
    await Cart.updateOne(
      {
        userId: userId,
        // isDeleted : false
      },
      {
        items: [],
        totalPrice: 0,
        totalItems: 0,
      },
      {
        new: true,
      }
    );

    return res.status(201).json({
        status: true,
        message: "order successfully created",
        data: orderCreate,
      });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: false, message: "internal server error" });
  }
};




//  update order
exports.updateOrder = async (req, res) => {
  try {
    const { userId } = req.params;
    const { orderId, status } = req.body;

    if (!orderId) {
      return res
        .status(400)
        .json({ status: false, message: "oderId is required" });
    }
    if (!userId) {
      return res
        .status(400)
        .json({ status: false, message: "userId is required" });
    }
    if (!status) {
      return res
        .status(400)
        .json({ status: false, message: "status is required" });
    }

// agr hm status m koi v value de denge completed and cancelled ko chorkr to ye error dega.
    if (!(status === "completed" || status === "cancelled")) {
      return res.status(400).send({
          status: 400,
          message: "status can only be completed or cancelled",
        });
    }

// jis user n order diya h uska orderid and userid match krega database s aur sara data order m store ho jayega.
    const order = await Order.findOne({ _id: orderId, userId: userId });
    if (!order) {
      return res.status(404).send({ status: false, message: "order not given on given userId " });
    }

// yha p agr mera order k status database m cancelled h aur yha hm fir s koi api hit kr rhe h to ye message de dega , bcz ye ek bar to cancel ho hi chuka h to fir s iska status change ni hoga n .
    if (order.status === "cancelled") {
      return res.status(400).json({ status: false, message: "this order is already cancelled " });
    }

// yha p agr mera order k status database m completed h aur yha hm fir s koi api hit kr rhe h to ye message de dega
    if (order.status === "completed") {
      return res.status(400).send({ status: false, message: "this order is already completed" });
    }

// agr database k cancelleble m false h to ab ye order cancel nii ho payega.
// agr true h database k cancellable m to ye cancel ho jayega.
    if (order.cancellable === false) {
      return res.status(400).json({ status: false, message: "this order cannot be cancelled" });
    }

    order.status = status;
    order.cancellable = false;
    await order.save();
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        $set: {status:status}
      },
      {
        new: true,
      }
    );
    return res
      .status(200)
      .json({ status: true, message: "order updated ", data: updatedOrder });
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ status: false, message: "internal server error" });
  }
};

// Updates an order status Make sure the userId in params and in JWT token match. Make sure the user exist Get order id in request body Make sure the order belongs to the user Make sure that only a cancellable order could be canceled. Else send an appropriate error message and response.

