# Weight & Food Tracker - Project Plan

## Project Overview
A personal web application for tracking daily weight and food intake. Mobile/tablet-first design, hosted on personal domain, accessed via browser.

**Key Features:**
- Personalized home screen with quick action links
- Daily tracking: weight, lunch, dinner, drinks
- Calendar view showing logged entries
- Weight trend charts
- Scheduled notifications (8am, 1pm, 7pm)
- Data persistence with optional server backup

---

## Tech Stack

### Core
- **HTML5** - Semantic markup
- **SCSS** - Styling (compiled to CSS)
- **Vanilla JavaScript** - All functionality (ES6+)

### Additional
- **Chart.js** - Data visualization
- **Service Worker** - Notifications & PWA features
- **Notifications API** - Timed reminders

### Data Storage Options
1. **Phase 1:** localStorage (quick start, client-side only)
2. **Phase 2 (Optional):** Node.js/Express backend with JSON file storage or SQLite

---

## Architecture

### Option A: Client-Side Only (Phase 1)
```
Browser
  ├── HTML/CSS/JS
  ├── localStorage (data persistence)
  ├── Service Worker (notifications)
  └── Chart.js (visualizations)
```

### Option B: Client + Server (Phase 2)
```
Browser                      Server
  ├── HTML/CSS/JS    <--->   Node.js/Express
  ├── localStorage (cache)   ├── Data API
  ├── Service Worker         ├── JSON files / SQLite
  └── Chart.js               └── Backup/Sync
```

---

## File Structure

```
weight-tracker/
│
├── index.html                 # Home screen
├── calendar.html              # Calendar view (or SPA route)
├── charts.html                # Charts/analytics view
│
├── css/
│   ├── styles.scss           # Main SCSS file
│   ├── _variables.scss       # Colors, fonts, breakpoints
│   ├── _layout.scss          # Grid, containers
│   ├── _components.scss      # Buttons, cards, forms
│   ├── _calendar.scss        # Calendar-specific styles
│   └── styles.css            # Compiled output
│
├── js/
│   ├── app.js                # Main app initialization
│   ├── data.js               # Data storage/retrieval logic
│   ├── ui.js                 # UI updates and interactions
│   ├── calendar.js           # Calendar rendering
│   ├── charts.js             # Chart.js configurations
│   ├── notifications.js      # Notification setup
│   └── utils.js              # Helper functions
│
├── sw.js                      # Service Worker (root level)
├── manifest.json              # PWA manifest
│
├── data/                      # (Future: server-side storage)
│   └── entries/
│       ├── 2025-11-16.json
│       └── 2025-11-17.json
│
└── assets/
    └── icons/                 # PWA icons
```

---

## Data Model

### Daily Entry Object
```javascript
{
  "date": "2025-11-16",           // ISO date string (key)
  "weight": {
    "value": 75.5,                 // in kg or lbs
    "unit": "kg",
    "time": "08:30",               // HH:mm
    "timestamp": 1700125800000     // Unix timestamp
  },
  "lunch": {
    "description": "Chicken salad",
    "calories": 450,               // optional
    "time": "13:15",
    "timestamp": 1700143500000,
    "logged": true
  },
  "dinner": {
    "description": "Pasta with vegetables",
    "calories": 650,
    "time": "19:30",
    "timestamp": 1700166600000,
    "logged": true
  },
  "drinks": [
    {
      "type": "Water",
      "amount": "500ml",
      "time": "10:00"
    },
    {
      "type": "Coffee",
      "amount": "250ml",
      "time": "14:30"
    }
  ],
  "notes": "Felt energetic today"  // optional
}
```

### localStorage Structure
```javascript
// Key-value pairs
"tracker-2025-11-16": {daily entry object}
"tracker-2025-11-17": {daily entry object}
"tracker-settings": {user preferences}
"tracker-userName": "Jonny"
```

### Server API Endpoints (Phase 2)
```
GET    /api/entries                # Get all entries
GET    /api/entries/:date          # Get specific day
POST   /api/entries/:date          # Create/update entry
DELETE /api/entries/:date          # Delete entry
GET    /api/entries/range?start=&end=  # Date range
POST   /api/export                 # Export all data as JSON
POST   /api/import                 # Import data from JSON
```

---

## Screen Designs

### 1. Home Screen (`index.html`)
```
┌─────────────────────────────┐
│  [☰ Menu]                   │
├─────────────────────────────┤
│                             │
│   Hey Jonny,                │
│   What are you up to today? │
│                             │
│   ┌─────────────────────┐   │
│   │  📊 Add Weight      │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │  🥗 Add Lunch       │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │  🍽️ Add Dinner      │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │  🥤 Add Drinks      │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │  📅 View Calendar   │   │
│   └─────────────────────┘   │
│                             │
│   ┌─────────────────────┐   │
│   │  📈 View Charts     │   │
│   └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

**Features:**
- Large, touch-friendly buttons
- Today's date displayed subtly
- Quick indicators showing what's been logged today
- Minimal, clean design

### 2. Calendar View (`calendar.html`)
```
┌─────────────────────────────┐
│  ← November 2025            │
├─────────────────────────────┤
│  Week View                  │
│  ┌───┬───┬───┬───┬───┬───┬──┤
│  │Mon│Tue│Wed│Thu│Fri│Sat│Su│
│  │ 11│ 12│ 13│ 14│ 15│ 16│17│
│  │ ⚖️ │ ⚖️ │ ⚖️ │ ⚖️ │ ⚖️ │ ⚖️│  │
│  │ 🥗│ 🥗│ 🥗│   │ 🥗│ 🥗│  │
│  │ 🍽️│ 🍽️│   │ 🍽️│ 🍽️│   │  │
│  └───┴───┴───┴───┴───┴───┴──┤
│                             │
│  [< Prev Week] [Next Week >]│
│                             │
│  Selected: Thursday Nov 14  │
│  ┌─────────────────────────┐│
│  │ Weight: 75.2 kg (8:30)  ││
│  │ Lunch: ❌               ││
│  │ Dinner: Grilled fish    ││
│  │ Drinks: 3 entries       ││
│  └─────────────────────────┘│
│                             │
│  [View Full Month]          │
└─────────────────────────────┘
```

**Features:**
- Week view as primary (mobile-friendly)
- Icons show what's logged each day
- Tap day to see details below
- Swipe or buttons to navigate weeks
- Optional month view (more compact)

### 3. Charts View (`charts.html`)
```
┌─────────────────────────────┐
│  📈 Your Progress            │
├─────────────────────────────┤
│                             │
│  Weight Trend (30 days)     │
│  ┌─────────────────────────┐│
│  │      •─•               ││
│  │    •─     •─•          ││
│  │  •─           •        ││
│  │                        ││
│  └─────────────────────────┘│
│                             │
│  Stats:                     │
│  Starting: 77.5 kg          │
│  Current: 75.2 kg           │
│  Change: -2.3 kg ↓          │
│                             │
│  ┌─────────────────────────┐│
│  │ Meal Logging Rate       ││
│  │ Lunches: 85% (17/20)    ││
│  │ Dinners: 90% (18/20)    ││
│  └─────────────────────────┘│
│                             │
│  [Last 7 Days] [Last 30]    │
│  [Last 90]     [All Time]   │
└─────────────────────────────┘
```

**Features:**
- Line chart for weight over time
- Summary statistics
- Meal logging consistency tracker
- Time range selector

---

## Component Breakdown

### 1. Quick Action Buttons (Home)
- Large, card-style buttons
- Icons for visual clarity
- Opens modal/form for data entry
- Shows checkmark if already logged today

### 2. Entry Modal/Form
```html
<div class="modal">
  <h2>Add Weight</h2>
  <input type="number" step="0.1" placeholder="Weight">
  <select>
    <option>kg</option>
    <option>lbs</option>
  </select>
  <input type="time" value="[current time]">
  <button>Save</button>
  <button>Cancel</button>
</div>
```

### 3. Calendar Component
- Renders week/month grid
- Populates with logged data
- Interactive day selection
- Responsive to screen size

### 4. Chart Component
- Uses Chart.js library
- Pulls data from storage
- Filters by date range
- Responsive sizing

---

## Implementation Phases

### Phase 1: Core Functionality (Week 1)
**Goal:** Basic tracking working with localStorage

1. **Setup**
   - Create file structure
   - Setup SCSS compilation
   - Create HTML templates

2. **Data Layer (data.js)**
   ```javascript
   // Core functions
   - getTodayEntry()
   - saveEntry(date, data)
   - getEntry(date)
   - getAllEntries()
   - deleteEntry(date)
   - exportData()
   - importData()
   ```

3. **Home Screen**
   - Personalized greeting
   - Quick action buttons
   - Entry modals/forms
   - Save to localStorage

4. **Basic Styling**
   - Mobile-first responsive design
   - Touch-friendly elements
   - Clean, minimal UI

**Deliverable:** Can log weight, meals, drinks and retrieve them

---

### Phase 2: Calendar & Visualization (Week 2)
**Goal:** View historical data

1. **Calendar View**
   - Week view rendering
   - Day selection
   - Entry indicators (icons)
   - Navigation (prev/next week)

2. **Charts Setup**
   - Integrate Chart.js
   - Weight line chart
   - Date range filtering
   - Statistics calculations

3. **Enhanced Styling**
   - Calendar grid styling
   - Chart responsiveness
   - Color scheme refinement

**Deliverable:** Full calendar navigation and weight charts

---

### Phase 3: Notifications & PWA (Week 3)
**Goal:** Reminder system and app-like experience

1. **Notifications**
   - Request permission on load
   - Service Worker setup
   - Scheduled notifications (8am, 1pm, 7pm)
   - Notification click handlers

2. **PWA Features**
   - manifest.json creation
   - Icons generation
   - Install prompt
   - Offline functionality

3. **Settings**
   - Notification preferences
   - Name customization
   - Unit preferences (kg/lbs)
   - Data export/import

**Deliverable:** Working notifications and PWA install

---

### Phase 4: Server Backend (Optional - Week 4+)
**Goal:** Data backup and multi-device sync

1. **Server Setup**
   ```javascript
   // Node.js + Express
   - Setup basic server
   - Create API endpoints
   - File-based storage (JSON files)
   ```

2. **API Integration**
   - Update data.js to use fetch()
   - Sync localStorage with server
   - Conflict resolution
   - Offline-first approach

3. **Authentication (Optional)**
   - Simple password protection
   - Session management
   - Multi-user support

**Deliverable:** Data persists across devices

---

## Key JavaScript Functions

### Core Data Management (data.js)
```javascript
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

// Export all data
function exportData() {
  const allData = {
    settings: JSON.parse(localStorage.getItem('tracker-settings')),
    entries: getAllEntries()
  };
  const dataStr = JSON.stringify(allData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}

// Import data
function importData(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const data = JSON.parse(e.target.result);
    localStorage.setItem('tracker-settings', JSON.stringify(data.settings));
    data.entries.forEach(entry => {
      localStorage.setItem(`tracker-${entry.date}`, JSON.stringify(entry));
    });
    alert('Data imported successfully!');
    location.reload();
  };
  reader.readAsText(file);
}
```

### Notification Setup (notifications.js)
```javascript
// Request notification permission
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Schedule notifications via Service Worker
function scheduleNotifications() {
  if ('serviceWorker' in navigator && 'Notification' in window) {
    navigator.serviceWorker.ready.then(registration => {
      // Schedule morning notification (8am)
      scheduleNotification(registration, 'weight', {
        hour: 8,
        minute: 0,
        title: 'Morning Check-in',
        body: 'Time to log your weight, Jonny!',
        icon: '/assets/icons/weight-icon.png'
      });
      
      // Schedule lunch notification (1pm)
      scheduleNotification(registration, 'lunch', {
        hour: 13,
        minute: 0,
        title: 'Lunch Time',
        body: 'Don\'t forget to log your lunch!',
        icon: '/assets/icons/lunch-icon.png'
      });
      
      // Schedule dinner notification (7pm)
      scheduleNotification(registration, 'dinner', {
        hour: 19,
        minute: 0,
        title: 'Dinner Time',
        body: 'Remember to log your dinner!',
        icon: '/assets/icons/dinner-icon.png'
      });
    });
  }
}

// Calculate time until next notification
function scheduleNotification(registration, type, config) {
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(config.hour, config.minute, 0, 0);
  
  if (scheduledTime <= now) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const delay = scheduledTime - now;
  
  setTimeout(() => {
    registration.showNotification(config.title, {
      body: config.body,
      icon: config.icon,
      badge: '/assets/icons/badge-icon.png',
      tag: type,
      requireInteraction: false,
      data: { url: '/', type: type }
    });
    
    // Re-schedule for next day
    scheduleNotification(registration, type, config);
  }, delay);
}
```

### Chart Generation (charts.js)
```javascript
// Initialize weight chart
function initWeightChart(canvasId, days = 30) {
  const entries = getAllEntries()
    .filter(e => e.weight && e.weight.value)
    .slice(0, days)
    .reverse();
  
  const labels = entries.map(e => {
    const date = new Date(e.date);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  });
  
  const data = entries.map(e => e.weight.value);
  
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Weight (kg)',
        data: data,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        tension: 0.4,
        fill: true
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
          callbacks: {
            label: function(context) {
              return `Weight: ${context.parsed.y} kg`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return value + ' kg';
            }
          }
        }
      }
    }
  });
}

// Calculate statistics
function calculateStats(days = 30) {
  const entries = getAllEntries()
    .filter(e => e.weight && e.weight.value)
    .slice(0, days);
  
  if (entries.length === 0) return null;
  
  const weights = entries.map(e => e.weight.value);
  const startWeight = weights[weights.length - 1];
  const currentWeight = weights[0];
  const change = currentWeight - startWeight;
  
  // Meal logging rate
  const lunchCount = entries.filter(e => e.lunch.logged).length;
  const dinnerCount = entries.filter(e => e.dinner.logged).length;
  
  return {
    startWeight,
    currentWeight,
    change,
    changePercent: ((change / startWeight) * 100).toFixed(1),
    lunchRate: ((lunchCount / entries.length) * 100).toFixed(0),
    dinnerRate: ((dinnerCount / entries.length) * 100).toFixed(0),
    totalEntries: entries.length
  };
}
```

### Calendar Rendering (calendar.js)
```javascript
// Render week view
function renderWeekView(startDate) {
  const container = document.getElementById('calendar-week');
  container.innerHTML = '';
  
  const week = [];
  const currentDate = new Date(startDate);
  
  // Get Monday of the week
  const day = currentDate.getDay();
  const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
  currentDate.setDate(diff);
  
  // Build week array
  for (let i = 0; i < 7; i++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const entry = getEntry(dateStr);
    week.push({
      date: new Date(currentDate),
      dateStr: dateStr,
      entry: entry
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Render days
  week.forEach(day => {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    const dayName = day.date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = day.date.getDate();
    
    let indicators = '';
    if (day.entry.weight) indicators += '<span class="indicator">⚖️</span>';
    if (day.entry.lunch.logged) indicators += '<span class="indicator">🥗</span>';
    if (day.entry.dinner.logged) indicators += '<span class="indicator">🍽️</span>';
    
    dayEl.innerHTML = `
      <div class="day-name">${dayName}</div>
      <div class="day-num">${dayNum}</div>
      <div class="indicators">${indicators}</div>
    `;
    
    dayEl.addEventListener('click', () => showDayDetails(day.dateStr));
    container.appendChild(dayEl);
  });
}

// Show day details
function showDayDetails(dateStr) {
  const entry = getEntry(dateStr);
  const detailsEl = document.getElementById('day-details');
  
  const date = new Date(dateStr);
  const dateFormatted = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  let html = `<h3>${dateFormatted}</h3>`;
  
  if (entry.weight) {
    html += `<p><strong>Weight:</strong> ${entry.weight.value} ${entry.weight.unit} (${entry.weight.time})</p>`;
  } else {
    html += `<p><strong>Weight:</strong> Not logged</p>`;
  }
  
  if (entry.lunch.logged) {
    html += `<p><strong>Lunch:</strong> ${entry.lunch.description || 'Logged'} (${entry.lunch.time})</p>`;
  } else {
    html += `<p><strong>Lunch:</strong> Not logged</p>`;
  }
  
  if (entry.dinner.logged) {
    html += `<p><strong>Dinner:</strong> ${entry.dinner.description || 'Logged'} (${entry.dinner.time})</p>`;
  } else {
    html += `<p><strong>Dinner:</strong> Not logged</p>`;
  }
  
  if (entry.drinks.length > 0) {
    html += `<p><strong>Drinks:</strong> ${entry.drinks.length} entries</p>`;
  }
  
  detailsEl.innerHTML = html;
}
```

---

## SCSS Structure

### _variables.scss
```scss
// Colors
$primary-color: #4CAF50;
$secondary-color: #2196F3;
$danger-color: #f44336;
$text-dark: #333333;
$text-light: #666666;
$bg-light: #f5f5f5;
$white: #ffffff;

// Fonts
$font-primary: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
$font-size-base: 16px;
$font-size-large: 20px;
$font-size-xlarge: 28px;

// Spacing
$spacing-xs: 8px;
$spacing-sm: 16px;
$spacing-md: 24px;
$spacing-lg: 32px;
$spacing-xl: 48px;

// Breakpoints
$mobile: 480px;
$tablet: 768px;
$desktop: 1024px;

// Shadows
$shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
$shadow-md: 0 4px 8px rgba(0,0,0,0.15);
$shadow-lg: 0 8px 16px rgba(0,0,0,0.2);

// Border radius
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 16px;
```

### _layout.scss
```scss
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: $font-primary;
  font-size: $font-size-base;
  color: $text-dark;
  background-color: $bg-light;
  line-height: 1.6;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  padding: $spacing-md;
  
  @media (min-width: $tablet) {
    max-width: 800px;
  }
}

.page-header {
  background: $white;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
  margin-bottom: $spacing-md;
}

.content-area {
  background: $white;
  padding: $spacing-md;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  margin-bottom: $spacing-md;
}
```

### _components.scss
```scss
// Buttons
.btn {
  display: block;
  width: 100%;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;
  font-size: $font-size-large;
  font-weight: 600;
  text-align: left;
  border: none;
  border-radius: $radius-lg;
  background: $white;
  box-shadow: $shadow-md;
  cursor: pointer;
  transition: all 0.3s ease;
  
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }
  
  &:active {
    transform: translateY(0);
  }
  
  .icon {
    font-size: 32px;
  }
  
  &.btn-primary {
    background: $primary-color;
    color: $white;
  }
  
  &.logged {
    opacity: 0.7;
    &::after {
      content: '✓';
      margin-left: auto;
      color: $primary-color;
      font-size: 24px;
    }
  }
}

// Forms
.form-group {
  margin-bottom: $spacing-md;
  
  label {
    display: block;
    margin-bottom: $spacing-xs;
    font-weight: 600;
    color: $text-dark;
  }
  
  input, select, textarea {
    width: 100%;
    padding: $spacing-sm;
    font-size: $font-size-base;
    border: 2px solid #ddd;
    border-radius: $radius-md;
    
    &:focus {
      outline: none;
      border-color: $primary-color;
    }
  }
}

// Modal
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  
  &.active {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-content {
    background: $white;
    padding: $spacing-lg;
    border-radius: $radius-lg;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-header {
    margin-bottom: $spacing-md;
    
    h2 {
      font-size: $font-size-xlarge;
    }
  }
  
  .modal-actions {
    display: flex;
    gap: $spacing-sm;
    margin-top: $spacing-md;
    
    button {
      flex: 1;
      padding: $spacing-sm;
      font-size: $font-size-base;
      border: none;
      border-radius: $radius-md;
      cursor: pointer;
      
      &.btn-primary {
        background: $primary-color;
        color: $white;
      }
      
      &.btn-secondary {
        background: #ddd;
        color: $text-dark;
      }
    }
  }
}

// Greeting
.greeting {
  text-align: center;
  margin-bottom: $spacing-lg;
  
  h1 {
    font-size: $font-size-xlarge;
    margin-bottom: $spacing-xs;
  }
  
  p {
    font-size: $font-size-large;
    color: $text-light;
  }
}
```

### _calendar.scss
```scss
.calendar-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: $spacing-xs;
  margin-bottom: $spacing-md;
  
  .calendar-day {
    background: $white;
    border-radius: $radius-md;
    padding: $spacing-sm;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: $shadow-sm;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: $shadow-md;
    }
    
    .day-name {
      font-size: 12px;
      color: $text-light;
      margin-bottom: 4px;
    }
    
    .day-num {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .indicators {
      display: flex;
      justify-content: center;
      gap: 4px;
      font-size: 16px;
    }
    
    &.today {
      background: lighten($primary-color, 45%);
      border: 2px solid $primary-color;
    }
  }
}

.calendar-navigation {
  display: flex;
  justify-content: space-between;
  margin-bottom: $spacing-md;
  
  button {
    padding: $spacing-sm $spacing-md;
    background: $primary-color;
    color: $white;
    border: none;
    border-radius: $radius-md;
    cursor: pointer;
    font-size: $font-size-base;
  }
}

.day-details {
  background: $bg-light;
  padding: $spacing-md;
  border-radius: $radius-lg;
  
  h3 {
    margin-bottom: $spacing-sm;
  }
  
  p {
    margin-bottom: $spacing-xs;
    
    strong {
      display: inline-block;
      width: 100px;
    }
  }
}
```

---

## Notifications Implementation Details

### Service Worker (sw.js)
```javascript
// Service Worker for notifications and caching

self.addEventListener('install', event => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated');
  return self.clients.claim();
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(windowClients => {
        // Check if there's already a window open
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Optional: Add offline caching
const CACHE_NAME = 'weight-tracker-v1';
const urlsToCache = [
  '/',
  '/css/styles.css',
  '/js/app.js',
  '/js/data.js',
  '/js/ui.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### Register Service Worker (in app.js)
```javascript
// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Service Worker registered:', registration);
    })
    .catch(error => {
      console.log('Service Worker registration failed:', error);
    });
}
```

### Notification Limitations & Workarounds

**Browser Support:**
- ✅ Chrome/Edge (Desktop & Android): Full support
- ✅ Firefox (Desktop & Android): Full support  
- ⚠️ Safari (Desktop): Requires user interaction first
- ❌ Safari (iOS): Limited - only works when app is active

**Workarounds for iOS:**
1. Use Progressive Web App (PWA) - better notification support
2. Add to Home Screen for improved experience
3. Keep web app open in background (not ideal)
4. Future: Consider push notifications via server (requires backend)

**Best Practice:**
- Show clear instructions for enabling notifications
- Provide manual reminder option if notifications blocked
- Test thoroughly on target devices

---

## PWA Configuration

### manifest.json
```json
{
  "name": "Weight Tracker",
  "short_name": "Tracker",
  "description": "Personal weight and food intake tracker",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4CAF50",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/assets/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Add to HTML (index.html)
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#4CAF50">
  <title>Weight Tracker</title>
  
  <!-- PWA Manifest -->
  <link rel="manifest" href="/manifest.json">
  
  <!-- iOS specific -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Tracker">
  <link rel="apple-touch-icon" href="/assets/icons/icon-152x152.png">
  
  <!-- Styles -->
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <!-- Content here -->
  
  <script src="/js/app.js" type="module"></script>
</body>
</html>
```

---

## Server Backend (Optional - Phase 2)

### Simple Node.js + Express Server

**File: server.js**
```javascript
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // Serve frontend files

const DATA_DIR = path.join(__dirname, 'data', 'entries');

// Ensure data directory exists
async function initDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

// GET all entries
app.get('/api/entries', async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const entries = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
        entries.push(JSON.parse(data));
      }
    }
    
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// GET specific entry
app.get('/api/entries/:date', async (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, `${req.params.date}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'Entry not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch entry' });
    }
  }
});

// POST/PUT entry
app.post('/api/entries/:date', async (req, res) => {
  try {
    const date = req.params.date;
    const filePath = path.join(DATA_DIR, `${date}.json`);
    
    // Merge with existing data if it exists
    let existingData = {};
    try {
      const existing = await fs.readFile(filePath, 'utf8');
      existingData = JSON.parse(existing);
    } catch (err) {
      // File doesn't exist, that's okay
    }
    
    const newData = { ...existingData, ...req.body, date };
    await fs.writeFile(filePath, JSON.stringify(newData, null, 2));
    
    res.json(newData);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save entry' });
  }
});

// DELETE entry
app.delete('/api/entries/:date', async (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, `${req.params.date}.json`);
    await fs.unlink(filePath);
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

// GET entries in date range
app.get('/api/entries/range', async (req, res) => {
  const { start, end } = req.query;
  
  try {
    const files = await fs.readdir(DATA_DIR);
    const entries = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const date = file.replace('.json', '');
        if ((!start || date >= start) && (!end || date <= end)) {
          const data = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
          entries.push(JSON.parse(data));
        }
      }
    }
    
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
});

// Export all data
app.get('/api/export', async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const entries = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
        entries.push(JSON.parse(data));
      }
    }
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=tracker-backup-${new Date().toISOString().split('T')[0]}.json`);
    res.json({ entries });
  } catch (err) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Import data
app.post('/api/import', async (req, res) => {
  try {
    const { entries } = req.body;
    
    for (const entry of entries) {
      const filePath = path.join(DATA_DIR, `${entry.date}.json`);
      await fs.writeFile(filePath, JSON.stringify(entry, null, 2));
    }
    
    res.json({ message: `Imported ${entries.length} entries` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// Start server
initDataDir().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
```

### Updated data.js (with server sync)
```javascript
const USE_SERVER = true; // Toggle between localStorage and server
const API_BASE = 'http://localhost:3000/api';

// Save entry (works with both storage methods)
async function saveEntry(date, data) {
  if (USE_SERVER) {
    try {
      const response = await fetch(`${API_BASE}/entries/${date}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (err) {
      console.error('Server error, falling back to localStorage:', err);
      // Fallback to localStorage
      return saveEntryLocal(date, data);
    }
  } else {
    return saveEntryLocal(date, data);
  }
}

// Get entry (works with both storage methods)
async function getEntry(date) {
  if (USE_SERVER) {
    try {
      const response = await fetch(`${API_BASE}/entries/${date}`);
      if (response.status === 404) {
        return createEmptyEntry(date);
      }
      return await response.json();
    } catch (err) {
      console.error('Server error, falling back to localStorage:', err);
      return getEntryLocal(date);
    }
  } else {
    return getEntryLocal(date);
  }
}

// localStorage fallback functions
function saveEntryLocal(date, data) {
  const key = `tracker-${date}`;
  const existing = getEntryLocal(date);
  const merged = { ...existing, ...data };
  localStorage.setItem(key, JSON.stringify(merged));
  return merged;
}

function getEntryLocal(date) {
  const key = `tracker-${date}`;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : createEmptyEntry(date);
}
```

---

## Testing Checklist

### Functionality
- [ ] Can add weight entry
- [ ] Can add lunch entry
- [ ] Can add dinner entry
- [ ] Can add drinks entries
- [ ] Entries persist after page reload
- [ ] Calendar shows correct logged items
- [ ] Charts display weight trend
- [ ] Navigation between pages works
- [ ] Notifications trigger at correct times
- [ ] Export/import data functions work

### Responsive Design
- [ ] Mobile portrait (320px - 480px)
- [ ] Mobile landscape (480px - 768px)
- [ ] Tablet portrait (768px - 1024px)
- [ ] Desktop (1024px+)
- [ ] Touch targets are 44px minimum
- [ ] Text is readable without zooming

### Browser Testing
- [ ] Chrome (Desktop)
- [ ] Chrome (Android)
- [ ] Safari (Desktop)
- [ ] Safari (iOS)
- [ ] Firefox (Desktop)
- [ ] Edge (Desktop)

### PWA Features
- [ ] App installs to home screen
- [ ] App works offline (basic functionality)
- [ ] Notifications work when granted permission
- [ ] Icons display correctly
- [ ] Splash screen shows on launch

---

## Deployment

### Static Hosting (Client-only)
1. **Deploy to your domain:**
   - Upload all files to web hosting
   - Ensure HTTPS is enabled (required for PWA/notifications)
   - Test on actual mobile devices

2. **Recommended hosts:**
   - Netlify (free, easy)
   - Vercel (free, easy)
   - GitHub Pages (free)
   - Your own hosting

### With Server Backend
1. **Server hosting options:**
   - DigitalOcean App Platform
   - Heroku
   - Railway.app
   - Your own VPS

2. **Setup steps:**
   - Deploy Node.js server
   - Configure CORS if frontend/backend on different domains
   - Set up SSL certificate
   - Configure environment variables

---

## Future Enhancements

### Phase 5+ Ideas
1. **Advanced Tracking**
   - Calorie counting
   - Macronutrient breakdown
   - Exercise/activity logging
   - Water intake tracker
   - Mood/energy tracking

2. **Analytics**
   - Weekly/monthly reports
   - Trend predictions
   - Goal setting and tracking
   - Streak counters
   - Achievement badges

3. **Social Features**
   - Share progress (optional)
   - Multiple users/family mode
   - Meal photo uploads
   - Recipe database

4. **Integrations**
   - MyFitnessPal API
   - Apple Health integration
   - Google Fit integration
   - Food database API

5. **AI/ML Features**
   - Meal suggestions based on history
   - Automatic portion estimation from photos
   - Pattern recognition in eating habits
   - Personalized recommendations

---

## Resources & Documentation

### Libraries
- **Chart.js:** https://www.chartjs.org/
- **Service Workers:** https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Notifications API:** https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API
- **PWA Guide:** https://web.dev/progressive-web-apps/

### Tools
- **SCSS Compiler:** Use `sass --watch scss:css` or VS Code extension
- **PWA Builder:** https://www.pwabuilder.com/ (generates icons & manifest)
- **Lighthouse:** Chrome DevTools (test PWA quality)

### Design Inspiration
- **Dribble:** Search "health tracker app"
- **Behance:** Search "food diary app"
- **Mobbin:** Mobile app designs

---

## Quick Start Commands

```bash
# Install SCSS compiler (if not using VS Code extension)
npm install -g sass

# Watch SCSS files
sass --watch css/styles.scss:css/styles.css

# Optional: Set up a simple dev server
npx http-server -p 8080

# If using Node.js backend
npm init -y
npm install express
node server.js
```

---

## Notes & Considerations

1. **Browser localStorage limits:** ~5-10MB per domain (plenty for this use case)

2. **Notification reliability:** 
   - Desktop Chrome: Excellent
   - Android Chrome: Excellent
   - iOS Safari: Limited (consider this)

3. **Data backup:** Encourage users to export regularly until server backend is ready

4. **Privacy:** All data stays local unless server implemented

5. **Offline-first:** Even with server, cache data locally for speed and offline access

6. **Time zones:** Use ISO date strings consistently to avoid timezone issues

---

## Contact & Support

For questions or issues during development, refer to:
- MDN Web Docs
- Stack Overflow
- Chart.js documentation
- PWA best practices at web.dev

---

**Good luck with the build, Jonny! 🚀**

This plan should give you everything you need to get started. Begin with Phase 1 (basic tracking) and expand from there. The architecture is designed to be flexible so you can add features incrementally without major refactoring.
