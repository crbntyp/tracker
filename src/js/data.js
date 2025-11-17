// API wrapper for backend communication
class API {
  static async fetch(url, options = {}) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        credentials: 'include' // Include cookies for session
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login if not authenticated
          window.location.href = '/login.html';
          throw new Error('Not authenticated');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async get(url) {
    return this.fetch(url);
  }

  static async post(url, data) {
    return this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async delete(url) {
    return this.fetch(url, {
      method: 'DELETE'
    });
  }
}

// Cache for entries
let entriesCache = null;
let settingsCache = null;

// Initialize storage (fetch all entries from backend)
async function initStorage() {
  try {
    console.log('initStorage - Fetching entries from API...');
    entriesCache = await API.get('/api/entries');
    console.log('initStorage - Entries fetched:', entriesCache.length, 'entries');
    console.log('initStorage - Entries data:', entriesCache);
    settingsCache = await API.get('/api/settings');
  } catch (error) {
    console.error('Error initializing storage:', error);
    entriesCache = [];
    settingsCache = {
      weightUnit: 'kg',
      notificationsEnabled: false
    };
  }
}

// Get settings
function getSettings() {
  return settingsCache || {
    weightUnit: 'kg',
    notificationsEnabled: false
  };
}

// Update settings
async function updateSettings(updates) {
  try {
    settingsCache = await API.post('/api/settings', updates);
    return settingsCache;
  } catch (error) {
    console.error('Error updating settings:', error);
    return settingsCache;
  }
}

// Get today's entry
function getTodayEntry() {
  const today = new Date().toISOString().split('T')[0];
  return getEntry(today);
}

// Get entry by date
function getEntry(date) {
  if (!entriesCache) {
    return createEmptyEntry(date);
  }

  const entry = entriesCache.find(e => e.date === date);
  return entry || createEmptyEntry(date);
}

// Save/update entry
async function saveEntry(date, data) {
  console.log('saveEntry called with date:', date, 'data:', data);
  try {
    const existing = getEntry(date);
    const merged = { ...existing, ...data, date };
    console.log('Merged data:', merged);

    console.log('Calling API.post...');
    const result = await API.post('/api/entries', merged);
    console.log('API.post result:', result);

    // Update cache
    if (entriesCache) {
      const index = entriesCache.findIndex(e => e.date === date);
      if (index >= 0) {
        console.log('Updating existing entry in cache at index', index);
        entriesCache[index] = result;
      } else {
        console.log('Adding new entry to cache');
        entriesCache.push(result);
      }
      console.log('Cache now has', entriesCache.length, 'entries');
    } else {
      console.warn('entriesCache is null!');
    }

    return result;
  } catch (error) {
    console.error('Error saving entry:', error);
    throw error; // Re-throw so the UI can catch it
  }
}

// Get all entries
function getAllEntries() {
  console.log('getAllEntries called - cache:', entriesCache);
  return entriesCache || [];
}

// Delete entry
async function deleteEntry(date) {
  try {
    await API.delete(`/api/entries/${date}`);

    // Update cache
    if (entriesCache) {
      entriesCache = entriesCache.filter(e => e.date !== date);
    }
  } catch (error) {
    console.error('Error deleting entry:', error);
  }
}

// Create empty entry structure
function createEmptyEntry(date) {
  return {
    date: date,
    weight: null,
    lunch: { logged: false },
    dinner: { logged: false },
    drinks: [],
    notes: ''
  };
}

// Save weight for specific date
async function saveWeightForDate(date, value, unit, time) {
  console.log('saveWeightForDate called:', date, value, unit, time);
  const data = {
    weight: {
      value: parseFloat(value),
      unit: unit,
      time: time,
      timestamp: Date.now()
    }
  };
  console.log('Calling saveEntry with:', date, data);
  const result = await saveEntry(date, data);
  console.log('saveWeightForDate result:', result);
  return result;
}

// Save weight (legacy - defaults to today)
async function saveWeight(value, unit, time) {
  const today = new Date().toISOString().split('T')[0];
  return saveWeightForDate(today, value, unit, time);
}

// Save lunch for specific date
async function saveLunchForDate(date, description, calories, time) {
  const data = {
    lunch: {
      description: description,
      calories: calories ? parseInt(calories) : null,
      time: time,
      timestamp: Date.now(),
      logged: true
    }
  };
  return await saveEntry(date, data);
}

// Save lunch (legacy - defaults to today)
async function saveLunch(description, calories, time) {
  const today = new Date().toISOString().split('T')[0];
  return saveLunchForDate(today, description, calories, time);
}

// Save dinner for specific date
async function saveDinnerForDate(date, description, calories, time) {
  const data = {
    dinner: {
      description: description,
      calories: calories ? parseInt(calories) : null,
      time: time,
      timestamp: Date.now(),
      logged: true
    }
  };
  return await saveEntry(date, data);
}

// Save dinner (legacy - defaults to today)
async function saveDinner(description, calories, time) {
  const today = new Date().toISOString().split('T')[0];
  return saveDinnerForDate(today, description, calories, time);
}

// Add drink for specific date
async function addDrinkForDate(date, type, amount, time) {
  const entry = getEntry(date);

  const drink = {
    type: type,
    amount: amount,
    time: time,
    timestamp: Date.now()
  };

  entry.drinks.push(drink);
  return await saveEntry(date, entry);
}

// Add drink (legacy - defaults to today)
async function addDrink(type, amount, time) {
  const today = new Date().toISOString().split('T')[0];
  return addDrinkForDate(today, type, amount, time);
}

// Export all data
function exportData() {
  const allData = {
    settings: getSettings(),
    entries: getAllEntries()
  };
  const dataStr = JSON.stringify(allData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Import data (kept for backward compatibility, but won't upload to server)
function importData(file) {
  alert('Import from file is not available in cloud mode. Your data is automatically synced!');
}

// Get current time in HH:mm format
function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Format date for display
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Initialize storage on load
initStorage();
