// Global variables
let sneakersData = []; // To store the sneakers data
let cart = []; // To store the items in the cart

// Function to fetch data from db.json
async function fetchSneakers() {
    try {
        const response = await fetch('http://localhost:3000/sneakers'); // Replace with your API endpoint
        sneakersData = await response.json();

        // Display sneakers
        displaySneakers(sneakersData);
    } catch (error) {
        console.error('Error fetching data: ', error);
    }
}

// Function to update the cart data in the database
async function updateCartInDatabase() {
    try {
        const response = await fetch('http://localhost:3000/cart', {
            method: 'PUT', // Use PUT request to update the cart
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cart }),
        });

        if (response.ok) {
            console.log('Cart data updated in the database.');
        } else {
            console.error('Error updating cart data in the database.');
        }
    } catch (error) {
        console.error('Error updating cart data: ', error);
    }
}


// Function to display sneakers in rows of 4 cards
function displaySneakers(sneakers) {
    const catalog = document.getElementById('product-catalog');
    catalog.innerHTML = ''; // Clear existing content

    for (let i = 0; i < sneakers.length; i += 4) {
        const row = document.createElement('div');
        row.classList.add('row');

        for (let j = i; j < i + 4 && j < sneakers.length; j++) {
            const sneaker = sneakers[j];
            const card = createSneakerCard(sneaker);
            row.appendChild(card);
        }

        catalog.appendChild(row);
    }
}


// Function to create a card for a sneaker
function createSneakerCard(sneaker) {
    const card = document.createElement('div');
    card.classList.add('col-md-3', 'product-card');

    card.innerHTML = `
        <div class="card">
            <img src="${sneaker.image}" alt="${sneaker.name}">
            <div class="card-body">
                <h3 class="card-title">${sneaker.name}</h3>
                <p class="card-text">Description: ${sneaker.description}</p>
                <p class="card-text">Price: $${sneaker.price.toFixed(2)}</p>
                <p class="card-text">Available Sizes: ${sneaker.size.join(', ')}</p>
                <button class="btn btn-primary add-to-cart" data-sneaker-id="${sneaker.id}">Add to Cart</button>
                <button class="btn btn-primary like-button">Like</button>

            </div>
        </div>
    `;

    const addToCartButton = card.querySelector('.add-to-cart');
    addToCartButton.addEventListener('click', addToCart);

    // Add event listener for the "Like" button
    const likeButton = card.querySelector('.like-button');
    likeButton.addEventListener('click', (event) => {
        const card = event.target.closest('.card');
        const titleElement = card.querySelector('.card-title');
        const sneakerTitle = titleElement.textContent;
        toggleLikeStatus(sneakerTitle);
        updateFavoriteSneakers();

        // Toggle the green button class
        likeButton.classList.toggle('like-button-green');
    });

    return card;
}

// Function to add a sneaker to the cart
function addToCart(event) {
    const sneakerId = parseInt(event.target.getAttribute('data-sneaker-id'));
    const selectedSneaker = sneakersData.find(sneaker => sneaker.id === sneakerId);

    if (selectedSneaker) {
        cart.push(selectedSneaker);
        updateCartInDatabase()
        updateCartUI();
        ;
    }
}

// Function to update the shopping cart UI
function updateCartUI() {
    const cartItems = document.querySelector('.cart-items');
    cartItems.innerHTML = ''; // Clear existing content

    cart.forEach(sneaker => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${sneaker.name} - $${sneaker.price.toFixed(2)}
            <button class="btn btn-danger remove-from-cart" data-sneaker-id="${sneaker.id}">Remove</button>
        `;
        cartItems.appendChild(li);
        updateCartInDatabase();
    });

    // Calculate and display the total price
    const totalItems = cart.length;
    const totalPrice = cart.reduce((total, sneaker) => total + sneaker.price, 0);

    document.getElementById('total-items').textContent = totalItems;
    document.getElementById('total-price').textContent = totalPrice.toFixed(2);

    // Add event listeners to "Remove" buttons
    const removeButtons = document.querySelectorAll('.remove-from-cart');
    removeButtons.forEach(button => {
        button.addEventListener('click', removeFromCart);
    });
}

// Function to remove a sneaker from the cart
function removeFromCart(event) {
    const sneakerId = parseInt(event.target.getAttribute('data-sneaker-id'));
    cart = cart.filter(sneaker => sneaker.id !== sneakerId);
    updateCartInDatabase();     // Update the cart data in the database

    updateCartUI();
}

// Array to store liked sneakers
const likedSneakers = [];

// Function to check if a sneaker is liked
function isSneakerLiked(sneakerTitle) {
    return likedSneakers.includes(sneakerTitle);
}

// Function to toggle the like status of a sneaker
function toggleLikeStatus(sneakerTitle) {
    if (isSneakerLiked(sneakerTitle)) {
        // If the sneaker is liked, remove it from the favorites
        const index = likedSneakers.indexOf(sneakerTitle);
        likedSneakers.splice(index, 1);
    } else {
        // If the sneaker is not liked, add it to the favorites
        likedSneakers.push(sneakerTitle);
    }
}

// Function to update the "Favourite Sneakers" section
function updateFavoriteSneakers() {
    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = ''; // Clear the list

    likedSneakers.forEach((sneakerTitle) => {
        // Create a list item for each liked sneaker
        const listItem = document.createElement('li');
        listItem.textContent = sneakerTitle;
        favoritesList.appendChild(listItem);
    });
}

// Add event listeners for "Like" buttons
const likeButtons = document.querySelectorAll('.like-button');
likeButtons.forEach((likeButton) => {
    likeButton.addEventListener('click', (event) => {
        const card = event.target.closest('.card');
        const titleElement = card.querySelector('.card-title');
        const sneakerTitle = titleElement.textContent;
        toggleLikeStatus(sneakerTitle);
        updateFavoriteSneakers();
    });
});

// Function to update the order summary
function updateOrderSummary() {
    const summaryItems = document.getElementById('summary-items');
    summaryItems.innerHTML = ''; // Clear the summary

    cart.forEach(sneaker => {
        const item = document.createElement('div');
        item.innerHTML = `${sneaker.name} - $${sneaker.price.toFixed(2)}`;
        summaryItems.appendChild(item);
    });
}

// Add an event listener to the "Confirm Order" button
const confirmOrderButton = document.getElementById('confirm-order');
confirmOrderButton.addEventListener('click', (event) => {
    event.preventDefault();

    // Get user details from the form
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    // Here, you can send the order data (cart items, user details) to your server or perform other actions as needed.

    // Example: Display a confirmation message
    alert(`Thank you, ${name}! Your order has been confirmed. Check your email at ${email} for order details.`);
});

// Update the order summary when the page loads
updateOrderSummary();


// Initialize the "Favourite Sneakers" section
updateFavoriteSneakers();

// Initialize the application by fetching data
fetchSneakers();
