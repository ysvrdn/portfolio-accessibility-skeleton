document.addEventListener('DOMContentLoaded', () => {
    // State Management
    let products = [];
    let cart = [];
    let currentRoute = 'catalog'; // Client-side routing state

    // DOM Elements
    const viewContainer = document.getElementById('ecommerce-view');
    const routeCatalogBtn = document.getElementById('route-catalog');
    const routeCartBtn = document.getElementById('route-cart');
    const cartCountSpan = document.getElementById('cart-count');

    // --- Data Fetching ---
    const fetchProducts = async () => {
        try {
            viewContainer.innerHTML = '<p>Loading products from API...</p>';
            const response = await fetch('https://fakestoreapi.com/products?limit=6');
            if (!response.ok) throw new Error('Network response was not ok');
            products = await response.json();
            renderView();
        } catch (error) {
            viewContainer.innerHTML = `<p class="error">Error loading products: ${error.message}</p>`;
        }
    };

    // --- Client-Side Routing Logic ---
    const navigateTo = (route) => {
        currentRoute = route;
        
        // Update active navigation styles
        routeCatalogBtn.classList.toggle('active', route === 'catalog');
        routeCatalogBtn.setAttribute('aria-pressed', route === 'catalog');
        
        routeCartBtn.classList.toggle('active', route === 'cart');
        routeCartBtn.setAttribute('aria-pressed', route === 'cart');

        renderView();
    };

    // --- View Rendering ---
    const renderView = () => {
        viewContainer.innerHTML = ''; // Clear current view

        if (currentRoute === 'catalog') {
            renderCatalog();
        } else if (currentRoute === 'cart') {
            renderCart();
        }
    };

    const renderCatalog = () => {
        const grid = document.createElement('div');
        grid.className = 'product-grid';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            // Optimizing assets: constraining image sizes
            card.innerHTML = `
                <img src="${product.image}" alt="${product.title}" loading="lazy">
                <div class="product-info">
                    <h4>${product.title.substring(0, 30)}...</h4>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                </div>
            `;
            grid.appendChild(card);
        });

        viewContainer.appendChild(grid);
    };

    const renderCart = () => {
        if (cart.length === 0) {
            viewContainer.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }

        const cartList = document.createElement('div');
        cartList.className = 'cart-list';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <span>${item.title.substring(0, 20)}...</span>
                <span>$${item.price.toFixed(2)}</span>
                <button class="remove-btn" data-index="${index}">Remove</button>
            `;
            cartList.appendChild(cartItem);
        });

        const totalEl = document.createElement('div');
        totalEl.className = 'cart-total';
        totalEl.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;

        viewContainer.appendChild(cartList);
        viewContainer.appendChild(totalEl);
    };

    // --- Actions (Cart Mutations) ---
    const addToCart = (productId) => {
        const product = products.find(p => p.id === parseInt(productId));
        if (product) {
            cart.push(product);
            cartCountSpan.textContent = cart.length;
        }
    };

    const removeFromCart = (index) => {
        cart.splice(index, 1);
        cartCountSpan.textContent = cart.length;
        renderView(); // Re-render cart after removal
    };

    // --- Event Delegation ---
    viewContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            addToCart(e.target.dataset.id);
            // Visual feedback
            const originalText = e.target.textContent;
            e.target.textContent = 'Added!';
            setTimeout(() => e.target.textContent = originalText, 1000);
        } else if (e.target.classList.contains('remove-btn')) {
            removeFromCart(e.target.dataset.index);
        }
    });

    routeCatalogBtn.addEventListener('click', () => navigateTo('catalog'));
    routeCartBtn.addEventListener('click', () => navigateTo('cart'));

    // Initialize Application
    fetchProducts();
});
