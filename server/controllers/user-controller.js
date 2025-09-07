const UserModel = require('../models/user-model');
const cartController = require('./cart-controller');
const wishlistController = require('./wishlist-controller');

exports.createAdmin= async(req,res) =>{
    try{
            const {name,email,password}= req.body;
        const newUser = new UserModel({name,email,password,role:'admin'});
        await newUser.save();
        res.status(201).json(newUser);
    } catch(err){
        res.status(500).json({error: err.message})
    }
}
exports.createCustomer= async(req,res) =>{
    try{
         // Debugging line
        const {name,email,password,addresses}= req.body;
        const newUser = new UserModel({name,email,password,role:'customer',addresses});
        await newUser.save().then(()=>{
            // Create cart for the new user
            cartController.createCart(newUser._id);}).then(()=>{
        // Create wishlist for the new user
            wishlistController.createWishList(newUser._id)
        });
        
        // Remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;
        
        res.status(201).json({
            message: 'User registered successfully',
            user: userResponse
        });
    } catch(err){
        res.status(500).json({error: err.message})
    }
}

exports.getAllUsers= async(req,res) =>{
    try{
        const users = await UserModel.find({role:'customer'}).select('-password');
        res.json(users);
    } catch(err){
        res.status(500).json({error: err.message})
    }
}

exports.getUserById= async(req,res) =>{
    try{
        const {id} = req.params;
        const user = await UserModel.findById(id).select('-password');
        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        res.json(user);
    } catch(err){
        res.status(500).json({error: err.message})
    }
}


exports.softDelteuser= async(req,res) =>{
    try{
        const {id} = req.params;
        const deletedUser = await UserModel.findByIdAndUpdate(id, {isDeleted:true}, {new:true}).select('-password');
        if(!deletedUser){ 
            return res.status(404).json({message:'User not found'});
        }
        res.json({message:'User soft deleted', user: deletedUser});
    } catch(err){
        res.status(500).json({error: err.message})
    }
}
        