const User = require('../models/user-model');
const jwt = require('jsonwebtoken');

const signToken = (user)=>{
    return jwt.sign(
        {id:user._id,role:user.role,name:user.name},process.env.JWT_KEY,{expiresIn:process.env.JWT_EXPIRES_IN}
    )
}
exports.login=async (req,res)=>{
const{email,password}= req.body;
const user = await User.findOne({email});
if(!user || !(await user.comparePassword(password))){
    res.status(401).json({message:'invalid email or password'})
}else{
    // Remove password from user object before sending
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(200).json({
        message:'login successful',
        token:signToken(user),
        user: userResponse
    });
}
}