const http = require('http');

function testAPI(path, description) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log(`✅ ${description}: SUCCESS`);
                    console.log(`   Status: ${res.statusCode}`);
                    console.log(`   Data length: ${Array.isArray(jsonData.data) ? jsonData.data.length : 'N/A'} items`);
                    resolve(jsonData);
                } catch (error) {
                    console.log(`❌ ${description}: PARSE ERROR`);
                    console.log(`   Raw response: ${data.substring(0, 100)}...`);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ ${description}: CONNECTION ERROR`);
            console.log(`   Error: ${error.message}`);
            reject(error);
        });

        req.end();
    });
}

async function testAllEndpoints() {
    console.log('🚀 Testing E-commerce API Endpoints...\n');
    
    try {
        // Test Categories
        await testAPI('/api/categories', 'Categories API');
        
        // Test Products
        await testAPI('/api/products', 'Products API');
        
        // Test specific category products
        await testAPI('/api/products?category=mens-clothing', 'Men\'s Products API');
        
        console.log('\n🎉 All API tests completed!');
        
    } catch (error) {
        console.log('\n⚠️  Some tests failed. Check server status.');
    }
}

testAllEndpoints();
