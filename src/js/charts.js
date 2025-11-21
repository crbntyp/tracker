// Charts functionality using Chart.js - Dark Theme

let weightChart = null;
let changeRateChart = null;
let weeklyComparisonChart = null;
let calorieChart = null;
let stepsChart = null;
let nutritionChart = null;
let currentPeriod = 365; // Default to All Time

// Chart.js defaults for dark theme
Chart.defaults.color = '#cbd5e1'; // text-secondary
Chart.defaults.borderColor = 'rgba(100, 116, 139, 0.2)';
Chart.defaults.font.family = "'Muli', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

// Initialize charts page
function initCharts() {
  // Skeletons are already showing from HTML initialization
  // Small delay to show skeletons, then load real data
  setTimeout(() => {
    const chartsGrid = document.querySelector('.charts-grid');
    if (chartsGrid) chartsGrid.classList.add('fade-in');

    initWeightChart(currentPeriod);
    initChangeRateChart(currentPeriod);
    initWeeklyComparisonChart(currentPeriod);
    initStepsChart(currentPeriod);
    initNutritionChart(currentPeriod);
    displayStatistics(currentPeriod);
    setupPeriodButtons();
    setupTabButtons();
  }, 300);
}

// Setup tab buttons
function setupTabButtons() {
  const tabButtons = document.querySelectorAll('.chart-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');

      // Remove active class from all tabs and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked tab and corresponding content
      this.classList.add('active');
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });
}

// Show charts skeleton
function showChartsSkeleton() {
  const loadingHTML = `
    <div style="height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;">
      <div class="loading-spinner"></div>
      <p style="color: white; font-size: 16px; font-weight: 500;">Hang tight champ, loading...</p>
    </div>
  `;

  // Weight chart skeleton
  const weightCanvas = document.getElementById('weightChart');
  if (weightCanvas && weightCanvas.parentElement) {
    weightCanvas.parentElement.innerHTML = loadingHTML;
  }

  // Change rate chart skeleton
  const changeCanvas = document.getElementById('changeRateChart');
  if (changeCanvas && changeCanvas.parentElement) {
    changeCanvas.parentElement.innerHTML = loadingHTML;
  }

  // Weekly comparison chart skeleton
  const weeklyCanvas = document.getElementById('weeklyComparisonChart');
  if (weeklyCanvas && weeklyCanvas.parentElement) {
    weeklyCanvas.parentElement.innerHTML = loadingHTML;
  }

  // Steps chart skeleton
  const stepsCanvas = document.getElementById('stepsChart');
  if (stepsCanvas && stepsCanvas.parentElement) {
    stepsCanvas.parentElement.innerHTML = loadingHTML;
  }

  // Nutrition chart skeleton
  const nutritionCanvas = document.getElementById('nutritionChart');
  if (nutritionCanvas && nutritionCanvas.parentElement) {
    nutritionCanvas.parentElement.innerHTML = loadingHTML;
  }

  // Statistics skeleton
  const statsContainer = document.getElementById('weightStats');
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div style="height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;">
        <div class="loading-spinner"></div>
        <p style="color: white; font-size: 16px; font-weight: 500;">Hang tight champ, loading...</p>
      </div>
    `;
  }
}

// Initialize weight chart
function initWeightChart(days) {
  let canvas = document.getElementById('weightChart');

  // Recreate canvas if it was destroyed by loading skeleton
  if (!canvas) {
    // Find the chart container by searching through chart-sections
    const sections = document.querySelectorAll('.chart-section');
    for (const section of sections) {
      if (section.textContent.includes('Weight Trend')) {
        const container = section.querySelector('.chart-container');
        if (container) {
          container.innerHTML = '<canvas id="weightChart"></canvas>';
          canvas = document.getElementById('weightChart');
          break;
        }
      }
    }
  }

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
      initStepsChart(period);
      initNutritionChart(period);
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
  let canvas = document.getElementById('changeRateChart');

  // Recreate canvas if it was destroyed by loading skeleton
  if (!canvas) {
    const sections = document.querySelectorAll('.chart-section');
    for (const section of sections) {
      if (section.textContent.includes('Weight Change Rate')) {
        const container = section.querySelector('.chart-container');
        if (container) {
          container.innerHTML = '<canvas id="changeRateChart"></canvas>';
          canvas = document.getElementById('changeRateChart');
          break;
        }
      }
    }
  }

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
  let canvas = document.getElementById('weeklyComparisonChart');

  // Recreate canvas if it was destroyed by loading skeleton
  if (!canvas) {
    const sections = document.querySelectorAll('.chart-section');
    for (const section of sections) {
      if (section.textContent.includes('Weekly Average')) {
        const container = section.querySelector('.chart-container');
        if (container) {
          container.innerHTML = '<canvas id="weeklyComparisonChart"></canvas>';
          canvas = document.getElementById('weeklyComparisonChart');
          break;
        }
      }
    }
  }

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

// Initialize steps chart
function initStepsChart(days) {
  let canvas = document.getElementById('stepsChart');

  // Recreate canvas if it was destroyed by loading skeleton
  if (!canvas) {
    const sections = document.querySelectorAll('.chart-section');
    for (const section of sections) {
      if (section.textContent.includes('Steps Trend')) {
        const container = section.querySelector('.chart-container');
        if (container) {
          container.innerHTML = '<canvas id="stepsChart"></canvas>';
          canvas = document.getElementById('stepsChart');
          break;
        }
      }
    }
  }

  if (!canvas) return;

  const entries = getLastNDaysEntries(days);
  const stepsData = entries
    .filter(e => e.steps && e.steps > 0)
    .map(e => ({ date: e.date, steps: e.steps }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (stepsData.length === 0) {
    canvas.parentElement.innerHTML = '<p class="no-data-message">No steps data available yet. Start tracking your steps to see trends!</p>';
    return;
  }

  const labels = stepsData.map(d => formatDateShort(d.date));
  const data = stepsData.map(d => d.steps);

  // Calculate 7-day moving average
  const movingAverage = calculateMovingAverage(data, 7);

  // Destroy existing chart if it exists
  if (stepsChart) {
    stepsChart.destroy();
  }

  const ctx = canvas.getContext('2d');
  stepsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Steps',
        data: data,
        borderColor: '#60a5fa',
        backgroundColor: 'rgba(96, 165, 250, 0.15)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#60a5fa',
        pointBorderColor: '#0a0a0a',
        pointBorderWidth: 3,
        pointHoverBackgroundColor: '#3b82f6',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3,
        borderWidth: 3
      }, {
        label: '7-Day Average',
        data: movingAverage,
        borderColor: '#34d399',
        backgroundColor: 'transparent',
        tension: 0.4,
        fill: false,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: '#34d399',
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
          borderColor: 'rgba(96, 165, 250, 0.3)',
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
              return `Steps: ${context.parsed.y.toLocaleString()}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
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
              return value.toLocaleString();
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

// Initialize nutrition chart
function initNutritionChart(days) {
  let canvas = document.getElementById('nutritionChart');

  // Recreate canvas if it was destroyed by loading skeleton
  if (!canvas) {
    const sections = document.querySelectorAll('.chart-section');
    for (const section of sections) {
      if (section.textContent.includes('Nutrition Trends')) {
        const container = section.querySelector('.chart-container');
        if (container) {
          container.innerHTML = '<canvas id="nutritionChart"></canvas>';
          canvas = document.getElementById('nutritionChart');
          break;
        }
      }
    }
  }

  if (!canvas) return;

  const entries = getLastNDaysEntries(days);

  // Aggregate nutrition data by date
  const nutritionByDate = {};

  entries.forEach(entry => {
    if (entry.meals) {
      let dailyTotals = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      };

      // Sum up all meals for the day
      Object.values(entry.meals).forEach(mealItems => {
        if (Array.isArray(mealItems)) {
          mealItems.forEach(item => {
            dailyTotals.calories += item.calories || 0;
            dailyTotals.protein += item.protein || 0;
            dailyTotals.carbs += item.carbs || 0;
            dailyTotals.fat += item.fat || 0;
          });
        }
      });

      // Only include days with nutrition data
      if (dailyTotals.calories > 0 || dailyTotals.protein > 0 || dailyTotals.carbs > 0 || dailyTotals.fat > 0) {
        nutritionByDate[entry.date] = dailyTotals;
      }
    }
  });

  const nutritionData = Object.entries(nutritionByDate)
    .map(([date, totals]) => ({ date, ...totals }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (nutritionData.length === 0) {
    canvas.parentElement.innerHTML = '<p class="no-data-message">No nutrition data available yet. Start tracking your meals to see trends!</p>';
    return;
  }

  const labels = nutritionData.map(d => formatDateShort(d.date));
  const caloriesData = nutritionData.map(d => Math.round(d.calories));
  const proteinData = nutritionData.map(d => Math.round(d.protein));
  const carbsData = nutritionData.map(d => Math.round(d.carbs));
  const fatData = nutritionData.map(d => Math.round(d.fat));

  // Destroy existing chart if it exists
  if (nutritionChart) {
    nutritionChart.destroy();
  }

  const ctx = canvas.getContext('2d');
  nutritionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Calories (kcal)',
          data: caloriesData,
          borderColor: '#fbbf24',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 5,
          yAxisID: 'y'
        },
        {
          label: 'Protein (g)',
          data: proteinData,
          borderColor: '#60a5fa',
          backgroundColor: 'rgba(96, 165, 250, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 5,
          yAxisID: 'y1'
        },
        {
          label: 'Carbs (g)',
          data: carbsData,
          borderColor: '#f472b6',
          backgroundColor: 'rgba(244, 114, 182, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 5,
          yAxisID: 'y1'
        },
        {
          label: 'Fat (g)',
          data: fatData,
          borderColor: '#34d399',
          backgroundColor: 'rgba(52, 211, 153, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 3,
          pointHoverRadius: 5,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15,
            font: { size: 12 }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          titleColor: '#fed202',
          bodyColor: '#cbd5e1',
          padding: 12,
          borderColor: 'rgba(254, 210, 2, 0.2)',
          borderWidth: 1,
          displayColors: true,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += context.parsed.y;
              return label;
            }
          }
        }
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Calories (kcal)',
            color: '#fbbf24'
          },
          grid: { color: 'rgba(100, 116, 139, 0.1)' },
          ticks: {
            color: '#fbbf24'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Macros (g)',
            color: '#cbd5e1'
          },
          grid: { display: false },
          ticks: {
            color: '#cbd5e1'
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    }
  });
}

// Initialization is now handled in charts.html
