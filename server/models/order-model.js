const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ordernumber: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    items: [{
        productID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        variantID: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        title: String,
        price: Number,  // snapshot of product price
        variantDetails: {
            size: String,
            color: String,
            material: String,
            style: String
        }
    }],
    shippingAddress: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        area: {
            type: String,
            required: true
        },
        building: {
            type: String,
            required: true
        },
        apartment: {
            type: String,
            required: true
        }
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'credit_card', 'paypal'],
        default: 'cod'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    notes: String
}, {
    timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (this.isNew && !this.ordernumber) {
        try {
            const count = await this.constructor.countDocuments();
            this.ordernumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
        } catch (error) {
            // Fallback order number generation
            this.ordernumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        }
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);


