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

// Place Order Stripe  /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, address } = req.body;
    
    if (!userId || !address || !items || items.length === 0) {
      return res.json({
        success: false,
        message: "Invalid Data - userId, address, and items are required",
      });
    }

    // Calculate the amount
    let amount = await items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }
      return (await acc) + product.offerPrice * item.quantity;
    }, 0);

    // Add tax charge of 2%
    amount += Math.floor(amount * 0.02);

    // Create order first
    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
      isPaid: false,
      paymentStatus: 'pending'
    });

    // Create Stripe checkout session
    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.name || 'Product',
          },
          unit_amount: Math.round(item.price * 100), // Convert to paisa
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString()
      }
    });

    return res.json({
      success: true,
      message: "Stripe payment session created",
      session_url: session.url,
      orderId: order._id
    });

  } catch (error) {
    console.error('Stripe payment error:', error);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
// setup stripe webhook 
export const stripeWebhooks = async (req, res) => {  // ✅ Fixed: Added req, res parameters
    try {
        // Initialize Stripe
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        
        // Get signature from headers
        const sig = req.headers['stripe-signature'];  // ✅ Fixed: req instead of request
        
        if (!sig) {
            return res.status(400).send('No signature found');
        }
        
        let event;
        
        try {
            // Construct event from webhook
            event = stripeInstance.webhooks.constructEvent(
                req.body,  // ✅ Fixed: req instead of request
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (error) {
            console.error('Webhook signature verification failed:', error.message);
            return res.status(400).send(`Webhook Error: ${error.message}`);  // ✅ Fixed: res instead of response
        }
        
        // Handle the event
        switch (event.type) {
            case "payment_intent.succeeded": {
                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;
                
                try {
                    // Get checkout session
                    const sessions = await stripeInstance.checkout.sessions.list({
                        payment_intent: paymentIntentId,
                    });
                    
                    if (sessions.data.length === 0) {
                        console.error('No session found for payment intent:', paymentIntentId);
                        break;
                    }
                    
                    const session = sessions.data[0];
                    const { orderId, userId } = session.metadata;
                    
                    if (!orderId || !userId) {
                        console.error('Missing metadata in session:', session.id);
                        break;
                    }
                    
                    // Mark payment as paid
                    const updatedOrder = await Order.findByIdAndUpdate(
                        orderId, 
                        { 
                            isPaid: true,  // ✅ Fixed: isPaid instead of ispaid
                            paymentIntentId: paymentIntentId,
                            paymentStatus: 'completed'
                        },
                        { new: true }
                    );
                    
                    if (!updatedOrder) {
                        console.error('Order not found:', orderId);
                        break;
                    }
                    
                    // Clear the cart data
                    await User.findByIdAndUpdate(userId, { 
                        cartItem: {} 
                    });
                    
                    console.log('Payment succeeded for order:', orderId);
                    
                } catch (error) {
                    console.error('Error handling payment_intent.succeeded:', error);
                }
                break;
            }
            
            case "payment_intent.payment_failed": {
                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;
                
                try {
                    // Get checkout session
                    const sessions = await stripeInstance.checkout.sessions.list({
                        payment_intent: paymentIntentId,
                    });
                    
                    if (sessions.data.length === 0) {
                        console.error('No session found for failed payment:', paymentIntentId);
                        break;
                    }
                    
                    const session = sessions.data[0];
                    const { orderId } = session.metadata;
                    
                    if (!orderId) {
                        console.error('Missing orderId in session metadata:', session.id);
                        break;
                    }
                    
                    // Delete the order or mark as failed
                    await Order.findByIdAndUpdate(orderId, {
                        paymentStatus: 'failed',
                        isPaid: false
                    });
                    
                    console.log('Payment failed for order:', orderId);
                    
                } catch (error) {
                    console.error('Error handling payment_intent.payment_failed:', error);
                }
                break;
            }
            
            default:
                console.log(`Unhandled event type: ${event.type}`);  // ✅ Fixed: log instead of error
                break;
        }
        
        // Send success response
        res.json({ received: true });  // ✅ Fixed: res instead of response
        
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
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
