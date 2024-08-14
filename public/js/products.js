document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/products')
        .then(response => response.json())
        .then(products => displayProducts(products))
        .catch(error => console.error('Error loading products:', error));
});

function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = ''; // Clear the container first
    products.forEach(product => {
        container.innerHTML += `
            <div class="product-item">
                <img src="${product.imageUrl}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>$${product.price}</p>
                <button>Add to Cart</button>
            </div>
        `;
    });
}
