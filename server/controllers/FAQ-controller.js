const FAQModel= require('../models/FAQ-model');
const {authenticate}= require('../middlewares/authenticate-middleware');
const {authorize}= require('../middlewares/authorize-middleware');

exports.createFAQ= async(req,res)=>{
    const {question,answer}= req.body;
    const faq = new FAQModel({question,answer});
    await faq.save();
    res.status(201).json({message:'FAQ created successfully',faq});
}
exports.getAllFAQs= async(req,res)=>{
    const faqs = await FAQModel.find();
    res.json(faqs);
}
exports.updateFAQ= async(req,res)=>{
    const faqId = req.params.id;
    const {question,answer}= req.body;
    const faq = await FAQModel.findById(faqId);
    if(!faq){
        return res.status(404).json({message:'FAQ not found'});
    }
    faq.question = question || faq.question;
    faq.answer = answer || faq.answer;
    await faq.save();
    res.json({message:'FAQ updated successfully',faq});
}
exports.deleteFAQ= async(req,res)=>{
    const faqId = req.params.id;
    const faq = await FAQModel.findById(faqId);
    if(!faq){  
        return res.status(404).json({message:'FAQ not found'});
    }   
    await FAQModel.findByIdAndDelete(faqId);
    res.json({message:'FAQ deleted successfully'});
}

