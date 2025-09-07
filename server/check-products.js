require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product-model');

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to database');
        
        const products = await Product.find();
        console.log(`\nFound ${products.length} products:`);
        
        products.forEach((product, index) => {
            console.log(`\n${index + 1}. ${product.title}`);
            console.log(`   Images: ${product.images || 'No image'}`);
            console.log(`   Category: ${product.categoryID}`);
            console.log(`   Variants: ${product.variant.length}`);
        });
        
        await mongoose.disconnect();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error:', error);
    }
}

checkProducts();
