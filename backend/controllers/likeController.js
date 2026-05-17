// backend/controllers/likeController.js
const pool = require('../config/db');

// ─── TOGGLE LIKE ──────────────────────────────────────────────────────────────
// POST /api/likes/:postId  (protected)
const toggleLike = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    // Check post exists
    const [post] = await pool.query('SELECT id, user_id FROM posts WHERE id = ?', [postId]);
    if (!post.length) return res.status(404).json({ success: false, message: 'Post not found.' });

    // Check existing like
    const [existing] = await pool.query(
      'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    if (existing.length) {
      // Unlike
      await pool.query('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);
      const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM likes WHERE post_id = ?', [postId]);
      return res.json({ success: true, liked: false, likes_count: count });
    } else {
      // Like
      await pool.query('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);

      // Notify post owner (if not self-liking)
      if (post[0].user_id !== userId) {
        await pool.query(
          'INSERT INTO notifications (user_id, actor_id, type, post_id) VALUES (?, ?, "like", ?)',
          [post[0].user_id, userId, postId]
        );
      }

      const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM likes WHERE post_id = ?', [postId]);
      return res.json({ success: true, liked: true, likes_count: count });
    }
  } catch (err) {
    next(err);
  }
};

// ─── GET USERS WHO LIKED POST ─────────────────────────────────────────────────
// GET /api/likes/:postId/users
const getLikedBy = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.full_name, u.avatar
       FROM likes l JOIN users u ON u.id = l.user_id
       WHERE l.post_id = ?
       ORDER BY l.created_at DESC
       LIMIT 50`,
      [req.params.postId]
    );
    res.json({ success: true, users: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { toggleLike, getLikedBy };
