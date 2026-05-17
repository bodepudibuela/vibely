// backend/controllers/commentController.js
const pool   = require('../config/db');
const { validateComment } = require('../middleware/validate');

// ─── GET COMMENTS FOR POST ────────────────────────────────────────────────────
// GET /api/comments/:postId
const getComments = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.content, c.created_at,
              u.id AS user_id, u.username, u.avatar, u.full_name
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.postId]
    );
    res.json({ success: true, comments: rows });
  } catch (err) {
    next(err);
  }
};

// ─── ADD COMMENT ─────────────────────────────────────────────────────────────
// POST /api/comments/:postId  (protected)
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const postId      = req.params.postId;
    const userId      = req.user.id;

    const errors = validateComment({ content });
    if (errors.length) return res.status(400).json({ success: false, errors });

    // Make sure post exists
    const [post] = await pool.query('SELECT id, user_id FROM posts WHERE id = ?', [postId]);
    if (!post.length) return res.status(404).json({ success: false, message: 'Post not found.' });

    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content.trim()]
    );

    // Notify post owner (if not self-commenting)
    if (post[0].user_id !== userId) {
      await pool.query(
        'INSERT INTO notifications (user_id, actor_id, type, post_id) VALUES (?, ?, "comment", ?)',
        [post[0].user_id, userId, postId]
      );
    }

    const [comment] = await pool.query(
      `SELECT c.id, c.content, c.created_at,
              u.id AS user_id, u.username, u.avatar, u.full_name
       FROM comments c JOIN users u ON u.id = c.user_id
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, comment: comment[0] });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE COMMENT ───────────────────────────────────────────────────────────
// DELETE /api/comments/:commentId  (protected)
const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId        = req.user.id;

    const [rows] = await pool.query('SELECT * FROM comments WHERE id = ?', [commentId]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Comment not found.' });

    // Allow comment owner OR post owner to delete
    const [post] = await pool.query('SELECT user_id FROM posts WHERE id = ?', [rows[0].post_id]);
    const isCommentOwner = rows[0].user_id === userId;
    const isPostOwner    = post.length && post[0].user_id === userId;

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ success: false, message: 'Not authorised to delete this comment.' });
    }

    await pool.query('DELETE FROM comments WHERE id = ?', [commentId]);

    res.json({ success: true, message: 'Comment deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getComments, addComment, deleteComment };
