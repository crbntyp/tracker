// Main app initialization

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Resilient App initialized');

  // Wait for storage/API to initialize
  if (typeof initStorage === 'function') {
    await initStorage();
  }

  // Initialize UI
  await initUI();

  // Register service worker if supported (for future notifications/PWA)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  }
});

// Handle keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Close modal on ESC
  if (e.key === 'Escape') {
    const activeModal = document.querySelector('.modal.active');
    if (activeModal) {
      closeModal(activeModal.id);
    }
  }
});
