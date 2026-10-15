
const orderSummary = document.getElementById("order-summary");
const orderForm = document.getElementById("orderForm");
const orderMessage = document.getElementById("orderMessage");
const placeOrderBtn = document.getElementById("placeOrderBtn");

function readCart() {
  try {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    return Array.isArray(cart) ? cart : [];
  } catch {
    return [];
  }
}

function showOrderSummary() {
  const cart = readCart();

  if (cart.length === 0) {
    orderSummary.innerHTML = "<p>Your cart is empty. Please add food first.</p>";
    placeOrderBtn.disabled = true;
    return;
  }

  let total = 0;

  const rows = cart.map(item => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    const subtotal = price * quantity;

    total += subtotal;

    return `
      <p>
        ${escapeHTML(item.food_name)} × ${quantity}
        <span style="float:right">₹${subtotal.toFixed(2)}</span>
      </p>
    `;
  }).join("");

  orderSummary.innerHTML = `
    ${rows}
    <hr>
    <h3>Total: ₹${total.toFixed(2)}</h3>
  `;

  placeOrderBtn.disabled = false;
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

orderForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const cart = readCart();

  if (cart.length === 0) {
    orderMessage.textContent = "Your cart is empty.";
    return;
  }

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity || 1),
    0
  );

  const orderData = {
    customerName: document.getElementById("customerName").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
    payment: document.getElementById("payment").value,
    items: cart,
    total: total
  };

  placeOrderBtn.disabled = true;
  orderMessage.textContent = "Submitting your order...";

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Order could not be placed.");
    }

    orderMessage.textContent =
      "Order submitted successfully! " +
      (result.message || "Thank you for ordering from Crave Corner.");

    localStorage.removeItem("cart");
    showOrderSummary();

    orderForm.reset();

  } catch (error) {
    orderMessage.textContent =
      error.message + " Please check your server and try again.";
    console.error("Checkout error:", error);
  } finally {
    placeOrderBtn.disabled = readCart().length === 0;
  }
});

showOrderSummary();
