const jwt = require('jsonwebtoken');
const User=require('../models/user-model');

exports.authenticate=async(req,res,next)=>{
    const authHeader= req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
      return  res.status(401).json({message:'No Token Provided'});
    }
    const token = authHeader.split(' ')[1];

    
    try{
        const decode = jwt.verify(token,process.env.JWT_KEY);
       const user =  await User.findById(decode.id).select('-password');
req.user = user;
     next();
    
    }
    catch(err){
         return  res.status(403).json({message:'Token invalid or expired'});
    }
   
   
}