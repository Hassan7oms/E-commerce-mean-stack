const mongoose = require('mongoose');
const wishlistSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',    
        required: true
    },
    items: [{
        productID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);