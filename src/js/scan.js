// Barcode scanning functionality
let html5QrcodeScanner = null;
let currentProduct = null;

// Start the camera scanner
async function startScanner() {
  const scannerContainer = document.getElementById('scanner-container');

  if (html5QrcodeScanner) {
    return;
  }

  try {
    html5QrcodeScanner = new Html5Qrcode("scanner-container");

    await html5QrcodeScanner.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      (decodedText) => {
        // Auto search when barcode detected
        document.getElementById('barcode-input').value = decodedText;
        searchBarcode();
        stopScanner();
      },
      (errorMessage) => {
        // Ignore scan errors
      }
    );

    document.getElementById('start-scan-btn').style.display = 'none';
    document.getElementById('stop-scan-btn').style.display = 'inline-block';
  } catch (err) {
    console.error('Error starting scanner:', err);
    alert('Unable to start camera. Please check permissions or use manual search.');
  }
}

// Stop the camera scanner
function stopScanner() {
  if (html5QrcodeScanner) {
    html5QrcodeScanner.stop().then(() => {
      html5QrcodeScanner = null;
      document.getElementById('start-scan-btn').style.display = 'inline-block';
      document.getElementById('stop-scan-btn').style.display = 'none';
    }).catch(err => {
      console.error('Error stopping scanner:', err);
    });
  }
}

// Search barcode manually
async function searchBarcode() {
  const barcode = document.getElementById('barcode-input').value.trim();
  if (!barcode) {
    alert('Please enter a barcode');
    return;
  }

  showNotification('Searching...');

  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();

    if (data.status === 1) {
      currentProduct = data.product;
      displayFoodDetails(currentProduct);
      showNotification('Product found!');
    } else {
      alert('Product not found');
      showNotification('Product not found');
    }
  } catch (error) {
    console.error('Error searching barcode:', error);
    alert('Error searching for product');
    showNotification('Error searching for product');
  }
}

// Display food details
function displayFoodDetails(product) {
  const resultsDiv = document.getElementById('scan-results');
  const detailsDiv = document.getElementById('food-details');

  resultsDiv.style.display = 'block';

  const nutriments = product.nutriments || {};
  const calories = nutriments['energy-kcal_100g'] || 0;
  const protein = nutriments.proteins_100g || 0;
  const carbs = nutriments.carbohydrates_100g || 0;
  const fat = nutriments.fat_100g || 0;
  const sugar = nutriments.sugars_100g || 0;

  detailsDiv.innerHTML = `
    <div class="food-card">
      ${product.image_url ? `<img src="${product.image_url}" alt="${product.product_name}">` : ''}
      <h4>${product.product_name || 'Unknown Product'}</h4>
      <p><strong>Brand:</strong> ${product.brands || 'Unknown'}</p>

      <h5>Nutrition (per 100g):</h5>
      <ul>
        <li>Calories: ${calories} kcal</li>
        <li>Protein: ${protein} g</li>
        <li>Carbs: ${carbs} g</li>
        <li>Fat: ${fat} g</li>
        <li>Sugars: ${sugar} g</li>
      </ul>

      <button class="btn-primary" onclick="openAddToMealModal()">
        <i class="las la-plus"></i> Add to Meal
      </button>
    </div>
  `;

  // Scroll to results
  resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Open the add to meal modal
function openAddToMealModal() {
  if (!currentProduct) return;

  document.getElementById('modal-product-name').textContent = currentProduct.product_name || 'Unknown Product';

  // Clear previous selection
  document.querySelectorAll('.meal-button').forEach(b => b.classList.remove('selected'));

  openModal('addToMealModal');
}

// Confirm adding to meal
async function confirmAddToMeal() {
  const selectedMealBtn = document.querySelector('.meal-button.selected');
  if (!selectedMealBtn) {
    alert('Please select a meal type');
    return;
  }

  const mealType = selectedMealBtn.dataset.meal;
  const date = document.getElementById('meal-date').value;

  if (!date) {
    alert('Please select a date');
    return;
  }

  if (!currentProduct) {
    alert('No product selected');
    return;
  }

  // Save to meals
  await addFoodToMeal(date, mealType, currentProduct);

  showNotification(`Added to ${mealType}!`);
  closeModal('addToMealModal');

  // Refresh recent items
  loadRecentItems();
}

// Add food to meal
async function addFoodToMeal(date, mealType, product) {
  const entry = getEntry(date);

  if (!entry.meals) {
    entry.meals = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: []
    };
  }

  const nutriments = product.nutriments || {};
  const foodItem = {
    name: product.product_name || 'Unknown',
    brand: product.brands || '',
    barcode: product.code || '',
    image: product.image_url || '',
    calories: nutriments['energy-kcal_100g'] || 0,
    protein: nutriments.proteins_100g || 0,
    carbs: nutriments.carbohydrates_100g || 0,
    fat: nutriments.fat_100g || 0,
    sugar: nutriments.sugars_100g || 0,
    timestamp: new Date().toISOString()
  };

  entry.meals[mealType].push(foodItem);

  await saveData();

  // Add to recent items
  addToRecentItems(foodItem);
}

// Add to recent items
function addToRecentItems(foodItem) {
  let recentItems = JSON.parse(localStorage.getItem('recentFoodItems') || '[]');

  // Remove duplicates (same barcode)
  recentItems = recentItems.filter(item => item.barcode !== foodItem.barcode);

  // Add to front
  recentItems.unshift(foodItem);

  // Keep only last 10 items
  recentItems = recentItems.slice(0, 10);

  localStorage.setItem('recentFoodItems', JSON.stringify(recentItems));
}

// Load and display recent items
function loadRecentItems() {
  const recentItems = JSON.parse(localStorage.getItem('recentFoodItems') || '[]');
  const listDiv = document.getElementById('saved-items-list');

  if (recentItems.length === 0) {
    listDiv.innerHTML = '<p style="color: #999; text-align: center;">No recent items</p>';
    return;
  }

  listDiv.innerHTML = recentItems.map(item => `
    <div class="saved-item" onclick="quickAddFromRecent('${item.barcode}')">
      <div class="saved-item-info">
        <div class="saved-item-name">${item.name}</div>
        <div class="saved-item-macros">
          ${item.calories} kcal | P: ${item.protein}g | C: ${item.carbs}g | F: ${item.fat}g
        </div>
      </div>
      <i class="las la-plus" style="font-size: 24px; color: var(--accent-color);"></i>
    </div>
  `).join('');
}

// Quick add from recent items
async function quickAddFromRecent(barcode) {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();

    if (data.status === 1) {
      currentProduct = data.product;
      openAddToMealModal();
    } else {
      alert('Product not found');
    }
  } catch (error) {
    console.error('Error loading product:', error);
    alert('Error loading product');
  }
}

// Calculate daily nutrition totals
function getDailyNutritionTotals(date) {
  const entry = getEntry(date);

  if (!entry.meals) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0
    };
  }

  let totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0
  };

  // Sum up all meals
  Object.values(entry.meals).forEach(mealItems => {
    mealItems.forEach(item => {
      totals.calories += item.calories || 0;
      totals.protein += item.protein || 0;
      totals.carbs += item.carbs || 0;
      totals.fat += item.fat || 0;
      totals.sugar += item.sugar || 0;
    });
  });

  return totals;
}
