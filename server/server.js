const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { connect } = require('http2');
dotenv.config();
const connectDB=require('./config/database.config');
const corsMiddleware=require('./middlewares/cors-middleware');
const productRouter=require('./routes/product-router');//const helmet = require('helmet');
const FaQRouter= require('./routes/FAQ-router');
const wishlistRouter= require('./routes/wishlist-router')
const categoryRouter=require('./routes/category-router');
const cartRouter=require('./routes/cart-router');
const orderRouter=require('./routes/order-router');
const app = express();
app.use("/uploads",express.static(path.join(__dirname,'uploads')));
app.use(express.json());




app.use(corsMiddleware);
connectDB();
//import routes







const AppError = require('./utils/app-error.utils');
const globalErrorHandelar = require('./middlewares/errorHandelar-middleware');
const userRouter = require('./routes/user-router');


app.use('/api/users',userRouter);
app.use('/api/product',productRouter)
app.use('/api/faq',FaQRouter);
app.use('/api/wishlist',wishlistRouter);
app.use('/api/category',categoryRouter);
app.use('/api/cart',cartRouter);
app.use('/api/orders',orderRouter);




app.use((req,res,next)=>{
    next(new AppError(`can't find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandelar);





app.listen(process.env.PORT,()=>console.log(`server started at port ${process.env.PORT}`));