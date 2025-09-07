const express= require('express');
const router= express.Router();
const faqController= require('../controllers/FAQ-controller');
const {authenticate}= require('../middlewares/authenticate-middleware');
const {authorize}= require('../middlewares/authorize-middleware');
router.post('/createFAQ',authenticate,authorize('admin'),faqController.createFAQ);
router.get('/allFAQs',faqController.getAllFAQs);
router.put('/updateFAQ/:id',authenticate,authorize('admin'),faqController.updateFAQ);
router.delete('/deleteFAQ/:id',authenticate,authorize('admin'),faqController.deleteFAQ);

module.exports = router;