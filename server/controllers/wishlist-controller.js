const wishListModel = require('../models/wishlist-model');

exports.createWishList= async(userID)=>{
    const wishList = new wishListModel({userID});
    await wishList.save();
    return wishList;
}
exports.getWishListByUserId= async(req,res) =>{
    try{
        const { userId } = req.body;
        const wishListItems = await wishListModel.find({ userId }).populate('productId');
        res.json(wishListItems);
    } catch(err){
        res.status(500).json({error: err.message})
    }
}
exports.addProductToWishList= async(req,res) =>{
    try{
        const {userID,productId} = req.body;
        const wishlist = await wishListModel.findOne({userID: userID});
        if (!wishlist) {
            return res.status(404).json({message: 'Wishlist not found'});
        }
        if(wishlist.items.includes(productId)){
            return res.status(400).json({message:'Product already in wishlist'});
        }
        else{
            wishlist.items.push(productId);
            await wishlist.save();
            return res.status(201).json(wishlist);
        }
        

    }
    catch(err){
        res.status(500).json({error: err.message})
    }
}
exports.removeFromWishList= async(req,res) =>{
    try{
       const {userID,productId} = req.body;
       const wishlist = await wishListModel.findOne({userID: userID});
         if (!wishlist) {
              return res.status(404).json({message: 'Wishlist not found'});
         }
            const index = wishlist.items.indexOf(productId);
            if(index > -1){
                wishlist.items.splice(index,1);
                await wishlist.save();
                return res.json(wishlist);
            } else{
                return res.status(404).json({message:'Product not in wishlist'});
            }
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
}
