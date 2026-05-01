// LocalStorage Wrapper

const Storage = {
  KEYS: {
    DATA: 'linkvault_data',
    VERSION: 'linkvault_version',
    BACKUP_TIMESTAMP: 'linkvault_backup_timestamp'
  },

  CURRENT_VERSION: '1.0',

  // Get default app state
  getInitialState() {
    return {
      urls: [],
      categories: [],
      settings: {
        defaultCategoryColor: '#5C7CFA',
        autoBackup: false,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      },
      version: this.CURRENT_VERSION
    };
  },

  // Load data from LocalStorage
  load() {
    try {
      const data = localStorage.getItem(this.KEYS.DATA);
      if (!data) {
        return this.getInitialState();
      }
      const parsed = JSON.parse(data);
      return this.validateAndMigrate(parsed);
    } catch (error) {
      console.error('Failed to load data:', error);
      return this.getInitialState();
    }
  },

  // Save data to LocalStorage
  save(data) {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(this.KEYS.DATA, serialized);
      localStorage.setItem(this.KEYS.VERSION, this.CURRENT_VERSION);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
        return false;
      }
      console.error('Failed to save data:', error);
      return false;
    }
  },

  // Validate and migrate data if needed
  validateAndMigrate(data) {
    // Ensure all required fields exist
    if (!data.urls) data.urls = [];
    if (!data.categories) data.categories = [];
    if (!data.settings) data.settings = this.getInitialState().settings;
    if (!data.version) data.version = this.CURRENT_VERSION;

    // Add timestamps if missing
    data.urls.forEach(url => {
      if (!url.createdAt) url.createdAt = new Date().toISOString();
      if (!url.updatedAt) url.updatedAt = new Date().toISOString();
      if (!url.visitCount) url.visitCount = 0;
      if (!url.isFavorite) url.isFavorite = false;
    });

    data.categories.forEach(category => {
      if (!category.createdAt) category.createdAt = new Date().toISOString();
      if (!category.updatedAt) category.updatedAt = new Date().toISOString();
    });

    return data;
  },

  // Export data to JSON file
  export() {
    const data = this.load();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `linkvault-backup-${timestamp}.json`;
    Utils.downloadJSON(data, filename);
    localStorage.setItem(this.KEYS.BACKUP_TIMESTAMP, new Date().toISOString());
  },

  // Import data from JSON file
  async import(file) {
    try {
      const data = await Utils.readJSONFile(file);
      const validated = this.validateAndMigrate(data);
      this.save(validated);
      return { success: true, data: validated };
    } catch (error) {
      console.error('Import failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Clear all data
  clear() {
    localStorage.removeItem(this.KEYS.DATA);
    localStorage.removeItem(this.KEYS.VERSION);
    localStorage.removeItem(this.KEYS.BACKUP_TIMESTAMP);
  },

  // Get backup timestamp
  getBackupTimestamp() {
    return localStorage.getItem(this.KEYS.BACKUP_TIMESTAMP);
  }
};
