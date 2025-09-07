const Order = require('../models/order-model');
const Cart = require('../models/cart-model');
const Product = require('../models/product-model');
const catchAsync = require('../utils/catch-async.utils');
const AppError = require('../utils/app-error.utils');

// Create new order from cart
const createOrder = catchAsync(async (req, res, next) => {
    console.log('Creating order - Request body:', req.body);
    console.log('Creating order - User:', req.user);
    
    const { shippingAddress, paymentMethod, cartId, notes } = req.body;
    const userID = req.user._id;

    // Validate required fields
    if (!shippingAddress || !paymentMethod) {
        return next(new AppError('Shipping address and payment method are required', 400));
    }

    console.log('Looking for cart with userID:', userID, 'cartId:', cartId);

    // Get user's cart
    let cart;
    if (cartId) {
        cart = await Cart.findOne({ _id: cartId, userID: userID }).populate('items.productID');
    } else {
        cart = await Cart.findOne({ userID: userID }).populate('items.productID');
    }

    console.log('Found cart:', cart);

    if (!cart || cart.items.length === 0) {
        return next(new AppError('Cart is empty or not found', 400));
    }

    // Validate cart items and calculate total
    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
        if (!item.productID) {
            return next(new AppError('Invalid product in cart', 400));
        }

        const product = item.productID;
        
        // Find the variant (note: variantId in cart model is lowercase)
        const variant = product.variant.find(v => v._id.toString() === item.variantId.toString());
        if (!variant) {
            return next(new AppError(`Variant not found for product ${product.title}`, 400));
        }

        // Check availability
        if (!product.isActive || product.isDeleted || variant.QTyavailable < item.quantity) {
            return next(new AppError(`Product ${product.title} is not available in requested quantity`, 400));
        }

        const itemTotal = variant.price * item.quantity;
        totalPrice += itemTotal;

        orderItems.push({
            productID: product._id,
            variantID: variant._id,
            quantity: item.quantity,
            title: product.title,
            price: variant.price,
            variantDetails: {
                size: variant.size,
                color: variant.color,
                material: variant.material,
                style: variant.style
            }
        });
    }

    // Create order
    const order = new Order({
        userID,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        totalPrice,
        notes: notes || '',
        // Fallback ordernumber in case pre-save middleware fails
        ordernumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    });

    console.log('Order object before save:', order);

    try {
        await order.save();
        console.log('Order saved successfully:', order._id);
    } catch (saveError) {
        console.error('Error saving order:', saveError);
        return next(new AppError(`Failed to create order: ${saveError.message}`, 500));
    }

    // Update product quantities
    for (const item of cart.items) {
        await Product.updateOne(
            { 
                '_id': item.productID._id,
                'variant._id': item.variantId
            },
            { 
                $inc: { 'variant.$.QTyavailable': -item.quantity }
            }
        );
    }

    // Clear the cart
    await Cart.findOneAndUpdate(
        { userID },
        { $set: { items: [], totalPrice: 0 } }
    );

    // Populate order for response
    const populatedOrder = await Order.findById(order._id)
        .populate('userID', 'name email')
        .populate('items.productID', 'title slug images');

    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: populatedOrder
    });
});

// Get user's orders
const getUserOrders = catchAsync(async (req, res, next) => {
    const userID = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    let filter = { userID };
    if (status && status !== 'all') {
        filter.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
        .populate('items.productID', 'title slug images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
        success: true,
        data: orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// Get single order
const getOrderById = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const userID = req.user._id;

    const order = await Order.findOne({ _id: orderId, userID })
        .populate('userID', 'name email')
        .populate('items.productID', 'title slug images');

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    res.status(200).json({
        success: true,
        data: order
    });
});

// Cancel order (only if pending)
const cancelOrder = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const userID = req.user._id;

    const order = await Order.findOne({ _id: orderId, userID });

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    if (order.status !== 'pending') {
        return next(new AppError('Only pending orders can be cancelled', 400));
    }

    // Restore product quantities
    for (const item of order.items) {
        await Product.updateOne(
            { 
                '_id': item.productID,
                'variant._id': item.variantID
            },
            { 
                $inc: { 'variant.$.QTyavailable': item.quantity }
            }
        );
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
    });
});

// Admin: Get all orders
const getAllOrders = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;

    let filter = {};
    if (status && status !== 'all') {
        filter.status = status;
    }

    if (search) {
        filter.$or = [
            { ordernumber: { $regex: search, $options: 'i' } },
            { 'items.title': { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
        .populate('userID', 'name email')
        .populate('items.productID', 'title slug images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
        success: true,
        data: orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

// Admin: Update order status
const updateOrderStatus = catchAsync(async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return next(new AppError('Invalid order status', 400));
    }

    const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true, runValidators: true }
    ).populate('userID', 'name email').populate('items.productID', 'title slug images');

    if (!order) {
        return next(new AppError('Order not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: order
    });
});

// Admin: Get order statistics
const getOrderStats = catchAsync(async (req, res, next) => {
    const stats = await Order.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalValue: { $sum: '$totalPrice' }
            }
        }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            statusBreakdown: stats
        }
    });
});

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    getAllOrders,
    updateOrderStatus,
    getOrderStats
};
