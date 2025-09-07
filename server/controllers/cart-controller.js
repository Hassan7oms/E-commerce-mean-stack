const CartModel = require('../models/cart-model');
const ProductModel = require('../models/product-model');
const mongoose = require('mongoose');

// Get user's cart
exports.getUserCart = async (req, res) => {
    try {
        const userId = req.user.id;
        
        let cart = await CartModel.findOne({ userID: userId }).populate('items.productID');
        
        if (!cart) {
            // Create a new cart if none exists
            cart = new CartModel({ userID: userId, items: [] });
            await cart.save();
        }
        
        res.json(cart);
    } catch (err) {
        console.error('Get cart error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Add item to cart
exports.addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, variantId, quantity } = req.body;
        
        // Validate input
        if (!productId || !variantId || !quantity || quantity < 1) {
            return res.status(400).json({ message: 'Invalid input data' });
        }
        
        // Find the product and specific variant
        const product = await ProductModel.findById(productId);
        if (!product || !product.isActive || product.isDeleted) {
            return res.status(404).json({ message: 'Product not found or unavailable' });
        }
        
        const variant = product.variant.id(variantId);
        if (!variant) {
            return res.status(404).json({ message: 'Product variant not found' });
        }
        
        // Check if enough stock is available
        if (variant.QTyavailable < quantity) {
            return res.status(400).json({ 
                message: `Only ${variant.QTyavailable} items available in stock` 
            });
        }
        
        // Find or create cart
        let cart = await CartModel.findOne({ userID: userId });
        if (!cart) {
            cart = new CartModel({ userID: userId, items: [] });
        }
        
        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.productID.toString() === productId && item.variantId === variantId
        );
        
        if (existingItemIndex > -1) {
            // Update quantity if item already exists
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            
            if (newQuantity > variant.QTyavailable) {
                return res.status(400).json({ 
                    message: `Cannot add ${quantity} more. Only ${variant.QTyavailable - cart.items[existingItemIndex].quantity} more available` 
                });
            }
            
            cart.items[existingItemIndex].quantity = newQuantity;
            
            // Check if price has changed
            if (cart.items[existingItemIndex].price !== variant.price) {
                cart.items[existingItemIndex].priceChanged = true;
            }
        } else {
            // Add new item to cart
            cart.items.push({
                productID: productId,
                variantId: variantId,
                quantity: quantity,
                title: product.title,
                price: variant.price,
                priceChanged: false
            });
        }
        
        await cart.save();
        
        // Populate the cart for response
        cart = await CartModel.findById(cart._id).populate('items.productID');
        
        res.status(201).json(cart);
    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Update item quantity in cart
exports.updateCartItem = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const { quantity } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }
        
        const cart = await CartModel.findOne({ userID: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
        
        // Verify stock availability
        const product = await ProductModel.findById(item.productID);
        const variant = product.variant.id(item.variantId);
        
        if (quantity > variant.QTyavailable) {
            return res.status(400).json({ 
                message: `Only ${variant.QTyavailable} items available in stock` 
            });
        }
        
        item.quantity = quantity;
        
        // Check if price has changed
        if (item.price !== variant.price) {
            item.priceChanged = true;
        }
        
        await cart.save();
        
        // Populate and return updated cart
        const updatedCart = await CartModel.findById(cart._id).populate('items.productID');
        res.json(updatedCart);
    } catch (err) {
        console.error('Update cart item error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        
        const cart = await CartModel.findOne({ userID: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
        
        cart.items.splice(itemIndex, 1);
        await cart.save();
        
        // Populate and return updated cart
        const updatedCart = await CartModel.findById(cart._id).populate('items.productID');
        res.json(updatedCart);
    } catch (err) {
        console.error('Remove from cart error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const cart = await CartModel.findOne({ userID: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();
        
        res.json(cart);
    } catch (err) {
        console.error('Clear cart error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Confirm price change for an item
exports.confirmPriceChange = async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        
        const cart = await CartModel.findOne({ userID: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }
        
        const item = cart.items.id(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }
        
        // Update price and clear price change flag
        const product = await ProductModel.findById(item.productID);
        const variant = product.variant.id(item.variantId);
        
        item.price = variant.price;
        item.priceChanged = false;
        
        await cart.save();
        
        // Populate and return updated cart
        const updatedCart = await CartModel.findById(cart._id).populate('items.productID');
        res.json(updatedCart);
    } catch (err) {
        console.error('Confirm price change error:', err);
        res.status(500).json({ error: err.message });
    }
};

// Create cart for user (helper function)
exports.createCart = async (userID) => {
    const cart = new CartModel({ userID, items: [] });
    await cart.save();
    return cart;
};