const Product = require('../models/product-model');
const mongoose = require('mongoose');

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({}).populate('categoryID');
        
        // Ensure images is always an array for consistency and add full URL
        const normalizedProducts = products.map(product => {
            const productObj = product.toObject();
            if (productObj.images && typeof productObj.images === 'string') {
                productObj.images = [productObj.images];
            } else if (!productObj.images) {
                productObj.images = [];
            }
            
            // Add full URL for images
            productObj.images = productObj.images.map(imagePath => {
                if (imagePath.startsWith('http')) {
                    return imagePath; // Already a full URL
                }
                return `${req.protocol}://${req.get('host')}/uploads/${imagePath}`;
            });
            
            return productObj;
        });
        
        res.json(normalizedProducts);
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ error: err.message });
    }
}


exports.createProduct = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        
        const { title, slug, description, categoryID, attributes, variant } = req.body;
        
        // Handle uploaded images
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => `products/${file.filename}`);
        }
        
        // Parse JSON strings
        const parsedCategoryID = typeof categoryID === 'string' ? JSON.parse(categoryID) : categoryID;
        const parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
        const parsedVariant = typeof variant === 'string' ? JSON.parse(variant) : variant;
        
        const newProduct = new Product({ 
            title,
            slug, 
            description,
            categoryID: parsedCategoryID,
            images,
            attributes: parsedAttributes,
            variant: parsedVariant 
        });
        
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Create product error:', err);
        res.status(500).json({ error: err.message });
    }
}

exports.getProductBySlug= async (req, res) => {
    try {
        const { slug } = req.params;
        const product = await Product.findOne({ slug }).populate('categoryID');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updateProduct = async (req, res) => {
    try {
        console.log('Update request body:', req.body);
        console.log('Update request files:', req.files);
        
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }
        
        const updates = { ...req.body };
        
        // Handle new file uploads
        const newImages = req.files ? req.files.map(file => `products/${file.filename}`) : [];
        
        // Get existing images from the body (if any)
        let existingImages = [];
        if (updates.images && typeof updates.images === 'string') {
            try {
                existingImages = JSON.parse(updates.images);
                if (!Array.isArray(existingImages)) {
                    existingImages = [existingImages];
                }
            } catch (e) {
                // If JSON parsing fails, treat as single image
                existingImages = [updates.images];
            }
        } else if (Array.isArray(updates.images)) {
            existingImages = updates.images;
        }

        // Combine existing and new images
        updates.images = [...existingImages, ...newImages];
        
        // Remove duplicates if any
        updates.images = [...new Set(updates.images)];
        
        // Parse JSON strings for complex fields
        if (updates.categoryID && typeof updates.categoryID === 'string') {
            updates.categoryID = JSON.parse(updates.categoryID);
        }
        if (updates.attributes && typeof updates.attributes === 'string') {
            updates.attributes = JSON.parse(updates.attributes);
        }
        if (updates.variant && typeof updates.variant === 'string') {
            updates.variant = JSON.parse(updates.variant);
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: err.message });
    }
}

exports.softDeleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }
        
        const deletedProduct = await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product soft deleted', product: deletedProduct });
    } catch (err) {
        console.error('Soft delete error:', err);
        res.status(500).json({ error: err.message });
    }
}

exports.setUnActiveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product set to inactive', product: updatedProduct });
    } catch (err) {
        console.error('Set inactive error:', err);
        res.status(500).json({ error: err.message });
    }
}
exports.setActiveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(id, { isActive: true }, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product set to active', product: updatedProduct });
    } catch (err) {
        console.error('Set active error:', err);
        res.status(500).json({ error: err.message });
    }
}
  


