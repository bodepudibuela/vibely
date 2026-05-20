// frontend/js/socket.js
// Real-time notifications via Socket.io

let socket = null;

function initSocket() {
  if (!window.Session.isLoggedIn()) return;
  const user = window.Session.getUser();

  // Load socket.io client from the server
  const script = document.createElement('script');
 script.src = 'https://vibely-7muu.onrender.com/socket.io/socket.io.js';
  script.onload = () => {
    socket = io('https://vibely-7muu.onrender.com');

    socket.on('connect', () => {
      socket.emit('user:online', user.id);
    });

    // Real-time notification badge update
    socket.on('notification:new', (notif) => {
      updateNotifBadge(1);
      showToast(`🔔 ${notif.message || 'New notification'}`, 'info');
    });

    socket.on('online:users', (userIds) => {
      // Can be used to show online status
      window._onlineUsers = userIds;
    });
  };
  document.head.appendChild(script);
}

function updateNotifBadge(delta) {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  const current = parseInt(badge.textContent) || 0;
  const next    = current + delta;
  badge.textContent = next;
  badge.style.display = next > 0 ? 'flex' : 'none';
}

// ─── Toast notifications ──────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  // Remove existing toasts
  document.querySelectorAll('.vb-toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `vb-toast vb-toast--${type}`;
  toast.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()">✕</button>`;
  document.body.appendChild(toast);

  // Auto-dismiss after 4 seconds
  setTimeout(() => toast?.remove(), 4000);
}

window.initSocket  = initSocket;
window.showToast   = showToast;
window.updateNotifBadge = updateNotifBadge;
