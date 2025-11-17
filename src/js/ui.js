// UI management functions

// Open modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');

    // Set current date on date inputs
    const dateInputs = modal.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
      if (!input.value) {
        input.value = new Date().toISOString().split('T')[0];
      }
    });

    // Set current time on time inputs
    const timeInputs = modal.querySelectorAll('input[type="time"]');
    timeInputs.forEach(input => {
      if (!input.value) {
        input.value = getCurrentTime();
      }
    });
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');

    // Reset form
    const form = modal.querySelector('form');
    if (form) {
      form.reset();
    }
  }
}

// Close modal when clicking outside
function setupModalClickOutside() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });
}

// Setup close buttons
function setupCloseButtons() {
  const closeButtons = document.querySelectorAll('[data-close]');
  closeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const modalId = button.getAttribute('data-close');
      closeModal(modalId);
    });
  });
}

// Update action button states based on today's entry
function updateActionButtons() {
  const today = getTodayEntry();

  // Weight button
  const weightBtn = document.getElementById('addWeightBtn');
  if (weightBtn) {
    if (today.weight) {
      weightBtn.classList.add('logged');
    } else {
      weightBtn.classList.remove('logged');
    }
  }
}

// Update user name display
async function updateUserName() {
  const userNameEl = document.getElementById('userName');
  if (userNameEl) {
    try {
      const response = await fetch(buildPath('/auth/user'), { credentials: 'include' });
      if (response.ok) {
        const user = await response.json();
        userNameEl.textContent = user.name || 'User';
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }
}

// Update current date display
function updateDateDisplay() {
  const dateEl = document.getElementById('currentDate');
  if (dateEl) {
    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    dateEl.textContent = today.toLocaleDateString('en-US', options);
  }
}

// Setup weight form
function setupWeightForm() {
  const form = document.getElementById('weightForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const date = document.getElementById('weightDate').value;
    const value = document.getElementById('weightValue').value;
    const unit = document.getElementById('weightUnit').value;
    const time = document.getElementById('weightTime').value;

    console.log('Weight form submitted:', { date, value, unit, time });

    if (date && value && time) {
      try {
        console.log('Calling saveWeightForDate...');
        const result = await saveWeightForDate(date, value, unit, time);
        console.log('Save result:', result);

        closeModal('weightModal');
        updateActionButtons();

        // Refresh calendar if on calendar page
        if (typeof renderWeekView === 'function' && currentWeekStart) {
          renderWeekView(currentWeekStart);
        }

        // Refresh day details to show updated weight
        if (typeof showDayDetails === 'function' && selectedDate) {
          showDayDetails(selectedDate);
        }

        showNotification('Weight saved!');
      } catch (error) {
        console.error('Error saving weight:', error);
        showNotification('Error saving weight!');
      }
    } else {
      console.error('Missing required fields:', { date, value, time });
    }
  });
}

// Setup action buttons
function setupActionButtons() {
  const weightBtn = document.getElementById('addWeightBtn');

  if (weightBtn) {
    weightBtn.addEventListener('click', () => openModal('weightModal'));
  }
}

// Show notification (simple alert for now)
function showNotification(message) {
  // Create a simple toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #4CAF50;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    z-index: 10000;
    font-size: 16px;
    font-weight: 600;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 2000);
}

// Setup gym form
function setupGymForm() {
  const form = document.getElementById('gymForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const modal = document.getElementById('gymModal');
    const date = modal.dataset.date;
    const attended = document.querySelector('input[name="gym"]:checked').value === 'true';

    if (date) {
      try {
        await saveGymForDate(date, attended);
        closeModal('gymModal');

        // Refresh day details
        if (typeof showDayDetails === 'function') {
          showDayDetails(date);
        }

        showNotification('Gym attendance saved!');
      } catch (error) {
        console.error('Error saving gym:', error);
        showNotification('Error saving gym attendance!');
      }
    }
  });
}

// Setup supplements form
function setupSupplementsForm() {
  const form = document.getElementById('supplementsForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const modal = document.getElementById('supplementsModal');
    const date = modal.dataset.date;
    const supplements = document.getElementById('supplementsInput').value;

    if (date) {
      try {
        await saveSupplementsForDate(date, supplements);
        closeModal('supplementsModal');

        // Refresh day details
        if (typeof showDayDetails === 'function') {
          showDayDetails(date);
        }

        showNotification('Supplements saved!');
      } catch (error) {
        console.error('Error saving supplements:', error);
        showNotification('Error saving supplements!');
      }
    }
  });
}

// Setup steps form
function setupStepsForm() {
  const form = document.getElementById('stepsForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const modal = document.getElementById('stepsModal');
    const date = modal.dataset.date;
    const steps = parseInt(document.getElementById('stepsInput').value);

    if (date && !isNaN(steps)) {
      try {
        await saveStepsForDate(date, steps);
        closeModal('stepsModal');

        // Refresh day details
        if (typeof showDayDetails === 'function') {
          showDayDetails(date);
        }

        showNotification('Steps saved!');
      } catch (error) {
        console.error('Error saving steps:', error);
        showNotification('Error saving steps!');
      }
    }
  });
}

// Initialize UI
async function initUI() {
  await updateUserName();
  updateDateDisplay();
  updateActionButtons();
  setupActionButtons();
  setupWeightForm();
  setupGymForm();
  setupSupplementsForm();
  setupStepsForm();
  setupCloseButtons();
  setupModalClickOutside();
}
