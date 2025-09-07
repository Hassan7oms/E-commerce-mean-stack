const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const BASE_URL = 'http://localhost:3000/api';

// Test user credentials - you'll need to replace these with actual admin credentials
const ADMIN_CREDENTIALS = {
    email: 'admin@example.com',
    password: 'adminpassword'
};

let authToken = '';
let testProductId = '';

async function createTestImage() {
    // Create a simple test image file
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    const testImageContent = Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0xFF, 0xD9
    ]);
    
    try {
        fs.writeFileSync(testImagePath, testImageContent);
        return testImagePath;
    } catch (error) {
        console.error('Error creating test image:', error);
        return null;
    }
}

async function cleanupTestImage() {
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    try {
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }
    } catch (error) {
        console.error('Error cleaning up test image:', error);
    }
}

async function loginAsAdmin() {
    try {
        console.log('🔐 Testing admin login...');
        const response = await axios.post(`${BASE_URL}/users/login`, ADMIN_CREDENTIALS);
        
        if (response.data && response.data.token) {
            authToken = response.data.token;
            console.log('✅ Admin login successful');
            return true;
        } else {
            console.log('❌ Admin login failed - no token received');
            return false;
        }
    } catch (error) {
        console.log('❌ Admin login failed:', error.response?.data?.message || error.message);
        console.log('ℹ️  Note: Make sure you have an admin user created with the credentials provided');
        return false;
    }
}

async function testGetProducts() {
    try {
        console.log('📋 Testing get all products...');
        const response = await axios.get(`${BASE_URL}/product/public/products`);
        
        if (response.status === 200) {
            console.log(`✅ Successfully fetched ${response.data.length} products`);
            if (response.data.length > 0) {
                const sampleProduct = response.data[0];
                console.log('   Sample product structure:', {
                    id: sampleProduct._id,
                    title: sampleProduct.title,
                    images: sampleProduct.images,
                    hasImages: Array.isArray(sampleProduct.images) && sampleProduct.images.length > 0
                });
            }
            return true;
        }
    } catch (error) {
        console.log('❌ Error fetching products:', error.response?.data || error.message);
        return false;
    }
}

async function testCreateProduct() {
    if (!authToken) {
        console.log('❌ Cannot test product creation - no auth token');
        return false;
    }

    try {
        console.log('➕ Testing product creation with image upload...');
        
        const testImagePath = await createTestImage();
        if (!testImagePath) {
            console.log('❌ Could not create test image');
            return false;
        }

        const formData = new FormData();
        formData.append('title', 'Test Product API');
        formData.append('slug', 'test-product-api');
        formData.append('description', 'This is a test product created via API with image upload');
        formData.append('categoryID', JSON.stringify(['507f1f77bcf86cd799439011'])); // Use a valid category ID
        formData.append('attributes', JSON.stringify({
            material: 'Test Material',
            origin: 'Test Origin'
        }));
        formData.append('variant', JSON.stringify([{
            color: 'Red',
            size: 'M',
            price: 100,
            QTyavailable: 10,
            Qtyreserved: 0,
            reorderPoint: 5
        }]));
        
        // Append the image file
        formData.append('images', fs.createReadStream(testImagePath));

        const response = await axios.post(
            `${BASE_URL}/product/addproduct`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    ...formData.getHeaders()
                }
            }
        );

        if (response.status === 201) {
            testProductId = response.data._id;
            console.log('✅ Product created successfully with ID:', testProductId);
            console.log('   Product images:', response.data.images);
            await cleanupTestImage();
            return true;
        }
    } catch (error) {
        console.log('❌ Error creating product:', error.response?.data || error.message);
        await cleanupTestImage();
        return false;
    }
}

async function testUpdateProduct() {
    if (!authToken || !testProductId) {
        console.log('❌ Cannot test product update - missing auth token or product ID');
        return false;
    }

    try {
        console.log('✏️ Testing product update...');
        
        const formData = new FormData();
        formData.append('title', 'Updated Test Product API');
        formData.append('description', 'This product has been updated via API');
        formData.append('attributes', JSON.stringify({
            material: 'Updated Material',
            origin: 'Updated Origin'
        }));

        const response = await axios.put(
            `${BASE_URL}/product/updateproduct/${testProductId}`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    ...formData.getHeaders()
                }
            }
        );

        if (response.status === 200) {
            console.log('✅ Product updated successfully');
            console.log('   Updated title:', response.data.title);
            return true;
        }
    } catch (error) {
        console.log('❌ Error updating product:', error.response?.data || error.message);
        return false;
    }
}

async function testSetProductInactive() {
    if (!authToken || !testProductId) {
        console.log('❌ Cannot test set inactive - missing auth token or product ID');
        return false;
    }

    try {
        console.log('🔄 Testing set product inactive...');
        
        const response = await axios.get(
            `${BASE_URL}/product/setinactive/${testProductId}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        if (response.status === 200) {
            console.log('✅ Product set to inactive successfully');
            console.log('   Status:', response.data.message);
            return true;
        }
    } catch (error) {
        console.log('❌ Error setting product inactive:', error.response?.data || error.message);
        return false;
    }
}

async function testSetProductActive() {
    if (!authToken || !testProductId) {
        console.log('❌ Cannot test set active - missing auth token or product ID');
        return false;
    }

    try {
        console.log('🔄 Testing set product active...');
        
        const response = await axios.get(
            `${BASE_URL}/product/setactive/${testProductId}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        if (response.status === 200) {
            console.log('✅ Product set to active successfully');
            console.log('   Status:', response.data.message);
            return true;
        }
    } catch (error) {
        console.log('❌ Error setting product active:', error.response?.data || error.message);
        return false;
    }
}

async function testSoftDeleteProduct() {
    if (!authToken || !testProductId) {
        console.log('❌ Cannot test soft delete - missing auth token or product ID');
        return false;
    }

    try {
        console.log('🗑️ Testing soft delete product...');
        
        const response = await axios.delete(
            `${BASE_URL}/product/softdeleteproduct/${testProductId}`,
            {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            }
        );

        if (response.status === 200) {
            console.log('✅ Product soft deleted successfully');
            console.log('   Status:', response.data.message);
            return true;
        }
    } catch (error) {
        console.log('❌ Error soft deleting product:', error.response?.data || error.message);
        return false;
    }
}

async function runComprehensiveTests() {
    console.log('🧪 Starting Comprehensive Product API Tests...\n');

    const results = {
        getProducts: false,
        adminLogin: false,
        createProduct: false,
        updateProduct: false,
        setInactive: false,
        setActive: false,
        softDelete: false
    };

    // Test 1: Get products (public endpoint)
    results.getProducts = await testGetProducts();
    console.log('');

    // Test 2: Admin login
    results.adminLogin = await loginAsAdmin();
    console.log('');

    // If login successful, test admin operations
    if (results.adminLogin) {
        // Test 3: Create product with image
        results.createProduct = await testCreateProduct();
        console.log('');

        // Test 4: Update product
        results.updateProduct = await testUpdateProduct();
        console.log('');

        // Test 5: Set product inactive
        results.setInactive = await testSetProductInactive();
        console.log('');

        // Test 6: Set product active
        results.setActive = await testSetProductActive();
        console.log('');

        // Test 7: Soft delete product
        results.softDelete = await testSoftDeleteProduct();
        console.log('');
    }

    // Display summary
    console.log('📊 Test Results Summary:');
    console.log('========================');
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${test}`);
    });

    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    console.log(`\n📈 Overall: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Product management API is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Please check the error messages above.');
    }
}

// Run the tests
runComprehensiveTests().catch(console.error);
