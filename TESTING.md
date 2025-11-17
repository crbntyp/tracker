# Testing Guide - Phase 1

## Quick Start Test

The server is running at: **http://127.0.0.1:8080**

### Test Checklist

#### 1. Visual Layout Test
- [ ] Open http://127.0.0.1:8080 in browser
- [ ] Page loads with "Hey Jonny" greeting
- [ ] Current date is displayed
- [ ] 6 action buttons are visible
- [ ] Buttons have icons and text
- [ ] Design is clean and mobile-friendly

#### 2. Weight Entry Test
- [ ] Click "Add Weight" button
- [ ] Modal opens with weight form
- [ ] Time field is pre-filled with current time
- [ ] Enter weight value (e.g., 75.5)
- [ ] Select unit (kg or lbs)
- [ ] Click "Save"
- [ ] Modal closes
- [ ] Success notification appears
- [ ] Weight button shows checkmark (✓)

#### 3. Lunch Entry Test
- [ ] Click "Add Lunch" button
- [ ] Modal opens with lunch form
- [ ] Enter description (e.g., "Chicken salad")
- [ ] Optionally enter calories
- [ ] Time is pre-filled
- [ ] Click "Save"
- [ ] Modal closes
- [ ] Success notification appears
- [ ] Lunch button shows checkmark (✓)

#### 4. Dinner Entry Test
- [ ] Click "Add Dinner" button
- [ ] Modal opens with dinner form
- [ ] Enter description (e.g., "Grilled fish")
- [ ] Optionally enter calories
- [ ] Time is pre-filled
- [ ] Click "Save"
- [ ] Modal closes
- [ ] Success notification appears
- [ ] Dinner button shows checkmark (✓)

#### 5. Drinks Entry Test
- [ ] Click "Add Drinks" button
- [ ] Modal opens with drinks form
- [ ] Enter type (e.g., "Water")
- [ ] Enter amount (e.g., "500ml")
- [ ] Time is pre-filled
- [ ] Click "Save"
- [ ] Modal closes
- [ ] Success notification appears
- [ ] Drinks button shows checkmark (✓)
- [ ] Can add multiple drinks (repeat test)

#### 6. Modal Interactions
- [ ] Click any button to open modal
- [ ] Click outside modal (on dark overlay) - modal closes
- [ ] Open modal again
- [ ] Press ESC key - modal closes
- [ ] Open modal again
- [ ] Click "Cancel" button - modal closes

#### 7. Data Persistence Test
- [ ] Add entries for all types (weight, lunch, dinner, drinks)
- [ ] All buttons show checkmarks
- [ ] Press F5 to reload page
- [ ] All checkmarks still visible
- [ ] Entries persisted successfully

#### 8. Browser DevTools Check
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] Should see: "Weight Tracker App initialized"
- [ ] Should see: "Service Worker registered" (or registration message)
- [ ] No red errors

#### 9. LocalStorage Inspection
- [ ] In DevTools, go to Application tab
- [ ] Expand "Local Storage" in left sidebar
- [ ] Click on "http://127.0.0.1:8080"
- [ ] Should see keys:
  - `tracker-settings`
  - `tracker-2025-11-16` (or current date)
- [ ] Click on `tracker-2025-11-16` to view data
- [ ] Verify weight, lunch, dinner, drinks data is present

#### 10. Responsive Design Test
- [ ] In DevTools, click toggle device toolbar (Ctrl+Shift+M)
- [ ] Test different screen sizes:
  - Mobile (375px width)
  - Tablet (768px width)
  - Desktop (1024px width)
- [ ] Buttons remain touch-friendly
- [ ] Modals display properly
- [ ] Text is readable without zooming

#### 11. Navigation Test
- [ ] Click "View Calendar" button
- [ ] Redirects to calendar.html
- [ ] Shows "coming in Phase 2" message
- [ ] Click "Back to Home" button
- [ ] Returns to index.html
- [ ] Click "View Charts" button
- [ ] Redirects to charts.html
- [ ] Shows "coming in Phase 2" message
- [ ] Click "Back to Home" button

#### 12. Multi-day Test
- [ ] Add entries for today
- [ ] Open DevTools > Application > Local Storage
- [ ] Find today's entry key (`tracker-YYYY-MM-DD`)
- [ ] Right-click and delete it
- [ ] Reload page
- [ ] Checkmarks should be gone
- [ ] Add entries again
- [ ] Manually create entry for yesterday:
  - In Console, run:
    ```javascript
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];
    saveWeight(76.2, 'kg', '08:00');
    ```
- [ ] In Local Storage, should see entry for yesterday

## Known Issues / Expected Behavior

1. **Service Worker**: May show registration error in some browsers - this is OK for Phase 1
2. **Icons**: PWA icons not generated yet - placeholder only
3. **Notifications**: Not implemented yet - Phase 3 feature
4. **Calendar/Charts**: Placeholder pages - Phase 2 feature
5. **Export/Import**: Functions exist in data.js but no UI yet

## Browser Compatibility

Test in multiple browsers if possible:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (Desktop)
- [ ] Safari (iOS)
- [ ] Chrome (Android)

## Performance Check

- [ ] Page loads quickly (< 1 second)
- [ ] Modals open/close smoothly
- [ ] No lag when clicking buttons
- [ ] Notifications appear and disappear smoothly

## Accessibility Check

- [ ] Can tab through all buttons
- [ ] Can press Enter on buttons to activate
- [ ] Form inputs are keyboard accessible
- [ ] Modal can be closed with ESC key

## Next Steps After Testing

If all tests pass:
- Move to Phase 2: Calendar & Charts implementation
- Generate PWA icons
- Add more features as per plan

If issues found:
- Document them
- Check browser console for errors
- Verify file paths are correct
- Ensure server is running
