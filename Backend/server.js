import cookieParser from 'cookie-parser';
import express, { Router } from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoutes.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';

const app = express();

// Allow multiple origins
const allowedOrigins = ['http://localhost:5173', 'https://your-frontend-domain.vercel.app'];

// Connect to database and cloudinary
await connectDB();
await connectCloudinary();

// MIDDLEWARE CONFIGURATION
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Stripe webhook (needs to be before express.json())
app.post("/stripe", express.raw({type: "application/json"}), stripeWebhooks);

// Routes
app.get('/', (req, res) => {
    res.send("API is working");
});

app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/address", addressRouter);
app.use("/api/order", orderRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// For Vercel deployment - export the app (remove app.listen)
export default app;