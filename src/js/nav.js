// Navigation component
class Navigation {
  constructor() {
    this.user = null;
    this.init();
  }

  async init() {
    await this.loadUser();
    this.render();
  }

  async loadUser() {
    try {
      const response = await fetch('/auth/user');
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
      <div class="nav-container">
        <div class="nav-links">
          <a href="/" class="nav-link ${currentPage === '/' ? 'active' : ''}">
            <i class="lar la-calendar-check nav-icon"></i>
            <span class="nav-text">Calendar</span>
          </a>
          <a href="/charts.html" class="nav-link ${currentPage === '/charts.html' ? 'active' : ''}">
            <i class="las la-chart-pie nav-icon"></i>
            <span class="nav-text">Charts</span>
          </a>
        </div>
        <div class="nav-logo">
          <a href="/"><img src="/logo.png" alt="Logo"></a>
        </div>
        <div class="nav-user">
          ${this.user ? `
            <div class="user-menu">
              <img src="${this.user.picture || ''}" alt="${this.user.name}" class="user-avatar">
              <a href="/auth/logout" class="logout-btn"><i class="las la-sign-out-alt"></i></a>
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
