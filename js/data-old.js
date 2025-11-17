// Data management functions for tracker app

// Initialize storage
function initStorage() {
  if (!localStorage.getItem('tracker-settings')) {
    const defaults = {
      userName: 'Jonny',
      weightUnit: 'kg',
      notificationsEnabled: false
    };
    localStorage.setItem('tracker-settings', JSON.stringify(defaults));
  }
}

// Get settings
function getSettings() {
  const data = localStorage.getItem('tracker-settings');
  return data ? JSON.parse(data) : null;
}

// Update settings
function updateSettings(updates) {
  const current = getSettings();
  const merged = { ...current, ...updates };
  localStorage.setItem('tracker-settings', JSON.stringify(merged));
  return merged;
}

// Get today's entry
function getTodayEntry() {
  const today = new Date().toISOString().split('T')[0];
  return getEntry(today);
}

// Get entry by date
function getEntry(date) {
  const key = `tracker-${date}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : createEmptyEntry(date);
}

// Save/update entry
function saveEntry(date, data) {
  const key = `tracker-${date}`;
  const existing = getEntry(date);
  const merged = { ...existing, ...data };
  localStorage.setItem(key, JSON.stringify(merged));
  return merged;
}

// Get all entries
function getAllEntries() {
  const entries = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('tracker-') && key !== 'tracker-settings') {
      const entry = JSON.parse(localStorage.getItem(key));
      entries.push(entry);
    }
  }
  return entries.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Delete entry
function deleteEntry(date) {
  const key = `tracker-${date}`;
  localStorage.removeItem(key);
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

// Save weight
function saveWeight(value, unit, time) {
  const today = new Date().toISOString().split('T')[0];
  const data = {
    weight: {
      value: parseFloat(value),
      unit: unit,
      time: time,
      timestamp: Date.now()
    }
  };
  return saveEntry(today, data);
}

// Save lunch
function saveLunch(description, calories, time) {
  const today = new Date().toISOString().split('T')[0];
  const data = {
    lunch: {
      description: description,
      calories: calories ? parseInt(calories) : null,
      time: time,
      timestamp: Date.now(),
      logged: true
    }
  };
  return saveEntry(today, data);
}

// Save dinner
function saveDinner(description, calories, time) {
  const today = new Date().toISOString().split('T')[0];
  const data = {
    dinner: {
      description: description,
      calories: calories ? parseInt(calories) : null,
      time: time,
      timestamp: Date.now(),
      logged: true
    }
  };
  return saveEntry(today, data);
}

// Add drink
function addDrink(type, amount, time) {
  const today = new Date().toISOString().split('T')[0];
  const entry = getEntry(today);

  const drink = {
    type: type,
    amount: amount,
    time: time,
    timestamp: Date.now()
  };

  entry.drinks.push(drink);
  return saveEntry(today, entry);
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

// Import data
function importData(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      localStorage.setItem('tracker-settings', JSON.stringify(data.settings));
      data.entries.forEach(entry => {
        localStorage.setItem(`tracker-${entry.date}`, JSON.stringify(entry));
      });
      alert('Data imported successfully!');
      location.reload();
    } catch (error) {
      alert('Error importing data: ' + error.message);
    }
  };
  reader.readAsText(file);
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
