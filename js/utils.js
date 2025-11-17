// Utility functions for the app

// Get date string in YYYY-MM-DD format (using local timezone)
function getDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get week start (Monday) for a given date
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
  d.setDate(diff);
  return d;
}

// Get array of dates for a week starting from given date
function getWeekDates(startDate) {
  const dates = [];
  const current = new Date(startDate);

  for (let i = 0; i < 7; i++) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Format date for display
function formatDateLong(dateStr) {
  // Parse date string as local date to avoid timezone issues
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format date short (e.g., "Jan 15")
function formatDateShort(dateStr) {
  // Parse date string as local date to avoid timezone issues
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

// Check if date is today
function isToday(dateStr) {
  const today = getDateString(new Date());
  return dateStr === today;
}

// Get entries for date range
function getEntriesInRange(startDate, endDate) {
  const allEntries = getAllEntries();
  return allEntries.filter(entry => {
    return entry.date >= startDate && entry.date <= endDate;
  });
}

// Calculate weight statistics
function calculateWeightStats(entries) {
  const weights = entries
    .filter(e => e.weight && e.weight.value)
    .map(e => ({
      date: e.date,
      value: e.weight.value,
      unit: e.weight.unit
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (weights.length === 0) {
    return null;
  }

  const values = weights.map(w => w.value);
  const startWeight = values[0];
  const currentWeight = values[values.length - 1];
  const change = currentWeight - startWeight;
  const minWeight = Math.min(...values);
  const maxWeight = Math.max(...values);
  const avgWeight = values.reduce((a, b) => a + b, 0) / values.length;

  return {
    startWeight,
    currentWeight,
    change,
    changePercent: ((change / startWeight) * 100).toFixed(1),
    minWeight,
    maxWeight,
    avgWeight: avgWeight.toFixed(1),
    totalEntries: weights.length,
    unit: weights[0].unit,
    weights
  };
}

// Calculate meal logging statistics
function calculateMealStats(entries) {
  const totalDays = entries.length;
  if (totalDays === 0) {
    return null;
  }

  const lunchCount = entries.filter(e => e.lunch && e.lunch.logged).length;
  const dinnerCount = entries.filter(e => e.dinner && e.dinner.logged).length;
  const weightCount = entries.filter(e => e.weight).length;
  const drinksCount = entries.filter(e => e.drinks && e.drinks.length > 0).length;

  return {
    totalDays,
    lunchCount,
    dinnerCount,
    weightCount,
    drinksCount,
    lunchRate: ((lunchCount / totalDays) * 100).toFixed(0),
    dinnerRate: ((dinnerCount / totalDays) * 100).toFixed(0),
    weightRate: ((weightCount / totalDays) * 100).toFixed(0),
    drinksRate: ((drinksCount / totalDays) * 100).toFixed(0)
  };
}

// Get entries for last N days (or all if days >= 365)
function getLastNDaysEntries(days) {
  if (days >= 365) {
    // Show all entries for "All Time"
    return getAllEntries();
  }

  const endDate = getDateString(new Date());
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);

  return getEntriesInRange(getDateString(startDate), endDate);
}
