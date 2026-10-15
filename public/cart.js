
console.log("cart.js loaded successfully");

const cartContent = document.getElementById("cart-content");
const cartMessage = document.getElementById("cart-message");
const cartCount = document.querySelector(".cart-count");

function getCart() {
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch (error) {
    console.error("Could not read cart:", error);
    return [];
  }
}

function displayCart() {
  const cart = getCart();

  // Update the navigation cart count
  const count = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  if (cartCount) {
    cartCount.textContent = count;
  }

  // Show empty cart message
  if (cart.length === 0) {
    cartContent.innerHTML = `
      <div class="cart-empty">
        <h2>Your cart is empty 🛒</h2>
        <p>Visit our menu and add your favourite food!</p>
        <a href="menu.html" class="btn">Explore Menu</a>
      </div>
    `;
    return;
  }

  let total = 0;

  const rows = cart.map(item => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    const subtotal = price * quantity;

    total += subtotal;

    return `
      <tr>
        <td>${escapeHTML(item.food_name)}</td>
        <td>₹${price.toFixed(2)}</td>
        <td>
          <button type="button" class="quantity-btn"
            data-id="${Number(item.food_id)}" data-change="-1">−</button>

          <span>${quantity}</span>

          <button type="button" class="quantity-btn"
            data-id="${Number(item.food_id)}" data-change="1">+</button>
        </td>
        <td>₹${subtotal.toFixed(2)}</td>
        <td>
          <button type="button" class="remove-btn"
            data-id="${Number(item.food_id)}">Remove</button>
        </td>
      </tr>
    `;
  }).join("");

  cartContent.innerHTML = `
    <div class="cart-table-wrapper">
      <table class="cart-table">
        <thead>
          <tr>
            <th>Food Item</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Subtotal</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="cart-summary">
        <h2>Total: ₹${total.toFixed(2)}</h2>
        <a href="order.html" class="btn">Proceed to Order</a>
        <button type="button" id="clear-cart" class="remove-btn">
          Clear Cart
        </button>
      </div>
    </div>
  `;
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

// Handle quantity buttons, remove, and clear cart
cartContent.addEventListener("click", function(event) {
  const button = event.target.closest("button");
  if (!button) return;

  let cart = getCart();

  if (button.id === "clear-cart") {
    localStorage.setItem("cart", "[]");
    if (cartMessage) cartMessage.textContent = "Cart cleared.";
    displayCart();
    return;
  }

  const foodId = Number(button.dataset.id);

  if (button.classList.contains("remove-btn")) {
    cart = cart.filter(item => Number(item.food_id) !== foodId);
  } else if (button.classList.contains("quantity-btn")) {
    const item = cart.find(
      food => Number(food.food_id) === foodId
    );

    if (item) {
      item.quantity = Number(item.quantity || 1)
        + Number(button.dataset.change);

      if (item.quantity <= 0) {
        cart = cart.filter(food =>
          Number(food.food_id) !== foodId
        );
      }
    }
  } else {
    return;
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
});

displayCart();
