const wishlistController = require('../controllers/wishlist-controller');
const express = require('express');
const router = express.Router();
const {authenticate}=require('../middlewares/authenticate-middleware');
const {authorize}=require('../middlewares/authorize-middleware');


router.post('/addtowishlist',authenticate,authorize('customer'),wishlistController.addProductToWishList);
router.get('/getwishlist',authenticate,authorize('customer'),wishlistController.getWishListByUserId);
router.delete('/removewishlist/:productId',authenticate,authorize('customer'),wishlistController.removeFromWishList);
module.exports = router;