import cookieParser from 'cookie-parser';
import express, { Router } from 'express';
import cors from 'cors'
import connectDB from './configs/db.js';
import 'dotenv/config'
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';

const app = express();
const port = process.env.PORT || 4000;

// Allow multiple origins 
const allowedOrigins = ['http://localhost:5173']

// Connect to database and cloudinary
await connectDB(); 
await connectCloudinary();

// MIDDLEWARE CONFIGURATION
app.post("/stripe", express.raw({type: "application/json"}), stripeWebhooks)
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins , credentials : true }))

// Stripe webhook (needs to be before express.json())

// Routes
app.get('/' , (req, res) =>{  // ✅ Fixed: req first, then res
    res.send("API is working ");
})

app.use("/api/user" , userRouter)
app.use("/api/seller" , sellerRouter)
app.use("/api/product" , productRouter)
app.use("/api/cart" , cartRouter)
app.use("/api/address" , addressRouter)
app.use("/api/order" , orderRouter)

// Start server
app.listen(port , () =>{
    console.log(`Server is running on PORT ${port}`)
})

