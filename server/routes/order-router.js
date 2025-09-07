const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order-controller');
const { authenticate } = require('../middlewares/authenticate-middleware');
const { authorize } = require('../middlewares/authorize-middleware');

// User routes (require authentication)
router.use(authenticate);

// Create new order
router.post('/', orderController.createOrder);

// Get user's orders
router.get('/my-orders', orderController.getUserOrders);

// Admin routes (require admin authorization)
// Get order statistics (admin only)
router.get('/admin/stats', authorize('admin'), orderController.getOrderStats);

// Get all orders (admin only)
router.get('/admin/all', authorize('admin'), orderController.getAllOrders);

// Update order status (admin only)
router.patch('/:orderId/status', authorize('admin'), orderController.updateOrderStatus);

// User routes that use parameters (should come after admin routes)
// Get single order
router.get('/:orderId', orderController.getOrderById);

// Cancel order
router.patch('/:orderId/cancel', orderController.cancelOrder);

module.exports = router;