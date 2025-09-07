const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
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
        },
        variantId: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        title: String,  // snapshot of product title
        price: Number,  // snapshot of product price at time of adding
        priceChanged: {
            type: Boolean,
            default: false
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    }}, { timestamps: true });

// Calculate total price before saving
cartSchema.pre('save', function(next) {
    this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    next();
});

module.exports = mongoose.model('Cart', cartSchema);
    