// Charts functionality using Chart.js - Dark Theme

let weightChart = null;
let changeRateChart = null;
let weeklyComparisonChart = null;
let calorieChart = null;
let currentPeriod = 365; // Default to All Time

// Chart.js defaults for dark theme
Chart.defaults.color = '#cbd5e1'; // text-secondary
Chart.defaults.borderColor = 'rgba(100, 116, 139, 0.2)';
Chart.defaults.font.family = "'Muli', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// Initialize charts page
function initCharts() {
  initWeightChart(currentPeriod);
  initChangeRateChart(currentPeriod);
  initWeeklyComparisonChart(currentPeriod);
  displayStatistics(currentPeriod);
  setupPeriodButtons();
}

// Initialize weight chart
function initWeightChart(days) {
  const canvas = document.getElementById('weightChart');
  if (!canvas) return;

  const entries = getLastNDaysEntries(days);
  console.log('Chart - Total entries:', getAllEntries().length);
  console.log('Chart - Filtered entries for', days, 'days:', entries.length);
  console.log('Chart - Entries:', entries);

  const weightStats = calculateWeightStats(entries);
  console.log('Chart - Weight stats:', weightStats);

  if (!weightStats || weightStats.weights.length === 0) {
    canvas.parentElement.innerHTML = '<p class="no-data-message">No weight data available yet. Start tracking your weight to see charts!</p>';
    return;
  }

  const labels = weightStats.weights.map(w => formatDateShort(w.date));
  const data = weightStats.weights.map(w => w.value);

  // Calculate 7-day moving average
  const movingAverage = calculateMovingAverage(data, 7);

  // Destroy existing chart if it exists
  if (weightChart) {
    weightChart.destroy();
  }

  const ctx = canvas.getContext('2d');
  weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `Weight (${weightStats.unit})`,
        data: data,
        borderColor: '#9ca3af',
        backgroundColor: 'rgba(156, 163, 175, 0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#9ca3af',
        pointBorderColor: '#0a0a0a',
        pointBorderWidth: 3,
        pointHoverBackgroundColor: '#6b7280',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3,
        borderWidth: 3
      }, {
        label: `7-Day Average (${weightStats.unit})`,
        data: movingAverage,
        borderColor: '#4ade80',
        backgroundColor: 'transparent',
        tension: 0.4,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#4ade80',
        borderWidth: 2,
        borderDash: [5, 5]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(17, 17, 17, 0.95)',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          borderColor: 'rgba(255, 69, 0, 0.3)',
          borderWidth: 1,
          padding: 16,
          titleFont: {
            size: 14,
            weight: '600'
          },
          bodyFont: {
            size: 13,
            weight: '500'
          },
          displayColors: false,
          callbacks: {
            label: function(context) {
              return `Weight: ${context.parsed.y} ${weightStats.unit}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(100, 116, 139, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#94a3b8',
            font: {
              size: 12,
              weight: '500'
            },
            callback: function(value) {
              return value + ' ' + weightStats.unit;
            }
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: '#94a3b8',
            font: {
              size: 12,
              weight: '500'
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

// Display weight statistics
function displayStatistics(days) {
  const statsEl = document.getElementById('weightStats');
  if (!statsEl) return;

  const entries = getLastNDaysEntries(days);
  const stats = calculateWeightStats(entries);

  if (!stats) {
    statsEl.innerHTML = '<p class="no-data-message">No weight data available</p>';
    return;
  }

  const changeClass = stats.change >= 0 ? 'positive' : 'negative';
  const changeIcon = stats.change >= 0 ? '↑' : '↓';

  statsEl.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Starting Weight</div>
      <div class="stat-value">${stats.startWeight} ${stats.unit}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Current Weight</div>
      <div class="stat-value">${stats.currentWeight} ${stats.unit}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Change</div>
      <div class="stat-value ${changeClass}">
        ${changeIcon} ${Math.abs(stats.change).toFixed(1)} ${stats.unit}
        <span class="stat-percent">(${stats.changePercent}%)</span>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Average</div>
      <div class="stat-value">${stats.avgWeight} ${stats.unit}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Minimum</div>
      <div class="stat-value">${stats.minWeight} ${stats.unit}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Maximum</div>
      <div class="stat-value">${stats.maxWeight} ${stats.unit}</div>
    </div>
  `;
}

// Display weight logging statistics
function displayMealStats(days) {
  const statsEl = document.getElementById('mealStats');
  if (!statsEl) return;

  const entries = getLastNDaysEntries(days);
  const stats = calculateMealStats(entries);

  if (!stats) {
    statsEl.innerHTML = '<p class="no-data-message">No data available</p>';
    return;
  }

  statsEl.innerHTML = `
    <div class="progress-item">
      <div class="progress-header">
        <span class="progress-label">Weight Entries</span>
        <span class="progress-value">${stats.weightRate}% (${stats.weightCount}/${stats.totalDays})</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${stats.weightRate}%"></div>
      </div>
    </div>
  `;
}

// Setup period selection buttons
function setupPeriodButtons() {
  const buttons = document.querySelectorAll('.period-btn');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      buttons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');

      // Update charts with new period
      const period = parseInt(this.getAttribute('data-period'));
      currentPeriod = period;
      initWeightChart(period);
      initChangeRateChart(period);
      initWeeklyComparisonChart(period);
      displayStatistics(period);
    });
  });
}

// Calculate moving average
function calculateMovingAverage(data, windowSize) {
  if (data.length < windowSize) return data;

  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      result.push(null);
    } else {
      const sum = data.slice(i - windowSize + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / windowSize);
    }
  }
  return result;
}

// Initialize weight change rate chart
function initChangeRateChart(days) {
  const canvas = document.getElementById('changeRateChart');
  if (!canvas) return;

  const entries = getLastNDaysEntries(days);
  const weightStats = calculateWeightStats(entries);

  if (!weightStats || weightStats.weights.length < 2) {
    canvas.parentElement.innerHTML = '<p class="no-data-message">Need at least 2 weight entries to show change rate.</p>';
    return;
  }

  // Calculate week-over-week changes
  const changes = [];
  const labels = [];

  for (let i = 1; i < weightStats.weights.length; i++) {
    const prev = weightStats.weights[i - 1];
    const curr = weightStats.weights[i];
    const daysDiff = (new Date(curr.date) - new Date(prev.date)) / (1000 * 60 * 60 * 24);
    const change = curr.value - prev.value;
    const weeklyRate = (change / daysDiff) * 7; // Convert to per week

    changes.push(weeklyRate);
    labels.push(formatDateShort(curr.date));
  }

  if (changeRateChart) {
    changeRateChart.destroy();
  }

  const ctx = canvas.getContext('2d');
  changeRateChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: `Weight Change (${weightStats.unit}/week)`,
        data: changes,
        backgroundColor: changes.map(c => c < 0 ? 'rgba(74, 222, 128, 0.6)' : 'rgba(239, 68, 68, 0.6)'),
        borderColor: changes.map(c => c < 0 ? '#4ade80' : '#ef4444'),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(17, 17, 17, 0.95)',
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              const sign = value >= 0 ? '+' : '';
              return `${sign}${value.toFixed(2)} ${weightStats.unit}/week`;
            }
          }
        }
      },
      scales: {
        y: {
          grid: { color: 'rgba(100, 116, 139, 0.1)' },
          ticks: {
            callback: function(value) {
              return value.toFixed(1);
            }
          }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

// Initialize weekly comparison chart
function initWeeklyComparisonChart(days) {
  const canvas = document.getElementById('weeklyComparisonChart');
  if (!canvas) return;

  const entries = getLastNDaysEntries(days);
  const weights = entries
    .filter(e => e.weight && e.weight.value)
    .map(e => ({ date: new Date(e.date), value: e.weight.value, unit: e.weight.unit }))
    .sort((a, b) => a.date - b.date);

  if (weights.length === 0) {
    canvas.parentElement.innerHTML = '<p class="no-data-message">No weight data available for comparison.</p>';
    return;
  }

  // Group by week
  const weeklyData = {};
  weights.forEach(w => {
    const weekStart = getWeekStart(w.date);
    const weekKey = getDateString(weekStart);
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = [];
    }
    weeklyData[weekKey].push(w.value);
  });

  // Calculate averages
  const labels = Object.keys(weeklyData).sort();
  const averages = labels.map(key => {
    const values = weeklyData[key];
    return values.reduce((a, b) => a + b, 0) / values.length;
  });

  if (weeklyComparisonChart) {
    weeklyComparisonChart.destroy();
  }

  const ctx = canvas.getContext('2d');
  weeklyComparisonChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.map(l => 'Week of ' + formatDateShort(l)),
      datasets: [{
        label: `Weekly Average (${weights[0].unit})`,
        data: averages,
        backgroundColor: 'rgba(156, 163, 175, 0.6)',
        borderColor: '#9ca3af',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: { color: 'rgba(100, 116, 139, 0.1)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });
}

// Initialize calorie chart
function initCalorieChart(days) {
  const canvas = document.getElementById('calorieChart');
  if (!canvas) return;

  const entries = getLastNDaysEntries(days);
  const calorieData = entries
    .filter(e => (e.lunch?.calories || e.dinner?.calories))
    .map(e => ({
      date: e.date,
      lunch: e.lunch?.calories || 0,
      dinner: e.dinner?.calories || 0,
      total: (e.lunch?.calories || 0) + (e.dinner?.calories || 0)
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (calorieData.length === 0) {
    canvas.parentElement.innerHTML = '<p class="no-data-message">No calorie data available. Add calorie information to your meals!</p>';
    return;
  }

  const labels = calorieData.map(d => formatDateShort(d.date));

  if (calorieChart) {
    calorieChart.destroy();
  }

  const ctx = canvas.getContext('2d');
  calorieChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Lunch (cal)',
        data: calorieData.map(d => d.lunch),
        backgroundColor: 'rgba(255, 107, 0, 0.6)',
        borderColor: '#ff6b00',
        borderWidth: 2,
        stack: 'Stack 0'
      }, {
        label: 'Dinner (cal)',
        data: calorieData.map(d => d.dinner),
        backgroundColor: 'rgba(220, 38, 38, 0.6)',
        borderColor: '#dc2626',
        borderWidth: 2,
        stack: 'Stack 0'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true },
        tooltip: {
          backgroundColor: 'rgba(17, 17, 17, 0.95)',
          callbacks: {
            footer: function(items) {
              const total = items.reduce((sum, item) => sum + item.parsed.y, 0);
              return `Total: ${total} cal`;
            }
          }
        }
      },
      scales: {
        y: {
          stacked: true,
          grid: { color: 'rgba(100, 116, 139, 0.1)' },
          ticks: {
            callback: function(value) {
              return value + ' cal';
            }
          }
        },
        x: {
          stacked: true,
          grid: { display: false }
        }
      }
    }
  });
}

// Initialize when page loads
if (document.getElementById('weightChart')) {
  document.addEventListener('DOMContentLoaded', async function() {
    // Wait for data to load
    if (typeof initStorage === 'function') {
      await initStorage();
    }
    initCharts();
  });
}
