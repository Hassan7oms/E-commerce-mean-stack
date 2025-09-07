const mongoose = require('mongoose');
const Category = require('../models/category-model');
const Product = require('../models/product-model');
require('dotenv').config();

// Sample categories data
const categoriesData = [
    // Main categories
    {
        name: "Men's Clothing",
        slug: "mens-clothing",
        parentID: null
    },
    {
        name: "Women's Clothing",
        slug: "womens-clothing",
        parentID: null
    },
    {
        name: "Accessories",
        slug: "accessories",
        parentID: null
    }
];

// Sample products data
const productsData = [
    // Men's Products
    {
        title: "Classic Cotton T-Shirt",
        slug: "classic-cotton-tshirt",
        description: "A comfortable, breathable cotton t-shirt perfect for everyday wear. Made from 100% premium cotton with a classic fit.",
        attributes: {
            material: "100% Cotton",
            origin: "Egypt"
        },
        images: "classic-tshirt.jpg",
        variant: [
            {
                color: "White",
                size: "M",
                price: 25.99,
                QTyavailable: 50,
                reorderPoint: 10
            },
            {
                color: "White",
                size: "L",
                price: 25.99,
                QTyavailable: 45,
                reorderPoint: 10
            },
            {
                color: "Black",
                size: "M",
                price: 25.99,
                QTyavailable: 30,
                reorderPoint: 10
            },
            {
                color: "Black",
                size: "L",
                price: 25.99,
                QTyavailable: 25,
                reorderPoint: 10
            }
        ]
    },
    {
        title: "Denim Jeans",
        slug: "denim-jeans",
        description: "Classic straight-fit denim jeans with a timeless design. Durable and comfortable for all-day wear.",
        attributes: {
            material: "98% Cotton, 2% Elastane",
            origin: "Turkey"
        },
        images: "denim-jeans.jpg",
        variant: [
            {
                color: "Blue",
                size: "32",
                price: 59.99,
                QTyavailable: 20,
                reorderPoint: 5
            },
            {
                color: "Blue",
                size: "34",
                price: 59.99,
                QTyavailable: 25,
                reorderPoint: 5
            },
            {
                color: "Black",
                size: "32",
                price: 59.99,
                QTyavailable: 15,
                reorderPoint: 5
            }
        ]
    },
    {
        title: "Polo Shirt",
        slug: "polo-shirt",
        description: "Smart casual polo shirt with classic collar and button placket. Perfect for business casual or weekend wear.",
        attributes: {
            material: "100% Cotton Pique",
            origin: "Egypt"
        },
        images: "polo-shirt.jpg",
        variant: [
            {
                color: "Navy",
                size: "M",
                price: 39.99,
                QTyavailable: 35,
                reorderPoint: 8
            },
            {
                color: "Navy",
                size: "L",
                price: 39.99,
                QTyavailable: 30,
                reorderPoint: 8
            },
            {
                color: "White",
                size: "M",
                price: 39.99,
                QTyavailable: 28,
                reorderPoint: 8
            }
        ]
    },

    // Women's Products
    {
        title: "Floral Summer Dress",
        slug: "floral-summer-dress",
        description: "Beautiful floral print summer dress with a flowing silhouette. Perfect for warm weather and special occasions.",
        attributes: {
            material: "100% Viscose",
            origin: "India"
        },
        images: "floral-dress.jpg",
        variant: [
            {
                color: "Pink Floral",
                size: "S",
                price: 49.99,
                QTyavailable: 20,
                reorderPoint: 5
            },
            {
                color: "Pink Floral",
                size: "M",
                price: 49.99,
                QTyavailable: 25,
                reorderPoint: 5
            },
            {
                color: "Blue Floral",
                size: "S",
                price: 49.99,
                QTyavailable: 18,
                reorderPoint: 5
            },
            {
                color: "Blue Floral",
                size: "M",
                price: 49.99,
                QTyavailable: 22,
                reorderPoint: 5
            }
        ]
    },
    {
        title: "Silk Blouse",
        slug: "silk-blouse",
        description: "Elegant silk blouse with classic button-up design. Professional and versatile for office or evening wear.",
        attributes: {
            material: "100% Silk",
            origin: "China"
        },
        images: "silk-blouse.jpg",
        variant: [
            {
                color: "Cream",
                size: "S",
                price: 79.99,
                QTyavailable: 15,
                reorderPoint: 3
            },
            {
                color: "Cream",
                size: "M",
                price: 79.99,
                QTyavailable: 18,
                reorderPoint: 3
            },
            {
                color: "Black",
                size: "S",
                price: 79.99,
                QTyavailable: 12,
                reorderPoint: 3
            }
        ]
    },
    {
        title: "High-Waist Skinny Jeans",
        slug: "high-waist-skinny-jeans",
        description: "Flattering high-waist skinny jeans with stretch for comfort. A wardrobe essential that pairs with everything.",
        attributes: {
            material: "92% Cotton, 6% Polyester, 2% Elastane",
            origin: "Turkey"
        },
        images: "skinny-jeans.jpg",
        variant: [
            {
                color: "Dark Blue",
                size: "28",
                price: 55.99,
                QTyavailable: 22,
                reorderPoint: 5
            },
            {
                color: "Dark Blue",
                size: "30",
                price: 55.99,
                QTyavailable: 20,
                reorderPoint: 5
            },
            {
                color: "Black",
                size: "28",
                price: 55.99,
                QTyavailable: 18,
                reorderPoint: 5
            }
        ]
    },

    // Accessories
    {
        title: "Leather Wallet",
        slug: "leather-wallet",
        description: "Premium genuine leather wallet with multiple card slots and bill compartments. Durable and stylish.",
        attributes: {
            material: "Genuine Leather",
            origin: "Italy"
        },
        images: "leather-wallet.jpg",
        variant: [
            {
                color: "Brown",
                size: "One Size",
                price: 45.99,
                QTyavailable: 30,
                reorderPoint: 8
            },
            {
                color: "Black",
                size: "One Size",
                price: 45.99,
                QTyavailable: 25,
                reorderPoint: 8
            }
        ]
    },
    {
        title: "Sunglasses",
        slug: "sunglasses",
        description: "Stylish UV protection sunglasses with polarized lenses. Perfect for sunny days and outdoor activities.",
        attributes: {
            material: "Acetate Frame, Polarized Lenses",
            origin: "Italy"
        },
        images: "sunglasses.jpg",
        variant: [
            {
                color: "Black",
                size: "One Size",
                price: 89.99,
                QTyavailable: 15,
                reorderPoint: 5
            },
            {
                color: "Brown Tortoise",
                size: "One Size",
                price: 89.99,
                QTyavailable: 12,
                reorderPoint: 5
            }
        ]
    },
    {
        title: "Silk Scarf",
        slug: "silk-scarf",
        description: "Luxurious silk scarf with elegant print. Can be worn around the neck, as a headband, or tied to a handbag.",
        attributes: {
            material: "100% Silk",
            origin: "France"
        },
        images: "silk-scarf.jpg",
        variant: [
            {
                color: "Blue Pattern",
                size: "One Size",
                price: 69.99,
                QTyavailable: 18,
                reorderPoint: 4
            },
            {
                color: "Red Pattern",
                size: "One Size",
                price: 69.99,
                QTyavailable: 15,
                reorderPoint: 4
            }
        ]
    },
    {
        title: "Cotton Hoodie",
        slug: "cotton-hoodie",
        description: "Comfortable cotton hoodie with adjustable drawstring and kangaroo pocket. Perfect for casual wear.",
        attributes: {
            material: "80% Cotton, 20% Polyester",
            origin: "Portugal"
        },
        images: "cotton-hoodie.jpg",
        variant: [
            {
                color: "Grey",
                size: "M",
                price: 49.99,
                QTyavailable: 25,
                reorderPoint: 6
            },
            {
                color: "Grey",
                size: "L",
                price: 49.99,
                QTyavailable: 20,
                reorderPoint: 6
            },
            {
                color: "Navy",
                size: "M",
                price: 49.99,
                QTyavailable: 22,
                reorderPoint: 6
            }
        ]
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');

        // Clear existing data
        console.log('Clearing existing data...');
        await Category.deleteMany({});
        await Product.deleteMany({});

        // Insert categories
        console.log('Inserting categories...');
        const insertedCategories = await Category.insertMany(categoriesData);
        console.log(`Inserted ${insertedCategories.length} categories`);

        // Create category mapping for easier reference
        const categoryMap = {
            "mens-clothing": insertedCategories.find(cat => cat.slug === "mens-clothing")._id,
            "womens-clothing": insertedCategories.find(cat => cat.slug === "womens-clothing")._id,
            "accessories": insertedCategories.find(cat => cat.slug === "accessories")._id
        };

        // Assign categories to products
        const productsWithCategories = productsData.map(product => {
            let categoryID = [];
            
            // Assign categories based on product type
            if (product.slug.includes('tshirt') || product.slug.includes('jeans') || product.slug.includes('polo') || product.slug.includes('hoodie')) {
                categoryID.push(categoryMap["mens-clothing"]);
            } else if (product.slug.includes('dress') || product.slug.includes('blouse') || product.slug.includes('skinny-jeans')) {
                categoryID.push(categoryMap["womens-clothing"]);
            } else {
                categoryID.push(categoryMap["accessories"]);
            }

            return { ...product, categoryID };
        });

        // Insert products
        console.log('Inserting products...');
        const insertedProducts = await Product.insertMany(productsWithCategories);
        console.log(`Inserted ${insertedProducts.length} products`);

        console.log('\n=== Database Seeding Complete! ===');
        console.log(`Categories: ${insertedCategories.length}`);
        console.log(`Products: ${insertedProducts.length}`);
        console.log('\nCategories created:');
        insertedCategories.forEach(cat => {
            console.log(`- ${cat.name} (${cat.slug})`);
        });
        
        console.log('\nProducts created:');
        insertedProducts.forEach(product => {
            const totalVariants = product.variant.length;
            const totalQuantity = product.variant.reduce((sum, variant) => sum + variant.QTyavailable, 0);
            console.log(`- ${product.title} (${totalVariants} variants, ${totalQuantity} total items)`);
        });

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        // Close the connection
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        process.exit(0);
    }
}

// Run the seeder
seedDatabase();
