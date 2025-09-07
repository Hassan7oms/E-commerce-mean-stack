const cartController = require('../controllers/cart-controller');
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authenticate-middleware');

// All cart routes require authentication
router.use(authenticate);

// Get user's cart
router.get('/my-cart', cartController.getUserCart);

// Add item to cart
router.post('/add', cartController.addToCart);

// Update item quantity in cart
router.patch('/update/:itemId', cartController.updateCartItem);

// Remove item from cart
router.delete('/remove/:itemId', cartController.removeFromCart);

// Clear entire cart
router.delete('/clear', cartController.clearCart);

// Confirm price change for an item
router.patch('/confirm-item/:itemId', cartController.confirmPriceChange);

module.exports = router;
