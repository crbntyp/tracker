// Calendar view functionality

let currentWeekStart = getWeekStart(new Date());
let currentMonthDate = new Date();
let selectedDate = null;
let viewMode = 'week'; // 'week' or 'month'

// Initialize calendar
function initCalendar() {
  renderWeekView(currentWeekStart);
  setupCalendarNavigation();
  updateMonthYearDisplay();

  // Auto-select today's date
  const today = getDateString(new Date());
  selectDay(today);
}

// Render week view
function renderWeekView(weekStart) {
  const container = document.getElementById('calendar-week');
  if (!container) return;

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
}

// Show day details
function showDayDetails(dateStr) {
  const detailsEl = document.getElementById('day-details');
  if (!detailsEl) return;

  const entry = getEntry(dateStr);
  const dateFormatted = formatDateLong(dateStr);

  let html = `
    <div class="day-details-header">
      <h3>${dateFormatted}</h3>
      <div class="day-quick-actions">
        ${entry.weight ?
          `<button class="btn btn-sm" onclick="editWeight('${dateStr}', ${entry.weight.value}, '${entry.weight.unit}', '${entry.weight.time}')"><i class="las la-edit"></i> Edit Weight</button>` :
          `<button class="btn btn-sm" onclick="openModalForDate('weightModal', '${dateStr}')"><i class="las la-plus"></i> Add Weight</button>`
        }
      </div>
    </div>
  `;

  // Weight
  if (entry.weight) {
    html += `
      <div class="detail-item">
        <strong>Weight:</strong>
        <span>${entry.weight.value} ${entry.weight.unit} at ${entry.weight.time}</span>
      </div>
    `;
  } else {
    html += `
      <div class="detail-item empty">
        <strong>Weight:</strong>
        <span>Not logged</span>
      </div>
    `;
  }

  detailsEl.innerHTML = html;
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
