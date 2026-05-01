// Business Logic Controllers

const Controllers = {
  appState: null,

  // Initialize controller
  init() {
    this.appState = Storage.load();
  },

  // Save app state
  save() {
    return Storage.save(this.appState);
  },

  // ========== URL Controllers ==========

  // Get all URLs
  getAllURLs() {
    return this.appState.urls;
  },

  // Get URL by ID
  getURLById(id) {
    return this.appState.urls.find(url => url.id === id);
  },

  // Create new URL
  createURL(data) {
    const validation = Models.URL.validate(data);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const newURL = Models.URL.create(data);
    this.appState.urls.unshift(newURL);
    this.save();
    return { success: true, data: newURL };
  },

  // Update URL
  updateURL(id, data) {
    const url = this.getURLById(id);
    if (!url) {
      return { success: false, errors: ['URL tidak ditemukan'] };
    }

    const validation = Models.URL.validate(data);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const updated = Models.URL.update(url, data);
    const index = this.appState.urls.findIndex(u => u.id === id);
    this.appState.urls[index] = updated;
    this.save();
    return { success: true, data: updated };
  },

  // Delete URL
  deleteURL(id) {
    const index = this.appState.urls.findIndex(url => url.id === id);
    if (index === -1) {
      return { success: false, errors: ['URL tidak ditemukan'] };
    }

    this.appState.urls.splice(index, 1);
    this.save();
    return { success: true };
  },

  // Visit URL (increment counter)
  visitURL(id) {
    const url = this.getURLById(id);
    if (!url) {
      return { success: false, errors: ['URL tidak ditemukan'] };
    }

    url.visitCount = (url.visitCount || 0) + 1;
    url.lastVisited = new Date().toISOString();
    this.save();
    return { success: true, data: url };
  },

  // Toggle favorite
  toggleFavorite(id) {
    const url = this.getURLById(id);
    if (!url) {
      return { success: false, errors: ['URL tidak ditemukan'] };
    }

    url.isFavorite = !url.isFavorite;
    this.save();
    return { success: true, data: url };
  },

  // Search URLs
  searchURLs(query, categoryFilter = null) {
    let results = this.appState.urls;

    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(url =>
        url.title.toLowerCase().includes(lowerQuery) ||
        url.url.toLowerCase().includes(lowerQuery) ||
        (url.notes && url.notes.toLowerCase().includes(lowerQuery))
      );
    }

    if (categoryFilter) {
      results = results.filter(url =>
        url.categoryIds && url.categoryIds.includes(categoryFilter)
      );
    }

    return results;
  },

  // Sort URLs
  sortURLs(urls, sortBy = null, sortOrder = null) {
    const sort = sortBy || this.appState.settings.sortBy;
    const order = sortOrder || this.appState.settings.sortOrder;

    return [...urls].sort((a, b) => {
      let comparison = 0;

      switch (sort) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'visitCount':
          comparison = (a.visitCount || 0) - (b.visitCount || 0);
          break;
        case 'lastVisited':
          const aDate = a.lastVisited ? new Date(a.lastVisited).getTime() : 0;
          const bDate = b.lastVisited ? new Date(b.lastVisited).getTime() : 0;
          comparison = aDate - bDate;
          break;
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return order === 'desc' ? -comparison : comparison;
    });
  },

  // ========== Category Controllers ==========

  // Get all categories
  getAllCategories() {
    return this.appState.categories;
  },

  // Get category by ID
  getCategoryById(id) {
    return this.appState.categories.find(cat => cat.id === id);
  },

  // Create new category
  createCategory(data) {
    const validation = Models.Category.validate(data);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const newCategory = Models.Category.create(data);
    this.appState.categories.push(newCategory);
    this.save();
    return { success: true, data: newCategory };
  },

  // Update category
  updateCategory(id, data) {
    const category = this.getCategoryById(id);
    if (!category) {
      return { success: false, errors: ['Kategori tidak ditemukan'] };
    }

    const validation = Models.Category.validate(data);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    const updated = Models.Category.update(category, data);
    const index = this.appState.categories.findIndex(c => c.id === id);
    this.appState.categories[index] = updated;
    this.save();
    return { success: true, data: updated };
  },

  // Delete category
  deleteCategory(id) {
    const index = this.appState.categories.findIndex(cat => cat.id === id);
    if (index === -1) {
      return { success: false, errors: ['Kategori tidak ditemukan'] };
    }

    this.appState.categories.splice(index, 1);

    // Remove category from all URLs
    this.appState.urls.forEach(url => {
      if (url.categoryIds) {
        url.categoryIds = url.categoryIds.filter(catId => catId !== id);
      }
    });

    this.save();
    return { success: true };
  },

  // Get URLs by category
  getURLsByCategory(categoryId) {
    return this.appState.urls.filter(url =>
      url.categoryIds && url.categoryIds.includes(categoryId)
    );
  },

  // Get category stats
  getCategoryStats(categoryId) {
    const urls = this.getURLsByCategory(categoryId);
    return {
      total: urls.length,
      lastUpdated: urls.length > 0
        ? urls.reduce((latest, url) =>
            new Date(url.updatedAt) > new Date(latest.updatedAt) ? url : latest
          ).updatedAt
        : null
    };
  },

  // ========== Settings Controllers ==========

  // Get settings
  getSettings() {
    return this.appState.settings;
  },

  // Update settings
  updateSettings(data) {
    this.appState.settings = {
      ...this.appState.settings,
      ...data
    };
    this.save();
    return { success: true, data: this.appState.settings };
  },

  // Export data
  exportData() {
    Storage.export();
  },

  // Import data
  async importData(file) {
    const result = await Storage.import(file);
    if (result.success) {
      this.appState = result.data;
    }
    return result;
  },

  // Clear all data
  clearAllData() {
    Storage.clear();
    this.appState = Storage.load();
    return { success: true };
  }
};
