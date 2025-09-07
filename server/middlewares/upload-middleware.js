const multer = require('multer');
const path = require('path');

// File type validation
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
    
    if (!allowed.includes(ext)) {
        return cb(new Error('Only images allowed (.jpg, .png, .jpeg, .webp, .gif)'), false);
    }
    cb(null, true);
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/products');  
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueName = `${Date.now()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

const MB = 1024 * 1024;

// Main upload middleware for multiple files
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * MB } // 5MB limit
});

// Single image upload for products
const uploadSingle = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * MB }
}).single('image');

// Multiple images upload for products
const uploadMultiple = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * MB }
}).array('images', 5);

module.exports = {
    upload,
    uploadSingle,
    uploadMultiple
};