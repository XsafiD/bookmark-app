// Main App Initialization

const App = {
  // Initialize app
  init() {
    // Initialize controllers
    Controllers.init();

    // Initialize views
    Views.init();

    // Setup header buttons
    this.setupHeaderButtons();

    // Setup navbar links
    this.setupNavbarLinks();

    // Define routes
    const routes = {
      '/': () => Views.renderHome(),
      '/home': () => Views.renderHome(),
      '/add': () => Views.renderAddURL(),
      '/url/:id': (params) => Views.renderURLDetail(params.id),
      '/url/:id/edit': (params) => Views.renderEditURL(params.id),
      '/categories': () => Views.renderCategories(),
      '/category/:id': (params) => Views.renderCategoryDetail(params.id),
      '/search': () => Views.renderSearch(),
      '/settings': () => Views.renderSettings()
    };

    // Initialize router
    Router.init(routes);
  },

  // Setup header button listeners
  setupHeaderButtons() {
    const settingsBtn = document.getElementById('settingsBtn');

    settingsBtn?.addEventListener('click', () => {
      Router.navigate('/settings');
    });
  },

  // Setup navbar link listeners
  setupNavbarLinks() {
    // Handle navbar clicks
    document.addEventListener('click', (e) => {
      const navLink = e.target.closest('.nav-link[data-navigo]');
      if (navLink) {
        e.preventDefault();
        const href = navLink.getAttribute('href');
        if (href) {
          Router.navigate(href);
        }
      }
    });
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
