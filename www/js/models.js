// Data Models

const Models = {
  // URL Model
  URL: {
    create(data) {
      return {
        id: Utils.generateUUID(),
        title: data.title || '',
        url: data.url || '',
        icon: data.icon || null,
        initial: data.initial || Utils.generateInitials(data.title),
        initialColor: data.initialColor || Utils.getRandomColor(),
        categoryIds: data.categoryIds || [],
        notes: data.notes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        visitCount: 0,
        lastVisited: null,
        isFavorite: data.isFavorite || false
      };
    },

    update(url, data) {
      return {
        ...url,
        ...data,
        id: url.id,
        createdAt: url.createdAt,
        updatedAt: new Date().toISOString()
      };
    },

    validate(data) {
      const errors = [];

      if (!data.title || data.title.trim() === '') {
        errors.push('Title wajib diisi');
      }

      if (!data.url || data.url.trim() === '') {
        errors.push('URL wajib diisi');
      } else if (!Utils.isValidURL(data.url)) {
        errors.push('Format URL tidak valid');
      }

      if (data.icon && !Utils.isValidURL(data.icon)) {
        errors.push('Format Icon URL tidak valid');
      }

      if (data.notes && data.notes.length > 500) {
        errors.push('Notes maksimal 500 karakter');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    }
  },

  // Category Model
  Category: {
    create(data) {
      return {
        id: Utils.generateUUID(),
        name: data.name || '',
        color: data.color || '#5C7CFA',
        icon: data.icon || null,
        notes: data.notes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    },

    update(category, data) {
      return {
        ...category,
        ...data,
        id: category.id,
        createdAt: category.createdAt,
        updatedAt: new Date().toISOString()
      };
    },

    validate(data) {
      const errors = [];

      if (!data.name || data.name.trim() === '') {
        errors.push('Nama kategori wajib diisi');
      }

      if (data.name && data.name.length > 50) {
        errors.push('Nama kategori maksimal 50 karakter');
      }

      if (data.notes && data.notes.length > 200) {
        errors.push('Notes kategori maksimal 200 karakter');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    },

    // Get color class name from color hex
    getColorClass(color) {
      const colorMap = {
        '#9d7fd8': 'purple',
        '#5c7cfa': 'blue',
        '#38d9a9': 'teal',
        '#51cf66': 'green',
        '#ffa94d': 'orange',
        '#f783ac': 'pink',
        '#ff6b6b': 'red'
      };
      return colorMap[color] || 'blue';
    }
  }
};
