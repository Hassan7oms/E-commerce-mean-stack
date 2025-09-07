const Product = require('../models/product-model');
const mongoose = require('mongoose');

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({}).populate('categoryID');
        
        // Normalize images to always return as array for consistency
        const normalizedProducts = products.map(product => {
            const productObj = product.toObject();
            
            // Handle single image string or array
            if (productObj.images) {
                if (typeof productObj.images === 'string') {
                    // Single image string - convert to array with full URL
                    const imageUrl = productObj.images.startsWith('http') 
                        ? productObj.images 
                        : `${req.protocol}://${req.get('host')}/uploads/${productObj.images}`;
                    productObj.images = [imageUrl];
                } else if (Array.isArray(productObj.images)) {
                    // Array of images - add full URLs
                    productObj.images = productObj.images.map(imagePath => {
                        if (imagePath.startsWith('http')) {
                            return imagePath; // Already a full URL
                        }
                        return `${req.protocol}://${req.get('host')}/uploads/${imagePath}`;
                    });
                }
            } else {
                productObj.images = [];
            }
            
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
        console.log('Request file:', req.file);
        
        const { title, slug, description, categoryID, attributes, variant } = req.body;
        
        // Handle uploaded image (single file)
        let images = [];
        if (req.file) {
            images = [`products/${req.file.filename}`];
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
            images: images.length > 0 ? images[0] : '', // Store single image as string
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
        
        // Process image URLs for single product (same logic as getProducts)
        const productObj = product.toObject();
        
        // Handle single image string or array
        if (productObj.images) {
            if (typeof productObj.images === 'string') {
                // Single image string - convert to array with full URL
                const imageUrl = productObj.images.startsWith('http') 
                    ? productObj.images 
                    : `${req.protocol}://${req.get('host')}/uploads/${productObj.images}`;
                productObj.images = [imageUrl];
            } else if (Array.isArray(productObj.images)) {
                // Array of images - add full URLs
                productObj.images = productObj.images.map(imagePath => {
                    if (imagePath.startsWith('http')) {
                        return imagePath; // Already a full URL
                    }
                    return `${req.protocol}://${req.get('host')}/uploads/${imagePath}`;
                });
            }
        } else {
            productObj.images = [];
        }
        
        res.json(productObj);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID format' });
        }
        
        const product = await Product.findById(id).populate('categoryID');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Process image URLs for single product (same logic as getProducts)
        const productObj = product.toObject();
        
        // Handle single image string or array
        if (productObj.images) {
            if (typeof productObj.images === 'string') {
                // Single image string - convert to array with full URL
                const imageUrl = productObj.images.startsWith('http') 
                    ? productObj.images 
                    : `${req.protocol}://${req.get('host')}/uploads/${productObj.images}`;
                productObj.images = [imageUrl];
            } else if (Array.isArray(productObj.images)) {
                // Array of images - add full URLs
                productObj.images = productObj.images.map(imagePath => {
                    if (imagePath.startsWith('http')) {
                        return imagePath; // Already a full URL
                    }
                    return `${req.protocol}://${req.get('host')}/uploads/${imagePath}`;
                });
            }
        } else {
            productObj.images = [];
        }
        
        res.json(productObj);
    } catch (err) {
        console.error('Get product by ID error:', err);
        res.status(500).json({ error: err.message });
    }
}

exports.updateProduct = async (req, res) => {
    try {
        console.log('=== UPDATE PRODUCT REQUEST ===');
        console.log('Request params:', req.params);
        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        console.log('Request headers:', req.headers);
        
        const { id } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log('Invalid ObjectId:', id);
            return res.status(400).json({ message: 'Invalid product ID format' });
        }
        
        const updates = { ...req.body };
        
        // Handle new file upload (single image)
        if (req.file) {
            console.log('New image file uploaded:', req.file.filename);
            updates.images = `products/${req.file.filename}`;
        } else if (updates.images && typeof updates.images === 'string') {
            console.log('Keeping existing image:', updates.images);
            // Keep existing image if no new file uploaded
            try {
                const parsedImages = JSON.parse(updates.images);
                if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                    updates.images = parsedImages[0]; // Take first image
                } else if (typeof parsedImages === 'string') {
                    updates.images = parsedImages;
                }
            } catch (e) {
                // If JSON parsing fails, treat as single image string
                console.log('Image parsing failed, using as string:', updates.images);
                updates.images = updates.images;
            }
        }
        
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

        console.log('Final updates object:', updates);

        const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedProduct) {
            console.log('Product not found with ID:', id);
            return res.status(404).json({ message: 'Product not found' });
        }
        
        console.log('Product updated successfully:', updatedProduct._id);
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
  


