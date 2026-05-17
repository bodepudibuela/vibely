// frontend/js/layout.js
// Injects the sidebar + topbar + mobile nav into every page that includes it.

function renderLayout(activePage) {
  const user = Session.getUser();
  if (!user) return;

  const avatarSrc = Helpers.avatarUrl(user.avatar);

  const sidebarHTML = `
  <aside class="vb-sidebar" id="sidebar">
    <div class="vb-sidebar__logo">Vibe<span>ly</span></div>
    <ul class="vb-nav">
      <li class="vb-nav__item">
        <a href="feed.html" class="vb-nav__link ${activePage === 'feed' ? 'active' : ''}">
          <span class="icon">🏠</span><span class="label">Home</span>
        </a>
      </li>
      <li class="vb-nav__item">
        <a href="explore.html" class="vb-nav__link ${activePage === 'explore' ? 'active' : ''}">
          <span class="icon">🔍</span><span class="label">Explore</span>
        </a>
      </li>
      <li class="vb-nav__item">
        <a href="#" class="vb-nav__link" id="create-post-link">
          <span class="icon">➕</span><span class="label">Create</span>
        </a>
      </li>
      <li class="vb-nav__item">
        <a href="notifications.html" class="vb-nav__link ${activePage === 'notifications' ? 'active' : ''}">
          <span class="icon">🔔</span><span class="label">Notifications</span>
          <span class="vb-notif-badge" id="notif-badge"></span>
        </a>
      </li>
      <li class="vb-nav__item">
        <a href="profile.html?u=${user.username}" class="vb-nav__link ${activePage === 'profile' ? 'active' : ''}">
          <span class="icon">👤</span><span class="label">Profile</span>
        </a>
      </li>
    </ul>

    <div style="padding: 8px; margin-bottom: 8px;">
      <button class="theme-toggle" id="theme-toggle" title="Toggle dark mode">🌙</button>
    </div>

    <div class="vb-sidebar__user" onclick="window.location.href='profile.html?u=${user.username}'">
      <img src="${avatarSrc}" alt="${user.username}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=6c63ff&color=fff'"/>
      <div class="vb-sidebar__user-info">
        <div class="vb-sidebar__user-name">${user.full_name || user.username}</div>
        <div class="vb-sidebar__user-handle">@${user.username}</div>
      </div>
      <button onclick="event.stopPropagation(); doLogout()" title="Logout" style="background:none;border:none;color:rgba(255,255,255,0.4);font-size:1rem;cursor:pointer;">↩</button>
    </div>
  </aside>

  <!-- Mobile topbar -->
  <header class="vb-topbar">
    <button id="sidebar-toggle" style="background:none;border:none;font-size:1.4rem;cursor:pointer;">☰</button>
    <span class="vb-topbar__logo">Vibely</span>
    <a href="notifications.html" style="position:relative;font-size:1.3rem;">🔔
      <span class="vb-notif-badge" id="notif-badge-mobile" style="position:absolute;top:-4px;right:-4px;"></span>
    </a>
  </header>

  <!-- Mobile bottom nav -->
  <nav class="vb-mobile-nav">
    <a href="feed.html"     class="${activePage === 'feed'          ? 'active' : ''}"><span class="icon">🏠</span>Home</a>
    <a href="explore.html"  class="${activePage === 'explore'       ? 'active' : ''}"><span class="icon">🔍</span>Explore</a>
    <a href="#" id="mobile-create"><span class="icon">➕</span>Create</a>
    
  </nav>
  `;

  // Inject before main content
  document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

  // Sidebar mobile toggle
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });

  // Theme toggle
  applyTheme();
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

  // Create post links
  document.getElementById('create-post-link').addEventListener('click', (e) => {
    e.preventDefault();
    openCreateModal();
  });
  const mobileCreate = document.getElementById('mobile-create');
  if (mobileCreate) mobileCreate.addEventListener('click', (e) => { e.preventDefault(); openCreateModal(); });

  // Load notification count
  loadNotifCount();
}

async function loadNotifCount() {
  try {
    const { count } = await API.Users.notifCount();
    ['notif-badge', 'notif-badge-mobile'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.textContent    = count;
      el.style.display  = count > 0 ? 'flex' : 'none';
    });
  } catch { /* silently fail */ }
}

function applyTheme() {
  const theme = localStorage.getItem('vb_theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = localStorage.getItem('vb_theme') || 'light';
  const next    = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('vb_theme', next);
  applyTheme();
}

function doLogout() {
  Session.clear();
  window.location.href = 'login.html';
}

// ─── Create Post Modal ────────────────────────────────────────────────────────
function openCreateModal() {
  const existing = document.getElementById('create-modal-overlay');
  if (existing) { existing.classList.add('open'); return; }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id        = 'create-modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width:560px;">
      <div class="modal__header">
        <h3 class="modal__title">Create Post</h3>
        <button class="modal__close" id="close-create-modal">✕</button>
      </div>

      <div id="create-error" style="color:#e74c3c;font-size:.85rem;margin-bottom:10px;display:none;"></div>

      <div class="form-group">
        <textarea class="form-input" id="post-caption" rows="4" placeholder="What's on your mind?"></textarea>
      </div>

      <div class="image-preview-wrap" id="image-preview-wrap">
        <label class="image-upload-placeholder" for="post-image-input">
          <span class="icon">🖼️</span>
          <span>Click to add a photo</span>
          <span style="font-size:.75rem;color:var(--text-muted);">JPG, PNG, GIF • max 5 MB</span>
        </label>
        <input type="file" id="post-image-input" accept="image/*" style="display:none"/>
      </div>

      <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end;">
        <button class="btn btn-secondary" id="discard-post-btn">Discard</button>
        <button class="btn btn-primary" id="submit-post-btn">Post it 🚀</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('open'), 10);

  // Close handlers
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeCreateModal(); });
  document.getElementById('close-create-modal').addEventListener('click', closeCreateModal);
  document.getElementById('discard-post-btn').addEventListener('click', closeCreateModal);

  // Image preview
  const fileInput = document.getElementById('post-image-input');
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const wrap = document.getElementById('image-preview-wrap');
      wrap.innerHTML = `
        <img src="${ev.target.result}" alt="preview"/>
        <button class="image-remove-btn" id="remove-image-btn">✕</button>
      `;
      document.getElementById('remove-image-btn').addEventListener('click', () => {
        wrap.innerHTML = `
          <label class="image-upload-placeholder" for="post-image-input">
            <span class="icon">🖼️</span>
            <span>Click to add a photo</span>
          </label>
          <input type="file" id="post-image-input" accept="image/*" style="display:none"/>
        `;
        document.getElementById('post-image-input').addEventListener('change', arguments.callee);
      });
    };
    reader.readAsDataURL(file);
  });

  // Submit
  document.getElementById('submit-post-btn').addEventListener('click', submitPost);
}

function closeCreateModal() {
  const overlay = document.getElementById('create-modal-overlay');
  if (overlay) { overlay.classList.remove('open'); setTimeout(() => overlay.remove(), 200); }
}

async function submitPost() {
  const caption   = document.getElementById('post-caption')?.value.trim();
  const fileInput = document.getElementById('post-image-input');
  const file      = fileInput?.files?.[0];
  const btn       = document.getElementById('submit-post-btn');
  const errEl     = document.getElementById('create-error');

  if (!caption && !file) {
    errEl.textContent   = 'Add a caption or an image!';
    errEl.style.display = 'block';
    return;
  }
  errEl.style.display = 'none';
  btn.disabled    = true;
  btn.textContent = 'Posting…';

  try {
    const formData = new FormData();
    formData.append('caption', caption || '');
    if (file) formData.append('image', file);

    await API.Posts.create(formData);
    closeCreateModal();
    showToast('Post shared! 🎉');
    // Reload feed if on feed page
    if (typeof loadFeed === 'function') { feedPage = 1; loadFeed(true); }
  } catch (err) {
    errEl.textContent   = err.message;
    errEl.style.display = 'block';
    btn.disabled        = false;
    btn.textContent     = 'Post it 🚀';
  }
}

window.renderLayout  = renderLayout;
window.doLogout      = doLogout;
window.openCreateModal = openCreateModal;
window.loadNotifCount  = loadNotifCount;
