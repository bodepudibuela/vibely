// frontend/js/posts.js
// Renders post cards and handles likes/comments interactions

function renderPosts(posts, containerId, append = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!append) container.innerHTML = '';

  if (!posts.length && !append) return;

  posts.forEach(post => {
    container.insertAdjacentHTML('beforeend', buildPostCard(post));
  });

  // Attach event listeners to newly added cards
  attachPostEvents(container);
}

function buildPostCard(post) {
  const me       = Session.getUser();
  const isOwner  = me && post.user_id === me.id;
  const avatarSrc = Helpers.avatarUrl(post.avatar);
  const imgHtml   = post.image_url
    ? `<img class="post-card__image" src="${Helpers.postImageUrl(post.image_url)}" alt="post image" loading="lazy"/>`
    : '';

  return `
  <article class="post-card ${!post.image_url ? 'post-card--no-image' : ''}" data-post-id="${post.id}" data-owner-id="${post.user_id}">
    <div class="post-card__header">
      <a href="profile.html?u=${post.username}">
        <img class="post-card__avatar avatar-md"
             src="${avatarSrc}"
             alt="${post.username}"
             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(post.username)}&background=FF6B35&color=fff'"/>
      </a>
      <div class="post-card__user-info">
        <a href="profile.html?u=${post.username}" class="post-card__username">
          ${post.full_name || post.username}
          <span style="font-weight:400;color:var(--text-muted);font-size:.82rem;"> @${post.username}</span>
        </a>
        <div class="post-card__time">${Helpers.timeAgo(post.created_at)}</div>
      </div>
      ${isOwner ? `
      <div class="post-card__menu">
        <button class="post-card__menu-btn post-menu-trigger" data-post-id="${post.id}">⋯</button>
        <div class="dropdown-menu post-dropdown" id="menu-${post.id}">
          <span class="dropdown-item edit-post-btn" data-post-id="${post.id}" data-caption="${encodeURIComponent(post.caption || '')}">✏️ Edit caption</span>
          <span class="dropdown-item dropdown-item--danger delete-post-btn" data-post-id="${post.id}">🗑️ Delete post</span>
        </div>
      </div>` : ''}
    </div>

    ${imgHtml}

    ${post.caption ? `<div class="post-card__body"><p class="post-card__caption">${escapeHtml(post.caption)}</p></div>` : ''}

    <div class="post-card__actions">
      <button class="post-action-btn like-btn ${post.is_liked ? 'liked' : ''}"
              data-post-id="${post.id}" data-liked="${post.is_liked ? '1' : '0'}">
        <span class="icon">${post.is_liked ? '❤️' : '🤍'}</span>
        <span class="like-count">${post.likes_count}</span>
      </button>
      <button class="post-action-btn comment-toggle-btn" data-post-id="${post.id}">
        <span class="icon">💬</span>
        <span class="comment-count">${post.comments_count}</span>
      </button>
      <button class="post-action-btn share-btn" data-post-id="${post.id}">
        <span class="icon">↗️</span>
        <span>Share</span>
      </button>
    </div>

    <!-- Comments section (collapsed by default) -->
    <div class="comments-section" id="comments-${post.id}" style="display:none">
      <div class="comments-list" id="comments-list-${post.id}">
        <div class="spinner" style="margin:10px auto;width:24px;height:24px;border-width:2px;"></div>
      </div>
      <form class="comment-form" onsubmit="submitComment(event, ${post.id})">
        <img class="avatar avatar-sm"
             src="${Helpers.avatarUrl(me?.avatar)}"
             alt="me"
             onerror="this.src='https://ui-avatars.com/api/?name=U&background=6c63ff&color=fff'"/>
        <input class="comment-form__input" placeholder="Add a comment…" name="comment" autocomplete="off"/>
        <button class="comment-form__btn" type="submit">Post</button>
      </form>
    </div>
  </article>
  `;
}

function attachPostEvents(container) {
  // Like buttons
  container.querySelectorAll('.like-btn').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', async () => {
      const postId = btn.dataset.postId;
      const liked  = btn.dataset.liked === '1';
      // Optimistic UI
      btn.dataset.liked = liked ? '0' : '1';
      btn.classList.toggle('liked', !liked);
      btn.querySelector('.icon').textContent = !liked ? '❤️' : '🤍';
      const countEl = btn.querySelector('.like-count');
      countEl.textContent = parseInt(countEl.textContent) + (!liked ? 1 : -1);

      try {
        const data = await API.Likes.toggle(postId);
        countEl.textContent = data.likes_count;
        btn.dataset.liked   = data.liked ? '1' : '0';
        btn.classList.toggle('liked', data.liked);
        btn.querySelector('.icon').textContent = data.liked ? '❤️' : '🤍';
      } catch (err) {
        // Revert on error
        btn.dataset.liked = liked ? '1' : '0';
        btn.classList.toggle('liked', liked);
        btn.querySelector('.icon').textContent = liked ? '❤️' : '🤍';
        countEl.textContent = parseInt(countEl.textContent) + (liked ? 1 : -1);
        showToast(err.message, 'error');
      }
    });
  });

  // Comment toggle
  container.querySelectorAll('.comment-toggle-btn').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      const postId  = btn.dataset.postId;
      const section = document.getElementById(`comments-${postId}`);
      const isOpen  = section.style.display !== 'none';
      section.style.display = isOpen ? 'none' : 'block';
      if (!isOpen) loadComments(postId);
    });
  });

  // Post menu (3 dots)
  container.querySelectorAll('.post-menu-trigger').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = document.getElementById(`menu-${btn.dataset.postId}`);
      document.querySelectorAll('.dropdown-menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
      menu.classList.toggle('open');
    });
  });

  // Edit post
  container.querySelectorAll('.edit-post-btn').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      const postId  = btn.dataset.postId;
      const caption = decodeURIComponent(btn.dataset.caption);
      openEditModal(postId, caption);
      document.getElementById(`menu-${postId}`)?.classList.remove('open');
    });
  });

  // Delete post
  container.querySelectorAll('.delete-post-btn').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', async () => {
      const postId = btn.dataset.postId;
      document.getElementById(`menu-${postId}`)?.classList.remove('open');
      if (!confirm('Delete this post? This cannot be undone.')) return;
      try {
        await API.Posts.delete(postId);
        document.querySelector(`[data-post-id="${postId}"].post-card`)?.remove();
        showToast('Post deleted.');
      } catch (err) { showToast(err.message, 'error'); }
    });
  });

  // Share
  container.querySelectorAll('.share-btn').forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      const url = `${window.location.origin}/pages/post.html?id=${btn.dataset.postId}`;
      if (navigator.share) {
        navigator.share({ title: 'Vibely post', url });
      } else {
        navigator.clipboard.writeText(url).then(() => showToast('Link copied!'));
      }
    });
  });

  // Close menus on outside click
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
  });
}

async function loadComments(postId) {
  const listEl = document.getElementById(`comments-list-${postId}`);
  if (!listEl) return;
  try {
    const data = await API.Comments.get(postId);
    renderComments(data.comments, postId);
  } catch (err) {
    listEl.innerHTML = `<p style="color:var(--text-muted);font-size:.85rem;padding:8px;">Could not load comments.</p>`;
  }
}

function renderComments(comments, postId) {
  const listEl = document.getElementById(`comments-list-${postId}`);
  if (!listEl) return;
  const me = Session.getUser();
  if (!comments.length) {
    listEl.innerHTML = `<p style="color:var(--text-muted);font-size:.82rem;padding:8px 0;">Be the first to comment!</p>`;
    return;
  }
  listEl.innerHTML = comments.map(c => {
    const canDelete = me && (c.user_id === me.id);
    return `
    <div class="comment-item" id="comment-${c.id}">
      <a href="profile.html?u=${c.username}">
        <img class="comment-item__avatar" src="${Helpers.avatarUrl(c.avatar)}" alt="${c.username}"
             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.username)}&background=6c63ff&color=fff'"/>
      </a>
      <div class="comment-item__bubble">
        <a href="profile.html?u=${c.username}" class="comment-item__user">${c.username}</a>
        <div class="comment-item__text">${escapeHtml(c.content)}</div>
        <div class="comment-item__meta">
          <span class="comment-item__time">${Helpers.timeAgo(c.created_at)}</span>
          ${canDelete ? `<button class="comment-delete-btn" onclick="deleteComment(${c.id}, ${postId})">Delete</button>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

async function submitComment(e, postId) {
  e.preventDefault();
  const form    = e.target;
  const input   = form.querySelector('input[name="comment"]');
  const content = input.value.trim();
  if (!content) return;
  input.value   = '';

  try {
    const data = await API.Comments.add(postId, content);
    const listEl = document.getElementById(`comments-list-${postId}`);
    const me     = Session.getUser();

    // Append new comment
    const el = document.createElement('div');
    el.className = 'comment-item';
    el.id        = `comment-${data.comment.id}`;
    el.innerHTML = `
      <img class="comment-item__avatar" src="${Helpers.avatarUrl(me.avatar)}" alt="${me.username}"
           onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(me.username)}&background=6c63ff&color=fff'"/>
      <div class="comment-item__bubble">
        <span class="comment-item__user">${me.username}</span>
        <div class="comment-item__text">${escapeHtml(content)}</div>
        <div class="comment-item__meta">
          <span class="comment-item__time">just now</span>
          <button class="comment-delete-btn" onclick="deleteComment(${data.comment.id}, ${postId})">Delete</button>
        </div>
      </div>`;
    listEl?.appendChild(el);

    // Update count
    const card = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    const countEl = card?.querySelector('.comment-count');
    if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;

    listEl?.scrollTo(0, listEl.scrollHeight);
  } catch (err) { showToast(err.message, 'error'); }
}

async function deleteComment(commentId, postId) {
  if (!confirm('Delete this comment?')) return;
  try {
    await API.Comments.delete(commentId);
    document.getElementById(`comment-${commentId}`)?.remove();
    const card    = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    const countEl = card?.querySelector('.comment-count');
    if (countEl) countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1);
  } catch (err) { showToast(err.message, 'error'); }
}

function openEditModal(postId, currentCaption) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id        = `edit-modal-${postId}`;
  overlay.innerHTML = `
    <div class="modal" style="max-width:460px;">
      <div class="modal__header">
        <h3 class="modal__title">Edit Caption</h3>
        <button class="modal__close" onclick="document.getElementById('edit-modal-${postId}').remove()">✕</button>
      </div>
      <div class="form-group">
        <textarea class="form-input" id="edit-caption-${postId}" rows="4">${currentCaption}</textarea>
      </div>
      <div style="display:flex;gap:10px;justify-content:flex-end;">
        <button class="btn btn-secondary" onclick="document.getElementById('edit-modal-${postId}').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="saveEdit(${postId})">Save</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.classList.add('open'), 10);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

async function saveEdit(postId) {
  const caption = document.getElementById(`edit-caption-${postId}`)?.value.trim();
  try {
    await API.Posts.update(postId, { caption });
    // Update displayed caption
    const card = document.querySelector(`.post-card[data-post-id="${postId}"]`);
    const captionEl = card?.querySelector('.post-card__caption');
    if (captionEl) captionEl.textContent = caption;
    document.getElementById(`edit-modal-${postId}`)?.remove();
    showToast('Caption updated!');
  } catch (err) { showToast(err.message, 'error'); }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

window.renderPosts     = renderPosts;
window.submitComment   = submitComment;
window.deleteComment   = deleteComment;
window.loadComments    = loadComments;
window.openEditModal   = openEditModal;
window.saveEdit        = saveEdit;
