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

  // Check if nutrition data is missing or all zeros
  const hasNutritionData = calories > 0 || protein > 0 || carbs > 0 || fat > 0;

  detailsDiv.innerHTML = `
    <div class="food-card">
      ${product.image_url ? `<img src="${product.image_url}" alt="${product.product_name}">` : ''}
      <div>
        <h4>${product.product_name || 'Unknown Product'}</h4>
        <p><strong>Brand:</strong> ${product.brands || 'Unknown'}</p>

        <h5>Nutrition (per 100g):</h5>
        <ul>
          <li>Calories <strong>${calories} kcal</strong></li>
          <li>Protein <strong>${protein}g</strong></li>
          <li>Carbs <strong>${carbs}g</strong></li>
          <li>Fat <strong>${fat}g</strong></li>
          <li>Sugars <strong>${sugar}g</strong></li>
        </ul>

        ${!hasNutritionData ? `
          <div class="nutrition-warning">
            <i class="las la-exclamation-triangle"></i>
            <span>Nutrition data is missing or incomplete</span>
          </div>
        ` : ''}

        <div class="food-card-actions">
          ${!hasNutritionData ? `
            <button class="btn btn-secondary" onclick="openManualNutritionModal()">
              <i class="las la-edit"></i> Enter Manually
            </button>
          ` : ''}
          <button class="btn btn-primary" onclick="openAddToMealModal()">
            <i class="las la-plus"></i> Add to Meal
          </button>
        </div>
      </div>
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

  // Save entry to database
  await saveEntry(date, entry);

  // Add to recent items
  addToRecentItems(foodItem);
}

// Migrate localStorage recent items to database (one-time)
async function migrateRecentItemsToDatabase() {
  const localItems = localStorage.getItem('recentFoodItems');
  if (!localItems) return; // Nothing to migrate

  try {
    const items = JSON.parse(localItems);
    if (items.length === 0) {
      localStorage.removeItem('recentFoodItems');
      return;
    }

    // Add each item to the database
    for (const item of items) {
      await addToRecentItems(item);
    }

    // Clear localStorage after successful migration
    localStorage.removeItem('recentFoodItems');
    console.log('Migrated', items.length, 'recent items to database');
  } catch (error) {
    console.error('Error migrating recent items:', error);
  }
}

// Add to recent items
async function addToRecentItems(foodItem) {
  try {
    await API.post(buildPath('/api/recent-foods'), {
      name: foodItem.name,
      brand: foodItem.brand,
      barcode: foodItem.barcode,
      image: foodItem.image,
      calories: foodItem.calories,
      protein: foodItem.protein,
      carbs: foodItem.carbs,
      fat: foodItem.fat,
      sugar: foodItem.sugar
    });
  } catch (error) {
    console.error('Error saving to recent items:', error);
  }
}

// Load and display recent items
async function loadRecentItems() {
  const listDiv = document.getElementById('saved-items-list');

  try {
    const recentItems = await API.fetch(buildPath('/api/recent-foods'));

    if (!recentItems || recentItems.length === 0) {
      // Show 3 skeleton placeholders
      listDiv.innerHTML = `
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
      `;
      return;
    }

    listDiv.innerHTML = recentItems.map(item => `
      <div class="saved-item" onclick="quickAddFromRecent('${item.barcode}')">
        <div class="saved-item-info">
          <div class="saved-item-name">${item.name}</div>
          <div class="saved-item-macros">
            ${Math.round(item.calories)} kcal | P: ${Math.round(item.protein)}g | C: ${Math.round(item.carbs)}g | F: ${Math.round(item.fat)}g
          </div>
        </div>
        <i class="las la-plus" style="font-size: 24px; color: var(--accent-color);"></i>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading recent items:', error);
    listDiv.innerHTML = `
      <div class="skeleton-item"></div>
      <div class="skeleton-item"></div>
      <div class="skeleton-item"></div>
    `;
  }
}

// Quick add from recent items
async function quickAddFromRecent(barcode) {
  try {
    // Get recent items from API
    const recentItems = await API.fetch(buildPath('/api/recent-foods'));
    const item = recentItems.find(i => i.barcode === barcode);

    if (!item) {
      alert('Product not found in recent items');
      return;
    }

    // Reconstruct the product object from stored data
    currentProduct = {
      product_name: item.name,
      brands: item.brand || '',
      code: item.barcode,
      image_url: item.image_url || '',
      nutriments: {
        'energy-kcal_100g': parseFloat(item.calories),
        'proteins_100g': parseFloat(item.protein),
        'carbohydrates_100g': parseFloat(item.carbs),
        'fat_100g': parseFloat(item.fat),
        'sugars_100g': parseFloat(item.sugar)
      }
    };

    openAddToMealModal();
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

// Add manual entry (when user enters food data manually)
function addManualEntry() {
  const name = document.getElementById('manual-name').value.trim();
  const calories = parseFloat(document.getElementById('manual-entry-calories').value) || 0;
  const protein = parseFloat(document.getElementById('manual-entry-protein').value) || 0;
  const carbs = parseFloat(document.getElementById('manual-entry-carbs').value) || 0;
  const fat = parseFloat(document.getElementById('manual-entry-fat').value) || 0;
  const sugar = parseFloat(document.getElementById('manual-entry-sugar').value) || 0;

  if (!name) {
    alert('Please enter a food name');
    return;
  }

  // Create a product object compatible with the rest of the app
  currentProduct = {
    product_name: name,
    brands: 'Manual Entry',
    code: 'manual-' + Date.now(),
    image_url: '',
    nutriments: {
      'energy-kcal_100g': calories,
      'proteins_100g': protein,
      'carbohydrates_100g': carbs,
      'fat_100g': fat,
      'sugars_100g': sugar
    }
  };

  // Clear the form
  document.getElementById('manual-name').value = '';
  document.getElementById('manual-entry-calories').value = '';
  document.getElementById('manual-entry-protein').value = '';
  document.getElementById('manual-entry-carbs').value = '';
  document.getElementById('manual-entry-fat').value = '';
  document.getElementById('manual-entry-sugar').value = '';

  // Open meal selection modal
  openAddToMealModal();
}

// Open manual nutrition entry modal
function openManualNutritionModal() {
  if (!currentProduct) return;

  // Pre-fill with existing values if any
  const nutriments = currentProduct.nutriments || {};

  document.getElementById('manual-calories').value = nutriments['energy-kcal_100g'] || '';
  document.getElementById('manual-protein').value = nutriments.proteins_100g || '';
  document.getElementById('manual-carbs').value = nutriments.carbohydrates_100g || '';
  document.getElementById('manual-fat').value = nutriments.fat_100g || '';
  document.getElementById('manual-sugar').value = nutriments.sugars_100g || '';

  openModal('manualNutritionModal');
}

// Save manual nutrition data
function saveManualNutrition() {
  if (!currentProduct) return;

  const calories = parseFloat(document.getElementById('manual-calories').value) || 0;
  const protein = parseFloat(document.getElementById('manual-protein').value) || 0;
  const carbs = parseFloat(document.getElementById('manual-carbs').value) || 0;
  const fat = parseFloat(document.getElementById('manual-fat').value) || 0;
  const sugar = parseFloat(document.getElementById('manual-sugar').value) || 0;

  // Update product with manual nutrition data
  if (!currentProduct.nutriments) {
    currentProduct.nutriments = {};
  }

  currentProduct.nutriments['energy-kcal_100g'] = calories;
  currentProduct.nutriments.proteins_100g = protein;
  currentProduct.nutriments.carbohydrates_100g = carbs;
  currentProduct.nutriments.fat_100g = fat;
  currentProduct.nutriments.sugars_100g = sugar;

  // Close modal and refresh display
  closeModal('manualNutritionModal');
  displayFoodDetails(currentProduct);

  showNotification('Nutrition data updated!');
}
