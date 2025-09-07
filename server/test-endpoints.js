const http = require('http');

function testAPI(path, description) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log(`✅ ${description}: ${jsonData.length} items found`);
                    if (Array.isArray(jsonData)) {
                        jsonData.slice(0, 3).forEach((item, index) => {
                            if (item.name) console.log(`   ${index + 1}. ${item.name}`);
                            else if (item.title) console.log(`   ${index + 1}. ${item.title}`);
                        });
                    }
                    resolve(jsonData);
                } catch (error) {
                    console.log(`❌ ${description}: PARSE ERROR`);
                    console.log(`   Raw: ${data.substring(0, 100)}...`);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ ${description}: ${error.message}`);
            reject(error);
        });

        req.end();
    });
}

async function testEndpoints() {
    console.log('🚀 Testing E-commerce API Endpoints...\n');
    
    try {
        await testAPI('/api/category/allCategories', 'Categories API');
        await testAPI('/api/product/public/products', 'Products API');
        console.log('\n🎉 API testing completed!');
    } catch (error) {
        console.log('\n⚠️  Some tests failed.');
    }
}

testEndpoints();
