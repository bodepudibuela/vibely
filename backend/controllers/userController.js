// backend/controllers/userController.js
const pool   = require('../config/db');

// ─── GET USER PROFILE ────────────────────────────────────────────────────────
// GET /api/users/:username
const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id || 0;

    const [rows] = await pool.query(
      `SELECT 
        u.id, u.username, u.full_name, u.bio, u.avatar, u.website, u.created_at,
        (SELECT COUNT(*) FROM followers WHERE following_id = u.id) AS followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id  = u.id) AS following_count,
        (SELECT COUNT(*) FROM posts WHERE user_id = u.id)          AS posts_count,
        (SELECT COUNT(*) FROM followers 
          WHERE follower_id = ? AND following_id = u.id)           AS is_following
      FROM users u
      WHERE u.username = ?`,
      [currentUserId, username]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── UPDATE PROFILE ──────────────────────────────────────────────────────────
// PUT /api/users/profile  (protected)
const updateProfile = async (req, res, next) => {
  try {
    const { full_name, bio, website } = req.body;
    const userId = req.user.id;
    const avatar = req.file ? req.file.filename : null;

    let query  = 'UPDATE users SET full_name = ?, bio = ?, website = ?';
    let params = [full_name || '', bio || '', website || ''];

    if (avatar) {
      query  += ', avatar = ?';
      params.push(avatar);
    }

    query  += ' WHERE id = ?';
    params.push(userId);

    await pool.query(query, params);

    const [rows] = await pool.query(
      'SELECT id, username, email, full_name, bio, avatar, website FROM users WHERE id = ?',
      [userId]
    );

    res.json({ success: true, message: 'Profile updated!', user: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── FOLLOW / UNFOLLOW ───────────────────────────────────────────────────────
// POST /api/users/:id/follow  (protected)
const toggleFollow = async (req, res, next) => {
  try {
    const followingId = parseInt(req.params.id);
    const followerId  = req.user.id;

    if (followingId === followerId) {
      return res.status(400).json({ success: false, message: "You can't follow yourself." });
    }

    // Check target user exists
    const [target] = await pool.query('SELECT id, username FROM users WHERE id = ?', [followingId]);
    if (!target.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Check existing follow
    const [existing] = await pool.query(
      'SELECT id FROM followers WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]
    );

    if (existing.length) {
      // Unfollow
      await pool.query(
        'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
        [followerId, followingId]
      );
      return res.json({ success: true, following: false, message: 'Unfollowed.' });
    } else {
      // Follow
      await pool.query(
        'INSERT INTO followers (follower_id, following_id) VALUES (?, ?)',
        [followerId, followingId]
      );

      // Create notification
      await pool.query(
        'INSERT INTO notifications (user_id, actor_id, type) VALUES (?, ?, "follow")',
        [followingId, followerId]
      );

      return res.json({ success: true, following: true, message: `Following ${target[0].username}!` });
    }
  } catch (err) {
    next(err);
  }
};

// ─── GET FOLLOWERS ───────────────────────────────────────────────────────────
// GET /api/users/:id/followers
const getFollowers = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.avatar
       FROM followers f
       JOIN users u ON u.id = f.follower_id
       WHERE f.following_id = ?
       ORDER BY f.created_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, followers: rows });
  } catch (err) {
    next(err);
  }
};

// ─── GET FOLLOWING ───────────────────────────────────────────────────────────
// GET /api/users/:id/following
const getFollowing = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.avatar
       FROM followers f
       JOIN users u ON u.id = f.following_id
       WHERE f.follower_id = ?
       ORDER BY f.created_at DESC`,
      [req.params.id]
    );
    res.json({ success: true, following: rows });
  } catch (err) {
    next(err);
  }
};

// ─── SEARCH USERS ────────────────────────────────────────────────────────────
// GET /api/users/search?q=keyword
const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.json({ success: true, users: [] });
    }
    const keyword = `%${q.trim()}%`;
    const [rows] = await pool.query(
      `SELECT id, username, full_name, avatar
       FROM users
       WHERE username LIKE ? OR full_name LIKE ?
       LIMIT 20`,
      [keyword, keyword]
    );
    res.json({ success: true, users: rows });
  } catch (err) {
    next(err);
  }
};

// ─── GET NOTIFICATIONS ───────────────────────────────────────────────────────
// GET /api/users/notifications  (protected)
const getNotifications = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT n.*, u.username AS actor_username, u.avatar AS actor_avatar,
              u.full_name AS actor_name
       FROM notifications n
       JOIN users u ON u.id = n.actor_id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    // Mark all as read
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ success: true, notifications: rows });
  } catch (err) {
    next(err);
  }
};

// ─── GET UNREAD NOTIFICATION COUNT ──────────────────────────────────────────
// GET /api/users/notifications/count  (protected)
const getUnreadCount = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.json({ success: true, count: rows[0].count });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile, updateProfile, toggleFollow, getFollowers,
  getFollowing, searchUsers, getNotifications, getUnreadCount,
};
