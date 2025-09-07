const categoryModel = require('../models/category-model');

exports.createCategory = async (req, res) => {
    try {
        const { name,slug,parentID, description } = req.body;
        const newCategory = new categoryModel({ name,slug,parentID, description });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find();
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.softDeleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await categoryModel.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        category.isActive = false;
        await category.save();
        res.json({ message: 'Category soft deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}