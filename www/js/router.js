// Hash-based Router

const Router = {
  routes: {},
  currentRoute: null,

  // Define routes
  init(routes) {
    this.routes = routes;
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  },

  // Handle route change
  handleRoute() {
    let hash = window.location.hash.slice(1);
    if (!hash || hash === '/') {
      hash = '/';
    }

    // Remove leading slash for processing
    const cleanPath = hash.startsWith('/') ? hash.slice(1) : hash;
    const segments = cleanPath ? cleanPath.split('/').filter(Boolean) : [];
    const path = segments[0] || '/';
    const params = segments.slice(1);

    // Find matching route
    let matchedRoute = null;
    let routeParams = {};

    // Build route pattern matching
    for (const route in this.routes) {
      const routeParts = route.split('/').filter(Boolean);
      const numSegments = path === '/' ? 0 : segments.length;

      if (routeParts.length === numSegments) {
        let match = true;
        const tempParams = {};

        if (path === '/' && routeParts.length === 0) {
          matchedRoute = route;
          break;
        }

        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(':')) {
            const paramName = routeParts[i].slice(1);
            tempParams[paramName] = segments[i];
          } else if (routeParts[i].toLowerCase() !== segments[i].toLowerCase()) {
            match = false;
            break;
          }
        }

        if (match) {
          matchedRoute = route;
          routeParams = tempParams;
          break;
        }
      }
    }

    if (matchedRoute) {
      this.currentRoute = matchedRoute;
      this.routes[matchedRoute](routeParams);
      this.updateActiveNav();
    } else {
      // 404 - redirect to home
      window.location.hash = '/';
    }
  },

  // Navigate to route
  navigate(path) {
    window.location.hash = path;
  },

  // Update active navigation state
  updateActiveNav() {
    let path = window.location.hash.slice(1);
    // Normalize empty path to '/'
    if (!path || path === '/') {
      path = '/';
    } else {
      // Remove leading slash for path matching
      path = path.startsWith('/') ? path.slice(1) : path;
    }

    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      const page = link.dataset.page;
      if (page === 'home' && path === '/') {
        link.classList.add('nav-link--active');
      } else if (page === 'add' && path.startsWith('add')) {
        link.classList.add('nav-link--active');
      } else if (page === 'categories' && path.startsWith('categor')) {
        link.classList.add('nav-link--active');
      } else {
        link.classList.remove('nav-link--active');
      }
    });
  },

};
