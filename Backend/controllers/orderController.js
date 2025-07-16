// Place Order COD  /api/order/cod
import Order from "../model/order.js";
import Product from "../model/product.js";
import Stripe from "stripe";
import User from "../model/User.js";

export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, address } = req.body; // Added userId here
    

    if (!userId || !address || !items || items.length === 0) {
      return res.json({
        success: false,
        message: "Invalid Data - userId, address, and items are required",
      });
    }

    // Calculate the data
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // add tax charge of 2%
    amount += Math.floor(amount * 0.02);

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });

    return res.json({
      success: true,
      message: "Order Placed Successfully!",
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
//  place order stripe  /api/order/stripe



const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, address } = req.body;
    const { origin } = req.headers;

    if (!userId || !address || !items || items.length === 0) {
      return res.json({
        success: false,
        message: "Invalid Data - userId, address, and items are required",
      });
    }

    let productData = [];
    let amount = 0;

    // Loop through items to calculate amount and prepare productData
    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      const itemTotal = product.offerPrice * item.quantity;
      amount += itemTotal;

      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
    }

    // Add 2% tax/charge
    amount += Math.floor(amount * 0.02);

    // Create order in DB
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    // Stripe Line Items
    const lineItems = productData.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
      },
      quantity: item.quantity,
    }));

    // Stripe session
    const session = await stripeInstance.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString(),
      },
    });

    return res.json({
      success: true,
      url: session.url,
    });

  } catch (error) {
    console.log(error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// setup stripe webhook 
export const stripeWebhooks = async () =>{
  // stripe gatway initailze

  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
   const sig = request.headers['stripe-signature'];

   let event ; 
   try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    
   } catch (error) {
      response.status(400).send(`Webhook Error : ${error.message}`)
   }

  //  Handle the event 

  switch (event.type) {
    case "payment_intent.succeeded":{
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent : paymentIntentId,
      });

      const {orderId , userId} = session.data[0].metadata


      // mark payment as paid
      await Order.findByIdAndUpdate(orderId , {ispaid: true})
      //  CLear the cart data

      await  User.findByIdAndUpdate(userId , {cartItem : {}})
      break;
    }
    case "payment_intent.payment_failed" :{
       const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id

      const session = await stripeInstance.checkout.sessions.list({
        payment_intent : paymentIntentId,
      });

      const {orderId} = session.data[0].metadata

      await Order.findOneAndDelete(orderId)
      break;
    }  
  
    default:
      console.error(`Unhandeled event type ${event.type}`)
      break;
  }
  response.json({
    received : true
  })
}

// get Order by the User ID  /api/order/user
export const getUsersOrders = async (req, res) => {
  try {
    const userId  = req.user._id;

    if (!userId) {
      return res.json({
        success: false,
        message: "userId is required",
      });
    }

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { ispaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// get all the orders for the seller and the admin /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { ispaid: true }],
    })
      .populate("items.product")
      .populate("address") // Populate separately for stability
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });

  } catch (error) {
    console.error("getAllOrders error:", error.message);
    
    // Only send a response if one hasn't already been sent
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch orders: " + error.message,
      });
    }
  }
};
