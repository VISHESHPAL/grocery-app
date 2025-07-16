import express from 'express'
import { isSellerAuth, logout, sellerLogin } from '../controllers/sellerController.js';
import authSeller from '../middleware/authSeller.js';

const sellerRouter = express.Router();

sellerRouter.post('/login' , sellerLogin ) ;
sellerRouter.get('/is-auth' ,authSeller ,  isSellerAuth ) ;
sellerRouter.get('/logout' ,authSeller ,  logout ) ;


export  default sellerRouter;