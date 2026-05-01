// View Rendering

const Views = {
  mainContent: null,

  // Initialize views
  init() {
    this.mainContent = document.getElementById('mainContent');
  },

  // Clear main content
  clear() {
    if (this.mainContent) {
      this.mainContent.innerHTML = '';
    }
  },

  // ========== Toast Notifications ==========

  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span>${Utils.escapeHTML(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  },

  // ========== Home Screen ==========

  renderHome() {
    this.clear();
    const urls = Controllers.getAllURLs();
    const sorted = Controllers.sortURLs(urls);

    const html = `
      <div class="screen home-screen">
        <div class="home-screen__search">
          <input
            type="text"
            class="home-screen__search-input"
            placeholder="Cari URL..."
            id="searchInput"
          >
        </div>

        <div class="url-grid" id="urlGrid">
          ${sorted.length > 0
            ? sorted.map(url => this.renderURLCard(url)).join('')
            : this.renderEmptyState(
                'Belum ada URL tersimpan',
                'Mulai dengan menambahkan URL pertama Anda'
              )
          }
        </div>
      </div>
    `;

    this.mainContent.innerHTML = html;
    this.attachHomeListeners();
  },

  renderURLCard(url) {
    const categories = url.categoryIds
      ? url.categoryIds.map(id => {
          const cat = Controllers.getCategoryById(id);
          return cat ? `<span class="tag tag--${Models.Category.getColorClass(cat.color)}">${Utils.escapeHTML(cat.name)}</span>` : '';
        }).join('')
      : '';

    const iconContent = url.icon
      ? `<img src="${Utils.escapeHTML(url.icon)}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"><div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; background-color:${url.initialColor}; color:var(--color-background);">${url.initial}</div>`
      : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background-color:${url.initialColor}; color:var(--color-background);">${url.initial}</div>`;

    return `
      <article class="card url-card" data-id="${url.id}">
        <div class="url-card__header">
          <div class="url-card__icon">${iconContent}</div>
          <div class="url-card__content">
            <h3 class="url-card__title">${Utils.escapeHTML(url.title)}</h3>
            <div class="url-card__categories">${categories}</div>
          </div>
          <svg class="icon icon-md url-card__chevron" viewBox="0 0 24 24">
            <use href="#icon-chevron"></use>
          </svg>
        </div>
        <div class="url-card__dropdown">
          <p class="url-card__url">${Utils.escapeHTML(url.url)}</p>
          ${url.notes ? `<p class="url-card__notes">${Utils.escapeHTML(url.notes)}</p>` : ''}
          <div class="url-card__actions">
            <a href="${Utils.escapeHTML(url.url)}" target="_blank" rel="noopener" class="btn btn--primary btn--sm">
              <svg class="icon" viewBox="0 0 24 24"><use href="#icon-external"></use></svg>
              Buka
            </a>
            <button class="btn btn--secondary btn--sm" data-action="share" data-id="${url.id}" data-url="${Utils.escapeHTML(url.url)}">
              <svg class="icon" viewBox="0 0 24 24"><use href="#icon-share"></use></svg>
              Bagikan
            </button>
            <button class="btn btn--secondary btn--sm" data-action="edit" data-id="${url.id}">
              <svg class="icon" viewBox="0 0 24 24"><use href="#icon-edit"></use></svg>
              Edit
            </button>
            <button class="btn btn--ghost btn--sm" data-action="delete" data-id="${url.id}">
              <svg class="icon" viewBox="0 0 24 24"><use href="#icon-delete"></use></svg>
            </button>
          </div>
        </div>
      </article>
    `;
  },

  attachHomeListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    const debouncedSearch = Utils.debounce((e) => {
      const query = e.target.value;
      const results = Controllers.searchURLs(query);
      const grid = document.getElementById('urlGrid');
      grid.innerHTML = results.length > 0
        ? results.map(url => this.renderURLCard(url)).join('')
        : this.renderEmptyState('Tidak ada hasil', 'Coba kata kunci lain');
      this.attachURLCardListeners(grid);
    }, 300);
    searchInput.addEventListener('input', debouncedSearch);

    this.attachURLCardListeners(this.mainContent);
  },

  attachURLCardListeners(container) {
    // URL card expand/collapse
    container.querySelectorAll('.url-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        card.classList.toggle('expanded');
        const dropdown = card.querySelector('.url-card__dropdown');
        dropdown.classList.toggle('expanded');
      });
    });

    // Edit and delete buttons
    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'edit') {
          Router.navigate(`/url/${id}/edit`);
        } else if (action === 'delete') {
          this.showDeleteConfirm(id);
        } else if (action === 'share') {
          const url = btn.dataset.url;
          this.shareURL(url);
        }
      });
    });
  },

  // ========== Add/Edit URL Screen ==========

  renderAddURL() {
    this.clear();
    const categories = Controllers.getAllCategories();

    const html = `
      <div class="screen add-url-screen">
        <div class="screen-header">
          <button class="icon-button" onclick="Router.navigate('/')">
            <svg class="icon" viewBox="0 0 24 24"><use href="#icon-back"></use></svg>
          </button>
          <h1 class="screen-header__title">Tambah URL</h1>
          <div></div>
        </div>

        <form class="add-url-screen__form" id="urlForm">
          <div class="form-group">
            <label class="form-label" for="urlTitle">Title *</label>
            <input
              type="text"
              class="form-input"
              id="urlTitle"
              name="title"
              required
              placeholder="Contoh: GitHub"
            >
          </div>

          <div class="form-group">
            <label class="form-label" for="urlInput">URL *</label>
            <input
              type="url"
              class="form-input"
              id="urlInput"
              name="url"
              required
              placeholder="https://example.com"
            >
          </div>

          <div class="form-group">
            <label class="form-label" for="urlIcon">Icon URL (opsional)</label>
            <input
              type="url"
              class="form-input"
              id="urlIcon"
              name="icon"
              placeholder="https://example.com/icon.png"
            >
          </div>

          <div class="category-selector">
            <label class="category-selector__label">Kategori</label>
            ${categories.length === 0 ? `
              <div class="category-selector__empty">
                <p>Belum ada kategori</p>
                <small>Buat kategori di menu Categories</small>
              </div>
            ` : `
              <div class="category-selector__tags" id="categoryTags">
                ${categories.map(cat => `
                  <button
                    type="button"
                    class="category-selector__tag"
                    data-category-id="${cat.id}"
                    data-color="${cat.color}"
                  >
                    ${Utils.escapeHTML(cat.name)}
                  </button>
                `).join('')}
              </div>
              <input type="hidden" id="selectedCategories" name="selectedCategories" value="">
            `}
          </div>

          <div class="form-group">
            <label class="form-label" for="urlNotes">Notes (opsional)</label>
            <textarea
              class="form-textarea"
              id="urlNotes"
              name="notes"
              maxlength="500"
              placeholder="Catatan tentang URL ini..."
            ></textarea>
          </div>

          <div class="form-row form-row--2">
            <button type="submit" class="btn btn--primary btn--full">
              <svg class="icon" viewBox="0 0 24 24"><use href="#icon-add"></use></svg>
              Simpan URL
            </button>
            <button type="button" class="btn btn--secondary btn--full" onclick="Router.navigate('/')">
              Batal
            </button>
          </div>
        </form>
      </div>
    `;

    this.mainContent.innerHTML = html;
    this.attachURLFormListeners();
  },

  renderEditURL(id) {
    const url = Controllers.getURLById(id);
    if (!url) {
      this.showToast('URL tidak ditemukan', 'error');
      Router.navigate('/');
      return;
    }

    this.clear();
    const categories = Controllers.getAllCategories();

    const html = `
      <div class="screen add-url-screen">
        <div class="screen-header">
          <button class="icon-button" onclick="Router.navigate('/')">
            <svg class="icon" viewBox="0 0 24 24"><use href="#icon-back"></use></svg>
          </button>
          <h1 class="screen-header__title">Edit URL</h1>
          <div></div>
        </div>

        <form class="add-url-screen__form" id="urlForm">
          <input type="hidden" name="id" value="${url.id}">

          <div class="form-group">
            <label class="form-label" for="urlTitle">Title *</label>
            <input
              type="text"
              class="form-input"
              id="urlTitle"
              name="title"
              required
              value="${Utils.escapeHTML(url.title)}"
              placeholder="Contoh: GitHub"
            >
          </div>

          <div class="form-group">
            <label class="form-label" for="urlInput">URL *</label>
            <input
              type="url"
              class="form-input"
              id="urlInput"
              name="url"
              required
              value="${Utils.escapeHTML(url.url)}"
              placeholder="https://example.com"
            >
          </div>

          <div class="form-group">
            <label class="form-label" for="urlIcon">Icon URL (opsional)</label>
            <input
              type="url"
              class="form-input"
              id="urlIcon"
              name="icon"
              value="${url.icon ? Utils.escapeHTML(url.icon) : ''}"
              placeholder="https://example.com/icon.png"
            >
          </div>

          <div class="category-selector">
            <label class="category-selector__label">Kategori</label>
            ${categories.length === 0 ? `
              <div class="category-selector__empty">
                <p>Belum ada kategori</p>
                <small>Buat kategori di menu Categories</small>
              </div>
            ` : `
              <div class="category-selector__tags" id="categoryTags">
                ${categories.map(cat => `
                  <button
                    type="button"
                    class="category-selector__tag${url.categoryIds.includes(cat.id) ? ' selected' : ''}"
                    data-category-id="${cat.id}"
                    data-color="${cat.color}"
                  >
                    ${Utils.escapeHTML(cat.name)}
                  </button>
                `).join('')}
              </div>
              <input type="hidden" id="selectedCategories" name="selectedCategories" value="${url.categoryIds.join(',')}">
            `}
          </div>

          <div class="form-group">
            <label class="form-label" for="urlNotes">Notes (opsional)</label>
            <textarea
              class="form-textarea"
              id="urlNotes"
              name="notes"
              maxlength="500"
              placeholder="Catatan tentang URL ini..."
            >${url.notes ? Utils.escapeHTML(url.notes) : ''}</textarea>
          </div>

          <div class="form-row form-row--2">
            <button type="submit" class="btn btn--primary btn--full">
              <svg class="icon" viewBox="0 0 24 24"><use href="#icon-edit"></use></svg>
              Update URL
            </button>
            <button type="button" class="btn btn--secondary btn--full" onclick="Router.navigate('/')">
              Batal
            </button>
          </div>
        </form>
      </div>
    `;

    this.mainContent.innerHTML = html;
    this.attachURLFormListeners(true);
  },

  attachURLFormListeners(isEdit = false) {
    const form = document.getElementById('urlForm');

    // Category tag selection
    const categoryTags = document.getElementById('categoryTags');
    const selectedCategoriesInput = document.getElementById('selectedCategories');

    if (categoryTags && selectedCategoriesInput) {
      let selectedCategories = selectedCategoriesInput.value
        ? selectedCategoriesInput.value.split(',').filter(id => id)
        : [];

      // Update initial state
      categoryTags.querySelectorAll('.category-selector__tag').forEach(tag => {
        if (selectedCategories.includes(tag.dataset.categoryId)) {
          tag.classList.add('selected');
        }
      });

      categoryTags.addEventListener('click', (e) => {
        const tag = e.target.closest('.category-selector__tag');
        if (!tag) return;

        e.preventDefault();
        e.stopPropagation();

        const categoryId = tag.dataset.categoryId;

        if (selectedCategories.includes(categoryId)) {
          selectedCategories = selectedCategories.filter(id => id !== categoryId);
          tag.classList.remove('selected');
        } else {
          selectedCategories.push(categoryId);
          tag.classList.add('selected');
        }

        selectedCategoriesInput.value = selectedCategories.join(',');
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const selectedCategories = selectedCategoriesInput?.value
        ? selectedCategoriesInput.value.split(',').filter(id => id)
        : [];

      const data = {
        title: formData.get('title'),
        url: formData.get('url'),
        icon: formData.get('icon') || null,
        categoryIds: selectedCategories,
        notes: formData.get('notes') || null
      };

      if (isEdit) {
        const id = formData.get('id');
        const result = Controllers.updateURL(id, data);
        if (result.success) {
          this.showToast('URL berhasil diupdate');
          Router.navigate('/');
        } else {
          this.showToast(result.errors.join(', '), 'error');
        }
      } else {
        const result = Controllers.createURL(data);
        if (result.success) {
          this.showToast('URL berhasil ditambahkan');
          Router.navigate('/');
        } else {
          this.showToast(result.errors.join(', '), 'error');
        }
      }
    });
  },

  // ========== URL Detail Screen ==========

  renderURLDetail(id) {
    const url = Controllers.getURLById(id);
    if (!url) {
      this.showToast('URL tidak ditemukan', 'error');
      Router.navigate('/');
      return;
    }

    // Record visit
    Controllers.visitURL(id);

    const categories = url.categoryIds
      ? url.categoryIds.map(id => {
          const cat = Controllers.getCategoryById(id);
          return cat ? `<span class="tag tag--${Models.Category.getColorClass(cat.color)}">${Utils.escapeHTML(cat.name)}</span>` : '';
        }).join('')
      : '';

    const iconContent = url.icon
      ? `<img src="${Utils.escapeHTML(url.icon)}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"><div style="display:none; width:100%; height:100%; align-items:center; justify-content:center; background-color:${url.initialColor}; color:var(--color-background); font-size:var(--font-size-2xl);">${url.initial}</div>`
      : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background-color:${url.initialColor}; color:var(--color-background); font-size:var(--font-size-2xl);">${url.initial}</div>`;

    this.clear();

    const html = `
      <div class="screen url-detail-screen">
        <div class="screen-header">
          <button class="icon-button" onclick="Router.navigate('/')">
            <svg class="icon" viewBox="0 0 24 24"><use href="#icon-back"></use></svg>
          </button>
          <h1 class="screen-header__title">Detail URL</h1>
          <button class="icon-button" data-action="menu">
            <svg class="icon" viewBox="0 0 24 24"><use href="#icon-menu"></use></svg>
          </button>
        </div>

        <div class="url-detail-screen__icon">${iconContent}</div>
        <h2 class="url-detail-screen__title">${Utils.escapeHTML(url.title)}</h2>
        <p class="url-detail-screen__url">${Utils.escapeHTML(url.url)}</p>

        <div class="url-detail-screen__categories">${categories}</div>

        <div class="url-detail-screen__meta">
          <span class="url-detail-screen__meta-item">
            📅 Ditambahkan ${Utils.formatDate(url.createdAt)}
          </span>
          <span class="url-detail-screen__meta-item">
            👁️ Dikunjungi ${url.visitCount || 0} kali
          </span>
          ${url.lastVisited ? `
            <span class="url-detail-screen__meta-item">
              🕐 Terakhir ${Utils.formatRelativeTime(url.lastVisited)}
            </span>
          ` : ''}
        </div>

        ${url.notes ? `
          <div class="url-detail-screen__notes">
            <div class="url-detail-screen__notes-title">Notes</div>
            <div class="url-detail-screen__notes-content">${Utils.escapeHTML(url.notes)}</div>
          </div>
        ` : ''}

        <div class="url-detail-screen__actions">
          <a href="${Utils.escapeHTML(url.url)}" target="_blank" rel="noopener" class="btn btn--primary">
            <svg class="icon" viewBox="0 0 24 24"><use href="#icon-external"></use></svg>
            Buka URL
          </a>
          <button class="btn btn--secondary" data-action="share">
            <svg class="icon" viewBox="0 0 24 24"><use href="#icon-share"></use></svg>
            Bagikan
          </button>
          <button class="btn btn--secondary" data-action="edit">
            <svg class="icon" viewBox="0 0 24 24"><use href="#icon-edit"></use></svg>
            Edit
          </button>
          <button class="btn btn--destructive" data-action="delete">
            <svg class="icon" viewBox="0 0 24 24"><use href="#icon-delete"></use></svg>
            Hapus
          </button>
        </div>
      </div>
    `;

    this.mainContent.innerHTML = html;
    this.attachURLDetailListeners(id);
  },

  attachURLDetailListeners(id) {
    const url = Controllers.getURLById(id);

    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;

        switch (action) {
          case 'edit':
            Router.navigate(`/url/${id}/edit`);
            break;
          case 'delete':
            this.showDeleteConfirm(id);
            break;
          case 'share':
            Utils.share(url.title, url.url);
            break;
          case 'menu':
            // Show menu options
            break;
        }
      });
    });
  },

  // ========== Categories Screen ==========

  renderCategories() {
    this.clear();
    const categories = Controllers.getAllCategories();

    const html = `
      <div class="screen categories-screen">
        <div class="screen-header">
          <button class="icon-button" onclick="Router.navigate('/')">
            <svg class="icon" viewBox="0 0 24 24"><use href="#icon-back"></use></svg>
          </button>
          <h1 class="screen-header__title">Kategori</h1>
          <button class="icon-button" id="addCategoryBtn">
            <svg class="icon" viewBox="0 0 24 24"><use href="#icon-add"></use></svg>
          </button>
        </div>

        <div class="category-grid">
          ${categories.map(cat => this.renderCategoryCard(cat)).join('')}
          ${categories.length === 0 ? this.renderEmptyState(
            'Belum ada kategori',
            'Buat kategori untuk mengelompokkan URL'
          ) : ''}
        </div>
      </div>
    `;

    this.mainContent.innerHTML = html;
    this.attachCategoriesListeners();
  },

  renderCategoryCard(category) {
    const stats = Controllers.getCategoryStats(category.id);
    const colorClass = Models.Category.getColorClass(category.color);

    return `
      <article class="card category-card" data-id="${category.id}">
        <div class="category-card__icon" style="background-color: ${category.color}; color: var(--color-background);">
          ${category.icon || category.name.charAt(0).toUpperCase()}
        </div>
        <h3 class="category-card__name">${Utils.escapeHTML(category.name)}</h3>
        <p class="category-card__count">${stats.total} URL</p>
        <div class="category-card__actions">
          <button class="category-card__btn category-card__btn--edit" data-action="edit" data-id="${category.id}" aria-label="Edit kategori">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          </button>
          <button class="category-card__btn category-card__btn--delete" data-action="delete" data-id="${category.id}" aria-label="Hapus kategori">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      </article>
    `;
  },

  attachCategoriesListeners() {
    // Add category button
    document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
      this.showCategoryForm();
    });

    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        const id = card.dataset.id;
        Router.navigate(`/category/${id}`);
      });
    });

    // Edit and delete buttons
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const id = btn.dataset.id;

        if (action === 'edit') {
          this.showCategoryForm(id);
        } else if (action === 'delete') {
          this.showCategoryDeleteConfirm(id);
        }
      });
    });
  },

  showCategoryForm(id = null) {
    const category = id ? Controllers.getCategoryById(id) : null;
    const isEdit = !!category;

    const title = isEdit ? 'Edit Kategori' : 'Tambah Kategori';
    const name = isEdit ? category.name : '';
    const selectedColor = isEdit ? category.color : '#C4A8FF';

    const colorPresets = [
      { name: 'soft-purple', value: '#C4A8FF' },
      { name: 'soft-blue', value: '#7EC8E3' },
      { name: 'soft-teal', value: '#7DD3C0' },
      { name: 'soft-green', value: '#A3D977' },
      { name: 'soft-yellow', value: '#FFE49A' },
      { name: 'soft-orange', value: '#FFB38A' },
      { name: 'soft-pink', value: '#FF9EC1' },
      { name: 'soft-red', value: '#FF8A8A' },
      { name: 'soft-coral', value: '#FF9B7B' },
      { name: 'soft-lavender', value: '#B8A8E3' },
      { name: 'soft-mint', value: '#6DD5C7' },
      { name: 'soft-lime', value: '#B8D977' },
      { name: 'soft-sky', value: '#8DD4E3' },
      { name: 'soft-rose', value: '#E38FA8' }
    ];

    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalActions = document.getElementById('modalActions');

    modalTitle.textContent = title;
    modalContent.innerHTML = `
      <form id="categoryForm">
        <div class="form-group">
          <label class="form-label" for="categoryName">Nama Kategori *</label>
          <input
            type="text"
            class="form-input"
            id="categoryName"
            name="name"
            required
            value="${Utils.escapeHTML(name)}"
            placeholder="Contoh: Work, Personal, Learning"
          >
        </div>

        <div class="form-group">
          <label class="form-label">Pilih Warna</label>
          <div class="category-color-presets">
            ${colorPresets.map(preset => `
              <div
                class="category-color-preset category-color-preset--${preset.name}${selectedColor === preset.value ? ' selected' : ''}"
                data-color="${preset.value}"
                data-name="${preset.name}"
                title="${preset.name}"
              ></div>
            `).join('')}
          </div>
          <input type="hidden" id="categoryColor" name="color" value="${selectedColor}">
        </div>
      </form>
    `;

    modalActions.innerHTML = `
      <button class="btn btn--secondary" id="cancelCategoryBtn">Batal</button>
      <button class="btn btn--primary" id="saveCategoryBtn">Simpan</button>
    `;

    const modal = document.getElementById('modalOverlay');
    modal.classList.add('active');

    const close = () => modal.classList.remove('active');
    document.getElementById('modalClose').onclick = close;
    document.getElementById('cancelCategoryBtn').onclick = close;

    // Color preset selection
    const colorPresetsContainer = modalContent.querySelector('.category-color-presets');
    const colorInput = modalContent.querySelector('#categoryColor');

    colorPresetsContainer.addEventListener('click', (e) => {
      const preset = e.target.closest('.category-color-preset');
      if (!preset) return;

      // Remove selected from all
      colorPresetsContainer.querySelectorAll('.category-color-preset').forEach(p => {
        p.classList.remove('selected');
      });

      // Add selected to clicked
      preset.classList.add('selected');

      // Update hidden input
      colorInput.value = preset.dataset.color;
    });

    document.getElementById('saveCategoryBtn').onclick = () => {
      const form = document.getElementById('categoryForm');
      const formData = new FormData(form);
      const data = {
        name: formData.get('name'),
        color: formData.get('color')
      };

      if (isEdit) {
        const result = Controllers.updateCategory(id, data);
        if (result.success) {
          this.showToast('Kategori berhasil diupdate');
          close();
          this.renderCategories();
        } else {
          this.showToast(result.errors.join(', '), 'error');
        }
      } else {
        const result = Controllers.createCategory(data);
        if (result.success) {
          this.showToast('Kategori berhasil ditambahkan');
          close();
          this.renderCategories();
        } else {
          this.showToast(result.errors.join(', '), 'error');
        }
      }
    };
  },

  showCategoryDeleteConfirm(id) {
    const category = Controllers.getCategoryById(id);
    const stats = Controllers.getCategoryStats(id);

    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalActions = document.getElementById('modalActions');

    modalTitle.textContent = 'Hapus Kategori';
    modalContent.innerHTML = `
      <p>Apakah Anda yakin ingin menghapus kategori <strong>${Utils.escapeHTML(category.name)}</strong>?</p>
      ${stats.total > 0 ? `<p class="text-error">${stats.total} URL akan kehilangan kategori ini.</p>` : ''}
    `;

    modalActions.innerHTML = `
      <button class="btn btn--secondary" id="cancelDeleteBtn">Batal</button>
      <button class="btn btn--destructive" id="confirmDeleteBtn">Hapus</button>
    `;

    const modal = document.getElementById('modalOverlay');
    modal.classList.add('active');

    const close = () => modal.classList.remove('active');
    document.getElementById('modalClose').onclick = close;
    document.getElementById('cancelDeleteBtn').onclick = close;

    document.getElementById('confirmDeleteBtn').onclick = () => {
      Controllers.deleteCategory(id);
      this.showToast('Kategori berhasil dihapus');
      close();
      this.renderCategories();
    };
  },

  // ========== Category Detail Screen ==========

  renderCategoryDetail(id) {
    const category = Controllers.getCategoryById(id);
    if (!category) {
      this.showToast('Kategori tidak ditemukan', 'error');
      Router.navigate('/categories');
      return;
    }

    const urls = Controllers.getURLsByCategory(id);
    const stats = Controllers.getCategoryStats(id);

    this.clear();

    const html = `
      <div class="screen category-detail-screen">
        <div class="screen-header">
          <button class="icon-button" onclick="Router.navigate('/categories')">
            <svg class="icon" viewBox="0 0 24 24"><use href="#icon-back"></use></svg>
          </button>
          <div class="flex-center" style="gap: var(--space-md);">
            <div style="width: 40px; height: 40px; border-radius: var(--radius-md); background-color: ${category.color}; display: flex; align-items: center; justify-content: center;">
              ${category.icon || category.name.charAt(0)}
            </div>
            <h1 class="screen-header__title">${Utils.escapeHTML(category.name)}</h1>
          </div>
          <button class="icon-button" data-action="edit">
            <svg class="icon" viewBox="0 0 24 24"><use href="#icon-edit"></use></svg>
          </button>
        </div>

        <div class="category-grid">
          ${urls.map(url => this.renderURLCard(url)).join('')}
          ${urls.length === 0 ? this.renderEmptyState(
            'Belum ada URL di kategori ini',
            'Tambahkan URL ke kategori ini'
          ) : ''}
        </div>
      </div>
    `;

    this.mainContent.innerHTML = html;
    this.attachCategoryDetailListeners(id);
  },

  attachCategoryDetailListeners(id) {
    document.querySelector('[data-action="edit"]')?.addEventListener('click', () => {
      this.showCategoryForm(id);
    });
    this.attachURLCardListeners(this.mainContent);
  },

  // ========== Search Screen ==========

  renderSearch() {
    this.clear();

    const html = `
      <div class="screen search-screen">
        <div class="screen-header">
          <button class="icon-button" onclick="Router.navigate('/')">
            <svg class="icon" viewBox="0 0 24 24"><use href="#icon-back"></use></svg>
          </button>
          <h1 class="screen-header__title">Cari</h1>
          <div></div>
        </div>

        <div class="search-screen__input-wrapper">
          <svg class="icon icon-md search-screen__input-icon" viewBox="0 0 24 24">
            <use href="#icon-search"></use>
          </svg>
          <input
            type="text"
            class="search-screen__input"
            id="searchInput"
            placeholder="Cari URL..."
            autofocus
          >
        </div>

        <div class="search-screen__results" id="searchResults">
          <div class="search-screen__no-results">
            <div class="search-screen__no-results-icon">🔍</div>
            <p>Ketik untuk mencari URL</p>
          </div>
        </div>
      </div>
    `;

    this.mainContent.innerHTML = html;

    const searchInput = document.getElementById('searchInput');
    const debouncedSearch = Utils.debounce((e) => {
      const query = e.target.value.trim();
      const resultsContainer = document.getElementById('searchResults');

      if (!query) {
        resultsContainer.innerHTML = `
          <div class="search-screen__no-results">
            <div class="search-screen__no-results-icon">🔍</div>
            <p>Ketik untuk mencari URL</p>
          </div>
        `;
        return;
      }

      const results = Controllers.searchURLs(query);

      if (results.length === 0) {
        resultsContainer.innerHTML = `
          <div class="search-screen__no-results">
            <div class="search-screen__no-results-icon">😕</div>
            <p>Tidak ada hasil untuk "${Utils.escapeHTML(query)}"</p>
          </div>
        `;
      } else {
        resultsContainer.innerHTML = `
          <div class="url-grid">
            ${results.map(url => this.renderURLCard(url)).join('')}
          </div>
        `;
        this.attachURLCardListeners(resultsContainer);
      }
    }, 300);

    searchInput.addEventListener('input', debouncedSearch);
    searchInput.focus();
  },

  // ========== Settings Screen ==========

  renderSettings() {
    this.clear();
    const settings = Controllers.getSettings();
    const backupTimestamp = Storage.getBackupTimestamp();

    const html = `
      <div class="screen settings-screen">
        <div class="screen-header">
          <button class="icon-button" onclick="Router.navigate('/')">
            <svg class="icon" viewBox="0 0 24 24"><use href="#icon-back"></use></svg>
          </button>
          <h1 class="screen-header__title">Pengaturan</h1>
          <div></div>
        </div>

        <section class="settings-screen__section">
          <h2 class="settings-screen__section-title">Data Management</h2>

          <div class="settings-screen__item">
            <div class="settings-screen__item-content">
              <div class="settings-screen__item-label">Export Data</div>
              <div class="settings-screen__item-description">
                Backup semua data ke file JSON${backupTimestamp ? `<br>Last backup: ${Utils.formatDate(backupTimestamp)}` : ''}
              </div>
            </div>
            <button class="settings-screen__btn settings-screen__btn--secondary" id="exportBtn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
              Export
            </button>
          </div>

          <div class="settings-screen__item">
            <div class="settings-screen__item-content">
              <div class="settings-screen__item-label">Import Data</div>
              <div class="settings-screen__item-description">
                Restore data dari file JSON backup
              </div>
            </div>
            <button class="settings-screen__btn settings-screen__btn--secondary" id="importBtn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>
              Import
            </button>
          </div>

          <div class="settings-screen__item">
            <div class="settings-screen__item-content">
              <div class="settings-screen__item-label">Clear All Data</div>
              <div class="settings-screen__item-description">
                Hapus semua URL dan kategori
              </div>
            </div>
            <button class="settings-screen__btn settings-screen__btn--danger" id="clearBtn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
              Clear
            </button>
          </div>
        </section>

        <section class="settings-screen__section">
          <h2 class="settings-screen__section-title">Preferences</h2>

          <div class="settings-screen__item">
            <div class="settings-screen__item-content">
              <div class="settings-screen__item-label">Default Sort</div>
              <div class="settings-screen__item-description">
                Urutan default untuk daftar URL
              </div>
            </div>
            <select class="form-select" id="sortSelect" style="width: auto; flex-shrink: 0;">
              <option value="createdAt-desc" ${settings.sortBy === 'createdAt' && settings.sortOrder === 'desc' ? 'selected' : ''}>Terbaru</option>
              <option value="createdAt-asc" ${settings.sortBy === 'createdAt' && settings.sortOrder === 'asc' ? 'selected' : ''}>Terlama</option>
              <option value="title-asc" ${settings.sortBy === 'title' && settings.sortOrder === 'asc' ? 'selected' : ''}>A-Z</option>
              <option value="title-desc" ${settings.sortBy === 'title' && settings.sortOrder === 'desc' ? 'selected' : ''}>Z-A</option>
              <option value="visitCount-desc" ${settings.sortBy === 'visitCount' && settings.sortOrder === 'desc' ? 'selected' : ''}>Paling Sering Dikunjungi</option>
            </select>
          </div>
        </section>

        <section class="settings-screen__section">
          <h2 class="settings-screen__section-title">About</h2>

          <div class="settings-screen__item">
            <div class="settings-screen__item-content">
              <div class="settings-screen__item-label">LinkVault</div>
              <div class="settings-screen__item-description">
                Version 1.0.0<br>
                Offline-first bookmark manager
              </div>
            </div>
          </div>
        </section>
      </div>
    `;

    this.mainContent.innerHTML = html;
    this.attachSettingsListeners();
  },

  attachSettingsListeners() {
    // Export button
    document.getElementById('exportBtn')?.addEventListener('click', () => {
      Controllers.exportData();
      this.showToast('Data berhasil diexport');
    });

    // Import button
    document.getElementById('importBtn')?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          const result = await Controllers.importData(file);
          if (result.success) {
            this.showToast('Data berhasil diimport');
            this.renderSettings();
          } else {
            this.showToast(result.error, 'error');
          }
        }
      };
      input.click();
    });

    // Clear button
    document.getElementById('clearBtn')?.addEventListener('click', () => {
      this.showClearAllConfirm();
    });

    // Sort select
    document.getElementById('sortSelect')?.addEventListener('change', (e) => {
      const [sortBy, sortOrder] = e.target.value.split('-');
      Controllers.updateSettings({ sortBy, sortOrder });
      this.showToast('Pengaturan disimpan');
    });
  },

  showClearAllConfirm() {
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalActions = document.getElementById('modalActions');

    modalTitle.textContent = 'Hapus Semua Data';
    modalContent.innerHTML = `
      <p>Apakah Anda yakin ingin menghapus semua data?</p>
      <p class="text-error">Tindakan ini tidak dapat dibatalkan. Semua URL dan kategori akan dihapus secara permanen.</p>
    `;

    modalActions.innerHTML = `
      <button class="btn btn--secondary" id="cancelClearBtn">Batal</button>
      <button class="btn btn--destructive" id="confirmClearBtn">Ya, Hapus Semua</button>
    `;

    const modal = document.getElementById('modalOverlay');
    modal.classList.add('active');

    const close = () => modal.classList.remove('active');
    document.getElementById('modalClose').onclick = close;
    document.getElementById('cancelClearBtn').onclick = close;

    document.getElementById('confirmClearBtn').onclick = () => {
      Controllers.clearAllData();
      this.showToast('Semua data berhasil dihapus');
      close();
      Router.navigate('/');
    };
  },

  // ========== Helpers ==========

  renderEmptyState(title, description) {
    return `
      <div class="empty-state">
        <div class="empty-state__icon">📂</div>
        <h2 class="empty-state__title">${Utils.escapeHTML(title)}</h2>
        <p class="empty-state__description">${Utils.escapeHTML(description)}</p>
      </div>
    `;
  },

  showDeleteConfirm(id) {
    const url = Controllers.getURLById(id);

    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalActions = document.getElementById('modalActions');

    modalTitle.textContent = 'Hapus URL';
    modalContent.innerHTML = `
      <p>Apakah Anda yakin ingin menghapus URL <strong>${Utils.escapeHTML(url.title)}</strong>?</p>
      <p class="text-tertiary">${Utils.escapeHTML(url.url)}</p>
    `;

    modalActions.innerHTML = `
      <button class="btn btn--secondary" id="cancelDeleteBtn">Batal</button>
      <button class="btn btn--destructive" id="confirmDeleteBtn">Hapus</button>
    `;

    const modal = document.getElementById('modalOverlay');
    modal.classList.add('active');

    const close = () => modal.classList.remove('active');
    document.getElementById('modalClose').onclick = close;
    document.getElementById('cancelDeleteBtn').onclick = close;

    document.getElementById('confirmDeleteBtn').onclick = () => {
      Controllers.deleteURL(id);
      this.showToast('URL berhasil dihapus');
      close();
      this.renderHome();
    };
  },

  shareURL(url) {
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: 'Bagikan URL',
        url: url
      }).catch((error) => {
        // User cancelled or error occurred
        console.log('Share failed:', error);
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(url).then(() => {
        this.showToast('URL berhasil disalin ke clipboard');
      }).catch(() => {
        this.showToast('Gagal menyalin URL', 'error');
      });
    }
  }
};
