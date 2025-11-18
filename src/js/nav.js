// Navigation component
class Navigation {
  constructor() {
    this.user = null;
    this.init();
  }

  async init() {
    this.renderLoading();

    // Load user data with minimum display time for loading state
    await Promise.all([
      this.loadUser(),
      new Promise(resolve => setTimeout(resolve, 300)) // Minimum 300ms loading display
    ]);

    this.render();
  }

  renderLoading() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    const currentPage = window.location.pathname;

    nav.innerHTML = `
      <div class="nav-container fade-in">
        <div class="nav-links">
          <a href="${buildPath('/')}" class="nav-link ${currentPage.includes('calendar') || currentPage === buildPath('/') ? 'active' : ''}">
            <i class="las la-calendar-plus nav-icon"></i>
            <span class="nav-text">Calendar</span>
          </a>
          <a href="${buildPath('/charts.html')}" class="nav-link ${currentPage.includes('charts') ? 'active' : ''}">
            <i class="las la-chart-pie nav-icon"></i>
            <span class="nav-text">Charts</span>
          </a>
        </div>
        <div class="nav-logo">
          <a href="${buildPath('/')}"><img src="${buildPath('/logo.png')}" alt="Logo"></a>
        </div>
        <div class="nav-user">
          <div class="loading-spinner"></div>
        </div>
      </div>
    `;
  }

  async loadUser() {
    try {
      const response = await fetch(buildPath('/auth/user'));
      if (response.ok) {
        this.user = await response.json();
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  render() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    const currentPage = window.location.pathname;

    nav.innerHTML = `
      <div class="nav-container fade-in">
        <div class="nav-links">
          <a href="${buildPath('/')}" class="nav-link ${currentPage.includes('calendar') || currentPage === buildPath('/') ? 'active' : ''}">
            <i class="las la-calendar-plus nav-icon"></i>
            <span class="nav-text">Calendar</span>
          </a>
          <a href="${buildPath('/charts.html')}" class="nav-link ${currentPage.includes('charts') ? 'active' : ''}">
            <i class="las la-chart-pie nav-icon"></i>
            <span class="nav-text">Charts</span>
          </a>
        </div>
        <div class="nav-logo">
          <a href="${buildPath('/')}"><img src="${buildPath('/logo.png')}" alt="Logo"></a>
        </div>
        <div class="nav-user">
          ${this.user ? `
            <div class="user-menu">
              <img src="${this.user.picture || ''}" alt="${this.user.name}" class="user-avatar">
              <a href="${buildPath('/auth/logout')}" class="logout-btn"><i class="las la-sign-out-alt"></i></a>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Navigation();
});
