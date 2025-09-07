require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/category-model');

async function checkCategories() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to database');
        
        const categories = await Category.find();
        console.log(`\nFound ${categories.length} categories:`);
        
        categories.forEach((category, index) => {
            console.log(`\n${index + 1}. ${category.name}`);
            console.log(`   ID: ${category._id}`);
            console.log(`   Slug: ${category.slug}`);
            console.log(`   Description: ${category.description}`);
        });
        
        await mongoose.disconnect();
        console.log('\nDatabase connection closed');
    } catch (error) {
        console.error('Error:', error);
    }
}

checkCategories();
