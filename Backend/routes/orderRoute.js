import express from 'express'
import { getAllOrders, getUsersOrders, placeOrderCOD, placeOrderStripe } from '../controllers/orderController.js';
import authUser from '../middleware/authUser.js';
import authSeller from '../middleware/authSeller.js';

const orderRouter = express.Router();

orderRouter.post("/cod" ,authUser,  placeOrderCOD)
orderRouter.post("/stripe" ,authUser,  placeOrderStripe)

orderRouter.post("/user" ,authUser,  getUsersOrders)
orderRouter.get("/seller" ,authSeller,  getAllOrders)


export default orderRouter;