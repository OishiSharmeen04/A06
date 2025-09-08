let allPlants = [];

// loading spinner
const loadingSpinner = (isLoading) => {
  const spin = document.getElementById("spin");
  const container = document.getElementById("plants-container");

  if (isLoading) {
    spin.classList.remove("hidden");
  } else {
    spin.classList.add("hidden");
  }
};

// Load All Plants
const loadAllPlants = () => {
  loadingSpinner(true);

  fetch("https://openapi.programming-hero.com/api/plants")
    .then(res => res.json())
    .then(json => {
      if (json && (json.data || json.plants)) {
        allPlants = json.data || json.plants;
        displayPlants(allPlants);
      }
      loadingSpinner(false);
    });
};

// Display Plants
const displayPlants = (plants) => {
  const container = document.getElementById("plants-container");
  container.innerHTML = "";

  plants.forEach(plant => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-2xl shadow-xl w-full flex flex-col overflow-hidden";

    card.innerHTML = `
      <div class="bg-white rounded-2xl shadow flex flex-col h-full">
        <!-- Image -->
        <div class="w-full h-40 bg-gray-200 rounded-t-2xl overflow-hidden">
          <img src="${plant.image}" alt="${plant.name}" class="w-full h-full object-cover"/>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-3 flex flex-col flex-1">
          <!-- Title -->
          <h2 class="font-semibold text-gray-900 cursor-pointer hover:text-green-700">
            ${plant.name}
          </h2>

          <!-- Description -->
          <p class="text-sm text-gray-600 line-clamp-2">
            ${plant.description || "No description available"}
          </p>

          <!-- Category + Price -->
          <div class="flex items-center justify-between">
            <span class="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              ${plant.category || "Unknown"}
            </span>
            <span class="font-medium text-gray-800">
              ${plant.price ? "৳" + plant.price : "৳0"}
            </span>
          </div>

          <!-- Button -->
          <button 
            class="add-to-cart-btn w-full bg-green-600 text-white py-2.5 rounded-full font-medium hover:bg-green-700 transition mt-auto"
            data-name="${plant.name}" 
            data-price="${plant.price ? plant.price : 0}"
          >
            Add to Cart
          </button>
        </div>
      </div>
    `;

    // Title click -> open DaisyUI modal
    const title = card.querySelector("h2");
    title.addEventListener("click", () => {
      const modal = document.getElementById("my_modal_5");
      const modalContent = modal.querySelector("#modal-content");
      modalContent.innerHTML = `
        <h3 class="font-bold text-xl mb-2">${plant.name}</h3>
        <img src="${plant.image}" alt="${plant.name}" class="w-full h-64 object-cover rounded-lg mb-4"/>
        <p class="text-sm mb-1"><span class="font-bold">Category:</span> ${plant.category || "Unknown"}</p>
        <p class="text-sm mb-1"><span class="font-bold">Price:</span> ${plant.price ? "৳" + plant.price : "৳0"}</p>
        <p class="text-sm mb-1"><span class="font-bold">Description:</span> ${plant.description || "No description available"}</p>
      `;
      modal.showModal();
    });

    // Add to Cart listener
    const addBtn = card.querySelector(".add-to-cart-btn");
    addBtn.addEventListener("click", addToCart);

    container.appendChild(card);
  });
};

// Load Categories
const loadCategories = async () => {
  const res = await fetch("https://openapi.programming-hero.com/api/categories");
  const json = await res.json();
  displayCategories(json.data || json.categories);
};

// Display Categories
const displayCategories = (categories) => {
  const levelCategories = document.getElementById("all-categories");
  levelCategories.innerHTML = "";

  const removeActive = () => {
    const allBtns = levelCategories.querySelectorAll("button");
    allBtns.forEach(btn => btn.classList.remove("bg-[#15803D]", "text-white"));
  };

  const allBtn = document.createElement("button");
  allBtn.textContent = "All Trees";
  allBtn.className = "w-full text-left pl-2 py-2 rounded hover:bg-[#15803D] hover:text-white active:bg-[#15803D]/80 transition";
  allBtn.addEventListener("click", () => {
    removeActive();
    allBtn.classList.add("bg-[#15803D]", "text-white");
    displayPlants(allPlants);
  });
  levelCategories.appendChild(allBtn);

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat.category_name;
    btn.className = "w-full text-left pl-2 py-2 rounded hover:bg-[#15803D] hover:text-white active:bg-[#15803D]/80 transition";
    btn.addEventListener("click", () => {
      removeActive();
      btn.classList.add("bg-[#15803D]", "text-white");
      const filtered = allPlants.filter(plant => plant.category === cat.category_name);
      displayPlants(filtered);
    });
    levelCategories.appendChild(btn);
  });
};

const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
let total = 0;
const cartData = {};

function addToCart(event) {
  const btn = event.target;
  const name = btn.dataset.name;
  const price = parseFloat(btn.dataset.price);

  // remove "No items yet."
  const firstChild = cartItems.querySelector("p.text-gray-500");
  if (firstChild) firstChild.remove();

  if (cartData[name]) {
    // Item already in cart → increase quantity
    cartData[name].quantity += 1;

    const itemDiv = cartData[name].dom;
    itemDiv.querySelector(".item-quantity").textContent = `x${cartData[name].quantity}`;
  } else {
    // New item
    const item = document.createElement("div");
    item.classList.add("flex", "justify-between", "items-center", "p-2", "border-b", "border-gray-200", "mb-1", "rounded-lg", "bg-green-50");

    item.innerHTML = `
      <div class="flex flex-col">
        <span class="font-medium text-gray-900">${name}</span>
        <span class="text-sm text-gray-600 item-quantity">x1</span>
      </div>
      <div class="flex items-center gap-4">
        <span class="cursor-pointer text-red-500 font-bold text-lg remove-btn">✕</span>
      </div>
    `;

    cartItems.appendChild(item);

    cartData[name] = {
      quantity: 1,
      unitPrice: price,
      dom: item
    };

    // Remove listener (quantity decrease)
    const removeBtn = item.querySelector(".remove-btn");
    removeBtn.addEventListener("click", () => {
      cartData[name].quantity -= 1;

      if (cartData[name].quantity > 0) {
        const itemDiv = cartData[name].dom;
        itemDiv.querySelector(".item-quantity").textContent = `x${cartData[name].quantity}`;
      } else {
        cartData[name].dom.remove();
        delete cartData[name];
      }

      // Update total
      total = Object.values(cartData).reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      cartTotal.textContent = `৳${total.toFixed(2)}`;

      // Show empty message if cart empty
      if (cartItems.children.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.classList.add("text-gray-500");
        emptyMsg.textContent = "No items yet.";
        cartItems.appendChild(emptyMsg);
      }
    });
  }

  // Update total
  total = Object.values(cartData).reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  cartTotal.textContent = `৳${total.toFixed(2)}`;
}



// Initialize
loadCategories();
loadAllPlants();
