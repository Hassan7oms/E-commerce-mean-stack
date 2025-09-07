// Products page functionality

// Sample product data
const products = [
    {
        id: 1,
        name: "Classic Cotton T-Shirt",
        price: 299,
        originalPrice: 399,
        image: "https://via.placeholder.com/300x300/f0f0f0/cccccc?text=Classic+T-Shirt",
        category: "men",
        subcategory: "t-shirts",
        rating: 4.8,
        reviews: 24,
        inStock: true,
        description: "Comfortable cotton t-shirt perfect for casual wear"
    },
    {
        id: 2,
        name: "Elegant Casual Shirt",
        price: 549,
        originalPrice: 699,
        image: "https://via.placeholder.com/300x300/f0f0f0/cccccc?text=Elegant+Shirt",
        category: "women",
        subcategory: "shirts",
        rating: 4.9,
        reviews: 18,
        inStock: true,
        description: "Stylish casual shirt for professional and casual occasions"
    },
    {
        id: 3,
        name: "Comfortable Chinos",
        price: 899,
        originalPrice: 1199,
        image: "https://via.placeholder.com/300x300/f0f0f0/cccccc?text=Comfortable+Chinos",
        category: "men",
        subcategory: "pants",
        rating: 4.7,
        reviews: 32,
        inStock: true,
        description: "Premium chino pants with modern fit"
    },
    {
        id: 4,
        name: "Stylish Palazzo Pants",
        price: 749,
        originalPrice: 999,
        image: "https://via.placeholder.com/300x300/f0f0f0/cccccc?text=Palazzo+Pants",
        category: "women",
        subcategory: "pants",
        rating: 4.6,
        reviews: 15,
        inStock: false,
        description: "Flowy palazzo pants perfect for summer"
    },
    {
        id: 5,
        name: "Premium Cotton Polo",
        price: 449,
        originalPrice: 599,
        image: "https://via.placeholder.com/300x300/f0f0f0/cccccc?text=Cotton+Polo",
        category: "men",
        subcategory: "shirts",
        rating: 4.8,
        reviews: 28,
        inStock: true,
        description: "High-quality polo shirt with elegant finish"
    },
    {
        id: 6,
        name: "Trendy Crop Top",
        price: 199,
        originalPrice: 299,
        image: "https://via.placeholder.com/300x300/f0f0f0/cccccc?text=Crop+Top",
        category: "women",
        subcategory: "t-shirts",
        rating: 4.5,
        reviews: 21,
        inStock: true,
        description: "Modern crop top perfect for summer styling"
    }
];

let filteredProducts = [...products];
let currentViewMode = 'grid';

// Initialize products page
document.addEventListener('DOMContentLoaded', function() {
    initializeFiltersFromURL();
    renderProducts();
    updateProductsCount();
});

// Initialize filters from URL parameters
function initializeFiltersFromURL() {
    const category = getUrlParameter('category');
    const subcategory = getUrlParameter('subcategory');
    
    if (category) {
        document.getElementById('category').value = category;
    }
    if (subcategory) {
        document.getElementById('subcategory').value = subcategory;
    }
    
    filterProducts();
}

// Filter products based on current filter values
function filterProducts() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const selectedCategory = document.getElementById('category').value;
    const selectedSubcategory = document.getElementById('subcategory').value;
    const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice').value) || 2000;
    
    // Update price range display
    document.getElementById('priceRangeDisplay').textContent = `${minPrice} - ${maxPrice} EGP`;
    
    filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                             product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSubcategory = selectedSubcategory === 'all' || product.subcategory === selectedSubcategory;
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
        
        return matchesSearch && matchesCategory && matchesSubcategory && matchesPrice;
    });
    
    // Update URL parameters
    setUrlParameter('category', selectedCategory !== 'all' ? selectedCategory : null);
    setUrlParameter('subcategory', selectedSubcategory !== 'all' ? selectedSubcategory : null);
    
    renderProducts();
    updateProductsCount();
}

// Sort products
function sortProducts() {
    const sortBy = document.getElementById('sortBy').value;
    
    switch (sortBy) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        default: // name
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }
    
    renderProducts();
}

// Set view mode (grid or list)
function setViewMode(mode) {
    currentViewMode = mode;
    
    // Update button states
    document.getElementById('gridViewBtn').classList.toggle('active', mode === 'grid');
    document.getElementById('listViewBtn').classList.toggle('active', mode === 'list');
    
    // Update products grid class
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.className = mode === 'grid' ? 'products-grid' : 'products-grid products-list';
    
    renderProducts();
}

// Render products
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const noProductsDiv = document.getElementById('noProducts');
    
    if (filteredProducts.length === 0) {
        productsGrid.style.display = 'none';
        noProductsDiv.style.display = 'block';
        return;
    }
    
    productsGrid.style.display = 'grid';
    noProductsDiv.style.display = 'none';
    
    productsGrid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
}

// Create product card HTML
function createProductCard(product) {
    const stars = createStarsHTML(product.rating);
    const isListView = currentViewMode === 'list';
    
    return `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${!product.inStock ? `
                    <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
                        <span style="background: white; color: var(--foreground); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 500;">
                            Out of Stock
                        </span>
                    </div>
                ` : ''}
                <button 
                    style="position: absolute; top: 0.75rem; right: 0.75rem; background: rgba(255,255,255,0.8); border: none; padding: 0.5rem; border-radius: 50%; opacity: 0; transition: opacity 0.3s ease; cursor: pointer;"
                    onmouseenter="this.style.background='white'"
                    onmouseleave="this.style.background='rgba(255,255,255,0.8)'"
                    aria-label="Add to wishlist"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"></path>
                    </svg>
                </button>
            </div>
            <div class="product-info">
                <p class="product-category" style="text-transform: capitalize;">${product.category} • ${product.subcategory}</p>
                <h3 class="product-name">${product.name}</h3>
                ${isListView ? `<p class="product-description">${product.description}</p>` : ''}
                <div class="product-rating">
                    ${stars}
                    <span class="rating-text">(${product.rating}) • ${product.reviews} reviews</span>
                </div>
                <div class="product-price" style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="price-current">${formatPrice(product.price)}</span>
                        <span class="price-original">${formatPrice(product.originalPrice)}</span>
                    </div>
                    ${isListView && product.inStock ? `
                        <button 
                            class="add-to-cart-btn" 
                            onclick="addToCart(${product.id}, '${product.name}')"
                            ${!product.inStock ? 'disabled' : ''}
                        >
                            Add to Cart
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Create stars HTML
function createStarsHTML(rating) {
    const fullStars = Math.floor(rating);
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
        const isFilled = i < fullStars;
        stars.push(`
            <svg class="star ${isFilled ? '' : 'empty'}" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
        `);
    }
    
    return stars.join('');
}

// Update products count
function updateProductsCount() {
    const count = filteredProducts.length;
    document.getElementById('productsCount').textContent = `${count} products found`;
}

// Debounced filter function for search input
const debouncedFilter = debounce(filterProducts, 300);

// Add event listener for search input
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', debouncedFilter);
    }
});

// Add hover effects for product cards
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effect for wishlist buttons
    const style = document.createElement('style');
    style.textContent = `
        .product-card:hover button[aria-label="Add to wishlist"] {
            opacity: 1 !important;
        }
    `;
    document.head.appendChild(style);
});

// Handle category-specific filtering from URL
document.addEventListener('DOMContentLoaded', function() {
    // If coming from category links, update subcategory options
    const categorySelect = document.getElementById('category');
    const subcategorySelect = document.getElementById('subcategory');
    
    if (categorySelect && subcategorySelect) {
        categorySelect.addEventListener('change', function() {
            const selectedCategory = this.value;
            
            // Reset subcategory when category changes
            subcategorySelect.value = 'all';
            
            // You could extend this to show only relevant subcategories
            // based on the selected category
        });
    }
});
