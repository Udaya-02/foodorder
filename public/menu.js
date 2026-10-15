
console.log("menu.js loaded successfully");

const foodList = document.getElementById("foodList");
const addFoodForm = document.getElementById("addFoodForm");
const formMessage = document.getElementById("formMessage");

// Load all food items from the database
async function loadFoodItems() {
  foodList.innerHTML =
    '<tr><td colspan="7">Loading menu...</td></tr>';

  try {
    const response = await fetch("/api/food");

    if (!response.ok) {
      throw new Error("Could not load food items");
    }

    const foods = await response.json();

    if (!foods.length) {
      foodList.innerHTML =
        '<tr><td colspan="7">No food items found.</td></tr>';
      return;
    }

    // Display food items with Add to Cart buttons
    foodList.innerHTML = foods.map(food => `
      <tr>
        <td>${food.food_id}</td>
        <td>${escapeHTML(food.food_name)}</td>
        <td>${escapeHTML(food.category)}</td>
        <td>₹${Number(food.price).toFixed(2)}</td>
        <td>${escapeHTML(food.description || "-")}</td>
        <td>
          ${Number(food.availability) === 1
            ? "Available"
            : "Not Available"}
        </td>
        <td>
          <button
            type="button"
            class="add-to-cart-btn"
            data-id="${food.food_id}"
            ${Number(food.availability) === 1 ? "" : "disabled"}>
            ${Number(food.availability) === 1
              ? "Add to Cart"
              : "Unavailable"}
          </button>
        </td>
      </tr>
    `).join("");

  } catch (error) {
    foodList.innerHTML =
      '<tr><td colspan="7">Could not load menu. Check your server.</td></tr>';

    console.error("Menu loading error:", error);
  }
}

// Prevent HTML characters in food details from being interpreted as markup
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function(char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char];
  });
}

// Add a new food item
addFoodForm.addEventListener("submit", async function(event) {
  event.preventDefault();

  const data = {
    food_name: document.getElementById("food_name").value.trim(),
    category: document.getElementById("category").value,
    price: Number(document.getElementById("price").value),
    description: document.getElementById("description").value.trim(),
    availability:
      document.getElementById("availability").value === "true"
  };

  formMessage.textContent = "Adding food item...";

  try {
    const response = await fetch("/api/food", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Could not add food item");
    }

    formMessage.textContent = "Food item added successfully!";

    addFoodForm.reset();

    await loadFoodItems();

  } catch (error) {
    formMessage.textContent = error.message;
    console.error("Add food error:", error);
  }
});

// Add food items to the shopping cart
foodList.addEventListener("click", function(event) {
  const button = event.target.closest(".add-to-cart-btn");

  if (!button || button.disabled) {
    return;
  }

  const row = button.closest("tr");
  const cells = row.querySelectorAll("td");

  const food = {
    food_id: Number(button.dataset.id),
    food_name: cells[1].textContent,
    price: Number(cells[3].textContent.replace("₹", "")),
    quantity: 1
  };

  let cart = [];

  try {
    cart = JSON.parse(localStorage.getItem("cart") || "[]");

    if (!Array.isArray(cart)) {
      cart = [];
    }
  } catch (error) {
    cart = [];
  }

  // Increase quantity if this food is already in the cart
  const existing = cart.find(function(item) {
    return Number(item.food_id) === food.food_id;
  });

  if (existing) {
    existing.quantity = Number(existing.quantity || 0) + 1;
  } else {
    cart.push(food);
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  button.textContent = "Added ✓";

  console.log("Updated cart:", cart);
});

// Load menu when the page opens
loadFoodItems();
