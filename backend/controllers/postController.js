// backend/controllers/postController.js
const pool   = require('../config/db');
const { validatePost } = require('../middleware/validate');
const fs     = require('fs');
const path   = require('path');

// ─── CREATE POST ─────────────────────────────────────────────────────────────
// POST /api/posts  (protected)
const createPost = async (req, res, next) => {
  try {
    const { caption } = req.body;
    const imageUrl    = req.file ? req.file.filename : null;
    const userId      = req.user.id;

    const errors = validatePost({ caption, hasFile: !!imageUrl });
    if (errors.length) return res.status(400).json({ success: false, errors });

    const [result] = await pool.query(
      'INSERT INTO posts (user_id, caption, image_url) VALUES (?, ?, ?)',
      [userId, caption || '', imageUrl]
    );

    const [post] = await pool.query(
      `SELECT p.*, u.username, u.avatar, u.full_name,
              0 AS likes_count, 0 AS comments_count, 0 AS is_liked
       FROM posts p JOIN users u ON u.id = p.user_id
       WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ success: true, message: 'Post created!', post: post[0] });
  } catch (err) {
    next(err);
  }
};

// ─── GET FEED (paginated) ────────────────────────────────────────────────────
// GET /api/posts/feed?page=1&limit=10  (protected)
const getFeed = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(20, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const [posts] = await pool.query(
      `SELECT 
        p.id, p.caption, p.image_url, p.created_at,
        u.id AS user_id, u.username, u.full_name, u.avatar,
        (SELECT COUNT(*) FROM likes     WHERE post_id = p.id)              AS likes_count,
        (SELECT COUNT(*) FROM comments  WHERE post_id = p.id)              AS comments_count,
        (SELECT COUNT(*) FROM likes     WHERE post_id = p.id AND user_id = ?) AS is_liked
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id = ?
          OR p.user_id IN (
               SELECT following_id FROM followers WHERE follower_id = ?
             )
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, userId, userId, limit, offset]
    );

    const [countRow] = await pool.query(
      `SELECT COUNT(*) AS total FROM posts p
       WHERE p.user_id = ?
          OR p.user_id IN (SELECT following_id FROM followers WHERE follower_id = ?)`,
      [userId, userId]
    );

    res.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total:      countRow[0].total,
        totalPages: Math.ceil(countRow[0].total / limit),
        hasMore:    page * limit < countRow[0].total,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET EXPLORE (all posts) ─────────────────────────────────────────────────
// GET /api/posts/explore?page=1
const getExplore = async (req, res, next) => {
  try {
    const userId = req.user?.id || 0;
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(20, parseInt(req.query.limit) || 12);
    const offset = (page - 1) * limit;

    const [posts] = await pool.query(
      `SELECT 
        p.id, p.caption, p.image_url, p.created_at,
        u.id AS user_id, u.username, u.full_name, u.avatar,
        (SELECT COUNT(*) FROM likes    WHERE post_id = p.id)               AS likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id)               AS comments_count,
        (SELECT COUNT(*) FROM likes    WHERE post_id = p.id AND user_id = ?) AS is_liked
       FROM posts p JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM posts');

    res.json({
      success: true,
      posts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: page * limit < total },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET SINGLE POST ─────────────────────────────────────────────────────────
// GET /api/posts/:id
const getPost = async (req, res, next) => {
  try {
    const userId = req.user?.id || 0;
    const [rows] = await pool.query(
      `SELECT 
        p.id, p.caption, p.image_url, p.created_at,
        u.id AS user_id, u.username, u.full_name, u.avatar,
        (SELECT COUNT(*) FROM likes    WHERE post_id = p.id)               AS likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id)               AS comments_count,
        (SELECT COUNT(*) FROM likes    WHERE post_id = p.id AND user_id = ?) AS is_liked
       FROM posts p JOIN users u ON u.id = p.user_id
       WHERE p.id = ?`,
      [userId, req.params.id]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'Post not found.' });

    res.json({ success: true, post: rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── GET USER POSTS ───────────────────────────────────────────────────────────
// GET /api/posts/user/:userId
const getUserPosts = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id || 0;
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 12);
    const offset = (page - 1) * limit;

    const [posts] = await pool.query(
      `SELECT 
        p.id, p.caption, p.image_url, p.created_at,
        u.id AS user_id, u.username, u.full_name, u.avatar,
        (SELECT COUNT(*) FROM likes    WHERE post_id = p.id)                         AS likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id)                         AS comments_count,
        (SELECT COUNT(*) FROM likes    WHERE post_id = p.id AND user_id = ?)         AS is_liked
       FROM posts p JOIN users u ON u.id = p.user_id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [currentUserId, req.params.userId, limit, offset]
    );

    res.json({ success: true, posts });
  } catch (err) {
    next(err);
  }
};

// ─── EDIT POST ────────────────────────────────────────────────────────────────
// PUT /api/posts/:id  (protected)
const updatePost = async (req, res, next) => {
  try {
    const { caption } = req.body;
    const postId = req.params.id;
    const userId = req.user.id;

    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (rows[0].user_id !== userId)
      return res.status(403).json({ success: false, message: 'Not authorised to edit this post.' });

    await pool.query('UPDATE posts SET caption = ? WHERE id = ?', [caption, postId]);

    res.json({ success: true, message: 'Post updated!' });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE POST ─────────────────────────────────────────────────────────────
// DELETE /api/posts/:id  (protected)
const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const [rows] = await pool.query('SELECT * FROM posts WHERE id = ?', [postId]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Post not found.' });
    if (rows[0].user_id !== userId)
      return res.status(403).json({ success: false, message: 'Not authorised to delete this post.' });

    // Delete image file if it exists
    if (rows[0].image_url) {
      const imgPath = path.join(__dirname, `../uploads/posts/${rows[0].image_url}`);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await pool.query('DELETE FROM posts WHERE id = ?', [postId]);

    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createPost, getFeed, getExplore, getPost, getUserPosts, updatePost, deletePost };
