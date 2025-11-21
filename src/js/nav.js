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
        <button class="nav-hamburger" id="nav-hamburger">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div class="nav-links" id="nav-links">
          <a href="${buildPath('/')}" class="nav-link ${currentPage.includes('calendar') || currentPage === buildPath('/') ? 'active' : ''}">
            <i class="las la-network-wired nav-icon"></i>
            <span class="nav-text">Dashboard</span>
          </a>
          <a href="${buildPath('/scan.html')}" class="nav-link ${currentPage.includes('scan') ? 'active' : ''}">
            <i class="las la-barcode nav-icon"></i>
            <span class="nav-text">Scan</span>
          </a>
          <a href="${buildPath('/charts.html')}" class="nav-link ${currentPage.includes('charts') ? 'active' : ''}">
            <i class="las la-chart-pie nav-icon"></i>
            <span class="nav-text">Stats</span>
          </a>
        </div>
        <div class="nav-logo">
          <a href="${buildPath('/')}"><h1>trckr<span>__</span></h1></a>
        </div>
        <div class="nav-user">
          <div class="loading-spinner"></div>
        </div>
      </div>
    `;

    this.initHamburger();
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
        <button class="nav-hamburger" id="nav-hamburger">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div class="nav-links" id="nav-links">
          <a href="${buildPath('/')}" class="nav-link ${currentPage.includes('calendar') || currentPage === buildPath('/') ? 'active' : ''}">
            <i class="las la-network-wired nav-icon"></i>
            <span class="nav-text">Dashboard</span>
          </a>
          <a href="${buildPath('/scan.html')}" class="nav-link ${currentPage.includes('scan') ? 'active' : ''}">
            <i class="las la-barcode nav-icon"></i>
            <span class="nav-text">Scan</span>
          </a>
          <a href="${buildPath('/charts.html')}" class="nav-link ${currentPage.includes('charts') ? 'active' : ''}">
            <i class="las la-chart-pie nav-icon"></i>
            <span class="nav-text">Stats</span>
          </a>
        </div>
        <div class="nav-logo">
          <a href="${buildPath('/')}"><h1>trckr<span>__</span></h1></a>
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

    this.initHamburger();
  }

  initHamburger() {
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks = document.getElementById('nav-links');

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');

      // Prevent body scroll when menu is open
      if (navLinks.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });

    // Close menu when clicking a nav link
    const links = navLinks.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('active') &&
          !navLinks.contains(e.target) &&
          !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new Navigation();
});
