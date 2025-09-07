const categoryController= require('../controllers/category-controller');
const express= require('express');
const router= express.Router();
const {authenticate}= require('../middlewares/authenticate-middleware');
const {authorize}= require('../middlewares/authorize-middleware');
router.post('/addCategory',authenticate,authorize('admin'),categoryController.createCategory);
router.get('/allCategories',categoryController.getAllCategories);
router.delete('/softDeleteCategory/:id',authenticate,authorize('admin'),categoryController.softDeleteCategory);
module.exports= router;
