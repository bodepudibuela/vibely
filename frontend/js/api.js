// frontend/js/api.js
// =============================================
//  VIBELY — Centralised API helper
// =============================================

const API_BASE = 'http://localhost:5000/api';

// ─── Token helpers ────────────────────────────────────────────────────────────
const getToken  = ()        => localStorage.getItem('vibely_token');
const setToken  = (t)       => localStorage.setItem('vibely_token', t);
const removeToken = ()      => localStorage.removeItem('vibely_token');

const getUser   = ()        => {
  try { return JSON.parse(localStorage.getItem('vibely_user')); } catch { return null; }
};
const setUser   = (u)       => localStorage.setItem('vibely_user', JSON.stringify(u));
const removeUser = ()       => localStorage.removeItem('vibely_user');

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };

  // Don't set Content-Type for FormData — browser does it automatically
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data.message || (data.errors && data.errors[0]) || `Error ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const Auth = {
  register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  me:       ()     => apiFetch('/auth/me'),
};

// ─── USERS ────────────────────────────────────────────────────────────────────
const Users = {
  getProfile:      (username) => apiFetch(`/users/${username}`),
  updateProfile:   (formData) => apiFetch('/users/profile', { method: 'PUT', body: formData }),
  follow:          (id)       => apiFetch(`/users/${id}/follow`, { method: 'POST' }),
  getFollowers:    (id)       => apiFetch(`/users/${id}/followers`),
  getFollowing:    (id)       => apiFetch(`/users/${id}/following`),
  search:          (q)        => apiFetch(`/users/search?q=${encodeURIComponent(q)}`),
  notifications:   ()         => apiFetch('/users/notifications'),
  notifCount:      ()         => apiFetch('/users/notifications/count'),
};

// ─── POSTS ────────────────────────────────────────────────────────────────────
const Posts = {
  feed:      (page = 1)     => apiFetch(`/posts/feed?page=${page}&limit=10`),
  explore:   (page = 1)     => apiFetch(`/posts/explore?page=${page}&limit=12`),
  userPosts: (userId, page = 1) => apiFetch(`/posts/user/${userId}?page=${page}&limit=12`),
  get:       (id)           => apiFetch(`/posts/${id}`),
  create:    (formData)     => apiFetch('/posts', { method: 'POST', body: formData }),
  update:    (id, body)     => apiFetch(`/posts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:    (id)           => apiFetch(`/posts/${id}`, { method: 'DELETE' }),
};

// ─── COMMENTS ─────────────────────────────────────────────────────────────────
const Comments = {
  get:    (postId)           => apiFetch(`/comments/${postId}`),
  add:    (postId, content)  => apiFetch(`/comments/${postId}`, { method: 'POST', body: JSON.stringify({ content }) }),
  delete: (commentId)        => apiFetch(`/comments/${commentId}`, { method: 'DELETE' }),
};

// ─── LIKES ────────────────────────────────────────────────────────────────────
const Likes = {
  toggle:    (postId) => apiFetch(`/likes/${postId}`, { method: 'POST' }),
  likedBy:   (postId) => apiFetch(`/likes/${postId}/users`),
};

// ─── Session helpers ──────────────────────────────────────────────────────────
function saveSession(token, user) {
  setToken(token);
  setUser(user);
}

function clearSession() {
  removeToken();
  removeUser();
}

function isLoggedIn() {
  return !!getToken() && !!getUser();
}

function requireAuth(redirectTo = '../pages/login.html') {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

function redirectIfAuth(redirectTo = '../pages/feed.html') {
  if (isLoggedIn()) {
    window.location.href = redirectTo;
    return true;
  }
  return false;
}

// Avatar URL helper
function avatarUrl(filename) {
  if (!filename || filename === 'default-avatar.png') {
    return `https://ui-avatars.com/api/?name=User&background=6c63ff&color=fff&size=128`;
  }
  if (filename.startsWith('http')) return filename;
  return `http://localhost:5000/uploads/avatars/${filename}`;
}

function postImageUrl(filename) {
  if (!filename) return null;
  return `http://localhost:5000/uploads/posts/${filename}`;
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)    return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)    return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)    return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)     return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// Expose globally
window.API        = { Auth, Users, Posts, Comments, Likes };
window.Session    = { save: saveSession, clear: clearSession, isLoggedIn, requireAuth, redirectIfAuth, getUser, setUser };
window.Helpers    = { avatarUrl, postImageUrl, timeAgo };
