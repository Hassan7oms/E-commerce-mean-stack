const express = require('express');
const router = express.Router();
const {login}=require('../controllers/authenticate-controller');
const {authenticate}=require('../middlewares/authenticate-middleware');
const {authorize}=require('../middlewares/authorize-middleware');
const UserController = require('../controllers/user-controller');
router.post('/login',login);
router.post('/register',UserController.createCustomer);
router.post('/create-admin',UserController.createAdmin); // Add admin creation route
router.get('/getusers', authenticate, authorize('admin'), UserController.getAllUsers);
router.get('/user/:id', authenticate, UserController.getUserById);
router.delete('/deleteUser/:id', authenticate, authorize('customer'), UserController.softDelteuser);
module.exports = router;