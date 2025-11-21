// Calendar view functionality

let currentWeekStart = getWeekStart(new Date());
let currentMonthDate = new Date();
let selectedDate = null;
let viewMode = 'week'; // 'week' or 'month'

// Initialize calendar
function initCalendar() {
  // Skeletons are already showing from HTML initialization
  // Small delay to show skeletons, then load real data
  setTimeout(() => {
    renderWeekView(currentWeekStart);
    setupCalendarNavigation();
    updateMonthYearDisplay();

    // Auto-select today's date
    const today = getDateString(new Date());
    selectDay(today);
  }, 300);
}

// Show week skeleton
function showWeekSkeleton() {
  const container = document.getElementById('calendar-week');
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: 1 / -1; height: 150px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;">
      <div class="loading-spinner"></div>
      <p style="color: white; font-size: 16px; font-weight: 500;">Hang tight champ, loading...</p>
    </div>
  `;
}

// Show day details skeleton
function showDayDetailsSkeleton() {
  const detailsEl = document.getElementById('day-details');
  if (!detailsEl) return;

  detailsEl.innerHTML = `
    <div style="height: 300px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;">
      <div class="loading-spinner"></div>
      <p style="color: white; font-size: 16px; font-weight: 500;">Hang tight champ, loading...</p>
    </div>
  `;
}

// Render week view
function renderWeekView(weekStart) {
  const container = document.getElementById('calendar-week');
  if (!container) return;

  // Add fade-in to container
  container.classList.add('fade-in');
  container.innerHTML = '';

  const weekDates = getWeekDates(weekStart);
  const today = getDateString(new Date());

  weekDates.forEach(date => {
    const dateStr = getDateString(date);
    const entry = getEntry(dateStr);

    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';

    if (dateStr === today) {
      dayEl.classList.add('today');
    }

    if (selectedDate === dateStr) {
      dayEl.classList.add('selected');
    }

    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = date.getDate();

    // Show weight indicator
    const indicatorText = entry.weight ? '<i class="las la-check-circle"></i>' : '';

    dayEl.innerHTML = `
      <div class="day-name">${dayName}</div>
      <div class="day-num">${dayNum}</div>
      <div class="indicators">${indicatorText}</div>
    `;

    dayEl.addEventListener('click', () => selectDay(dateStr));
    container.appendChild(dayEl);
  });
}

// Select a day and show details
function selectDay(dateStr) {
  selectedDate = dateStr;

  // Re-render the appropriate view based on current mode
  if (viewMode === 'month') {
    renderMonthView(currentMonthDate);
  } else {
    renderWeekView(currentWeekStart);
  }

  showDayDetails(dateStr);

  // Scroll to selected day on mobile
  scrollToSelectedDay();
}

// Scroll to selected day in week view (mobile)
function scrollToSelectedDay() {
  // Only on mobile/tablet and week view
  if (viewMode !== 'week' || window.innerWidth > 768) return;

  const container = document.getElementById('calendar-week');
  const selectedDay = container?.querySelector('.calendar-day.selected');

  if (!container || !selectedDay) return;

  // Use setTimeout to ensure DOM has updated
  setTimeout(() => {
    selectedDay.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }, 100);
}

// Show day details
function showDayDetails(dateStr) {
  const detailsEl = document.getElementById('day-details');
  if (!detailsEl) return;

  const entry = getEntry(dateStr);
  const dateFormatted = formatDateLong(dateStr);

  // Calculate nutrition totals
  const nutritionTotals = calculateDailyNutritionTotals(dateStr);
  const hasMeals = entry.meals && Object.values(entry.meals).some(mealItems => mealItems.length > 0);

  let html = `
    <div class="day-details-header">
      <h3>${dateFormatted}</h3>
      <div class="day-quick-actions">
        ${entry.weight ?
          `<button class="btn btn-sm" onclick="editWeight('${dateStr}', ${entry.weight.value}, '${entry.weight.unit}', '${entry.weight.time}')"><i class="las la-edit"></i> Weight</button>` :
          `<button class="btn btn-sm" onclick="openModalForDate('weightModal', '${dateStr}')"><i class="las la-plus"></i> Weight</button>`
        }
        <button class="btn btn-sm" onclick="openModalForDateGym('${dateStr}', ${entry.gym})"><i class="las ${entry.gym ? 'la-edit' : 'la-plus'}"></i> Gym/Walks</button>
        <button class="btn btn-sm" onclick="openModalForDateSupplements('${dateStr}')"><i class="las ${entry.supplements ? 'la-edit' : 'la-plus'}"></i> Supplements</button>
        <button class="btn btn-sm" onclick="openModalForDateSteps('${dateStr}')"><i class="las ${entry.steps ? 'la-edit' : 'la-plus'}"></i> Steps</button>
        <button class="btn btn-sm" onclick="window.location.href='${buildPath('/scan.html')}'"><i class="las ${hasMeals ? 'la-utensils' : 'la-plus'}"></i> Nutrition</button>
      </div>
    </div>

    <div class="day-details-grid">
      <div class="day-details-left">
        <!-- Weight -->
        ${entry.weight ? `
          <div class="detail-item">
            <strong>Weight:</strong>
            <span>${entry.weight.value} ${entry.weight.unit} at ${entry.weight.time}</span>
          </div>
        ` : `
          <div class="detail-item empty">
            <strong>Weight:</strong>
            <span>Not logged</span>
          </div>
        `}

        <!-- Gym -->
        <div class="detail-item${entry.gym ? '' : ' empty'}">
          <strong>Gym or 3k+ walks:</strong>
          <span>${entry.gym ? '✓ Yes' : '✗ No'}</span>
        </div>

        <!-- Supplements -->
        <div class="detail-item${entry.supplements ? '' : ' empty'}">
          <strong>Supplements:</strong>
          <span>${entry.supplements || 'None'}</span>
        </div>

        <!-- Steps -->
        <div class="detail-item${entry.steps ? '' : ' empty'}">
          <strong>Steps:</strong>
          <span class="${entry.steps ? 'steps-value' : ''}">${entry.steps ? entry.steps.toLocaleString() : 'Not logged'}</span>
        </div>

        <!-- Nutrition Totals -->
        <div class="detail-item${hasMeals ? '' : ' empty'}">
          <strong>Daily Nutrition:</strong>
          <span>${hasMeals ? `${Math.round(nutritionTotals.calories)} kcal • ${Math.round(nutritionTotals.protein)}g protein • ${Math.round(nutritionTotals.carbs)}g carbs • ${Math.round(nutritionTotals.fat)}g fat` : 'No meals logged'}</span>
        </div>
      </div>

      <div class="day-details-right">
        <!-- Diary -->
        <div class="diary-section">
          <strong>Diary</strong>
          <textarea id="diary-${dateStr}" class="diary-textarea" placeholder="Write your diary entry...">${entry.diary || ''}</textarea>
          <button class="btn btn-sm" onclick="saveDiaryEntry('${dateStr}')">Save</button>
        </div>
      </div>
    </div>

    <!-- Nutrition Record -->
    ${hasMeals ? `
      <div class="nutrition-record">
        <h3>Nutrition Record</h3>
        <div class="nutrition-items-list">
          ${renderMealItems(entry.meals)}
        </div>
      </div>
    ` : ''}
  `;

  detailsEl.innerHTML = html;
  detailsEl.classList.add('fade-in');

  // Remove fade-in class after animation completes to allow re-triggering
  setTimeout(() => detailsEl.classList.remove('fade-in'), 300);
}

// Render meal items grouped by meal type
function renderMealItems(meals) {
  if (!meals) return '';

  const mealOrder = ['breakfast', 'lunch', 'dinner', 'snacks'];
  const mealIcons = {
    breakfast: 'la-sun',
    lunch: 'la-cloud-sun',
    dinner: 'la-moon',
    snacks: 'la-cookie'
  };

  let html = '';

  mealOrder.forEach(mealType => {
    const items = meals[mealType];
    if (items && items.length > 0) {
      items.forEach((item, index) => {
        html += `
          <div class="nutrition-item">
            <button class="nutrition-item-delete" onclick="deleteMealItem('${selectedDate}', '${mealType}', ${index})" title="Delete">
              <i class="las la-times"></i>
            </button>
            <div class="nutrition-item-header">
              <i class="las ${mealIcons[mealType]}"></i>
              <span class="nutrition-item-name">${item.name} ${item.portionSize ? `(${item.portionSize}g)` : ''}</span>
            </div>
            <div class="nutrition-item-macros">
              <span>${Math.round(item.calories)} kcal</span>
              <span>P: ${Math.round(item.protein)}g</span>
              <span>C: ${Math.round(item.carbs)}g</span>
              <span>F: ${Math.round(item.fat)}g</span>
            </div>
          </div>
        `;
      });
    }
  });

  return html || '<p style="color: #999; text-align: center; padding: 20px;">No meals logged</p>';
}

// Calculate daily nutrition totals
function calculateDailyNutritionTotals(date) {
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

// Save diary entry
async function saveDiaryEntry(date) {
  const textarea = document.getElementById(`diary-${date}`);
  if (!textarea) return;

  const content = textarea.value;

  try {
    await saveDiaryForDate(date, content);
    showNotification('Diary saved!');
  } catch (error) {
    console.error('Error saving diary:', error);
    showNotification('Error saving diary!');
  }
}

// Delete a meal item
async function deleteMealItem(date, mealType, itemIndex) {
  if (!confirm('Delete this food item?')) return;

  try {
    const entry = getEntry(date);

    if (!entry.meals || !entry.meals[mealType]) {
      showNotification('Error: Meal not found');
      return;
    }

    // Remove the item from the array
    entry.meals[mealType].splice(itemIndex, 1);

    // Save the updated entry
    await saveEntry(date, entry);

    // Refresh the day details
    showDayDetails(date);

    showNotification('Food item deleted');
  } catch (error) {
    console.error('Error deleting meal item:', error);
    showNotification('Error deleting item');
  }
}

// Open modal with pre-filled date
function openModalForDate(modalId, date) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  // Reset modal title to "Add Weight"
  const modalTitle = modal.querySelector('.modal-header h2');
  if (modalTitle) {
    modalTitle.textContent = 'Add Weight';
  }

  // Pre-fill the date input
  const dateInput = modal.querySelector('input[type="date"]');
  if (dateInput) {
    dateInput.value = date;
  }

  openModal(modalId);
}

// Edit weight - pre-fill modal with existing data
function editWeight(date, value, unit, time) {
  const modal = document.getElementById('weightModal');
  if (!modal) return;

  // Update modal title
  const modalTitle = modal.querySelector('.modal-header h2');
  if (modalTitle) {
    modalTitle.textContent = 'Edit Weight';
  }

  // Pre-fill all fields
  document.getElementById('weightDate').value = date;
  document.getElementById('weightValue').value = value;
  document.getElementById('weightUnit').value = unit;
  document.getElementById('weightTime').value = time;

  openModal('weightModal');
}

// Open gym modal with pre-filled date
function openModalForDateGym(date, currentValue) {
  const modal = document.getElementById('gymModal');
  if (!modal) return;

  // Store date in modal
  modal.dataset.date = date;

  // Set radio buttons
  document.getElementById('gymYes').checked = currentValue;
  document.getElementById('gymNo').checked = !currentValue;

  openModal('gymModal');
}

// Open supplements modal with pre-filled date
function openModalForDateSupplements(date) {
  const modal = document.getElementById('supplementsModal');
  if (!modal) return;

  // Get current entry data
  const entry = getEntry(date);

  // Store date in modal
  modal.dataset.date = date;

  // Pre-fill supplements
  document.getElementById('supplementsInput').value = entry.supplements || '';

  openModal('supplementsModal');
}

// Open steps modal with pre-filled date
function openModalForDateSteps(date) {
  const modal = document.getElementById('stepsModal');
  if (!modal) return;

  // Get current entry data
  const entry = getEntry(date);

  // Store date in modal
  modal.dataset.date = date;

  // Pre-fill steps
  document.getElementById('stepsInput').value = entry.steps || '';

  openModal('stepsModal');
}

// Navigate to previous week
function previousWeek() {
  const newDate = new Date(currentWeekStart);
  newDate.setDate(newDate.getDate() - 7);
  currentWeekStart = newDate;
  renderWeekView(currentWeekStart);
  updateMonthYearDisplay();

  // Clear selection if not in current week
  if (selectedDate) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const selDate = new Date(selectedDate);
    if (selDate < currentWeekStart || selDate > weekEnd) {
      selectedDate = null;
      const detailsEl = document.getElementById('day-details');
      if (detailsEl) {
        detailsEl.innerHTML = '<p class="select-day-prompt">Select a day to view details</p>';
      }
    }
  }
}

// Navigate to next week
function nextWeek() {
  const newDate = new Date(currentWeekStart);
  newDate.setDate(newDate.getDate() + 7);
  currentWeekStart = newDate;
  renderWeekView(currentWeekStart);
  updateMonthYearDisplay();

  // Clear selection if not in current week
  if (selectedDate) {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const selDate = new Date(selectedDate);
    if (selDate < currentWeekStart || selDate > weekEnd) {
      selectedDate = null;
      const detailsEl = document.getElementById('day-details');
      if (detailsEl) {
        detailsEl.innerHTML = '<p class="select-day-prompt">Select a day to view details</p>';
      }
    }
  }
}

// Go to current week
function goToToday() {
  currentWeekStart = getWeekStart(new Date());
  const today = getDateString(new Date());
  selectDay(today);
  updateMonthYearDisplay();
}

// Update month/year display
function updateMonthYearDisplay() {
  const displayEl = document.getElementById('month-year-display');
  if (!displayEl) return;

  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const startMonth = currentWeekStart.toLocaleDateString('en-US', { month: 'long' });
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'long' });
  const year = currentWeekStart.getFullYear();

  let displayText;
  if (startMonth === endMonth) {
    displayText = `${startMonth} ${year}`;
  } else {
    displayText = `${startMonth} - ${endMonth} ${year}`;
  }

  displayEl.textContent = displayText;
}

// Setup navigation buttons
function setupCalendarNavigation() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const todayBtn = document.getElementById('todayBtn');
  const viewToggleBtn = document.getElementById('viewToggleBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      if (viewMode === 'week') {
        previousWeek();
      } else {
        previousMonth();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      if (viewMode === 'week') {
        nextWeek();
      } else {
        nextMonth();
      }
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', goToToday);
  }

  if (viewToggleBtn) {
    viewToggleBtn.addEventListener('click', toggleView);
  }
}

// Toggle between week and month view
function toggleView() {
  const weekView = document.getElementById('calendar-week');
  const monthView = document.getElementById('calendar-month');
  const toggleBtn = document.getElementById('viewToggleBtn');

  if (viewMode === 'week') {
    viewMode = 'month';
    weekView.style.display = 'none';
    monthView.style.display = 'grid';
    toggleBtn.textContent = 'Switch to Week View';
    renderMonthView(currentMonthDate);
  } else {
    viewMode = 'week';
    weekView.style.display = 'grid';
    monthView.style.display = 'none';
    toggleBtn.textContent = 'Switch to Month View';
    renderWeekView(currentWeekStart);
  }
  updateMonthYearDisplay();
}

// Render full month view
function renderMonthView(monthDate) {
  const container = document.getElementById('calendar-month');
  if (!container) return;

  container.innerHTML = '';

  // Get first and last day of month
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get the starting Sunday
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // Get the ending Saturday
  const endDate = new Date(lastDay);
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

  const today = getDateString(new Date());

  // Add day headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(name => {
    const headerEl = document.createElement('div');
    headerEl.className = 'month-day-header';
    headerEl.textContent = name;
    container.appendChild(headerEl);
  });

  // Render each day
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = getDateString(currentDate);
    const entry = getEntry(dateStr);
    const dayNum = currentDate.getDate();
    const isCurrentMonth = currentDate.getMonth() === month;

    const dayEl = document.createElement('div');
    dayEl.className = 'month-day';

    if (!isCurrentMonth) {
      dayEl.classList.add('other-month');
    }

    if (dateStr === today) {
      dayEl.classList.add('today');
    }

    if (selectedDate === dateStr) {
      dayEl.classList.add('selected');
    }

    // Show weight indicator
    const hasWeight = entry.weight ? true : false;

    dayEl.innerHTML = `
      <div class="month-day-number">${dayNum}</div>
      ${hasWeight ? `<div class="month-day-indicator"><i class="las la-check-circle"></i></div>` : ''}
    `;

    dayEl.addEventListener('click', () => selectDay(dateStr));
    container.appendChild(dayEl);

    currentDate.setDate(currentDate.getDate() + 1);
  }
}

// Navigate to previous month
function previousMonth() {
  currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
  renderMonthView(currentMonthDate);
  updateMonthYearDisplay();
}

// Navigate to next month
function nextMonth() {
  currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
  renderMonthView(currentMonthDate);
  updateMonthYearDisplay();
}

// Update month/year display for both views
function updateMonthYearDisplay() {
  const displayEl = document.getElementById('month-year-display');
  if (!displayEl) return;

  if (viewMode === 'month') {
    const monthName = currentMonthDate.toLocaleDateString('en-US', { month: 'long' });
    const year = currentMonthDate.getFullYear();
    displayEl.textContent = `${monthName} ${year}`;
  } else {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const startMonth = currentWeekStart.toLocaleDateString('en-US', { month: 'long' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'long' });
    const year = currentWeekStart.getFullYear();

    let displayText;
    if (startMonth === endMonth) {
      displayText = `${startMonth} ${year}`;
    } else {
      displayText = `${startMonth} - ${endMonth} ${year}`;
    }

    displayEl.textContent = displayText;
  }
}

// Initialize calendar when page loads
// Note: Initialization is now handled in calendar.html inline script
