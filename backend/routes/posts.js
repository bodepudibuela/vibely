// backend/routes/posts.js
const express = require('express');
const router  = express.Router();
const upload  = require('../config/multer');
const { protect } = require('../middleware/auth');
const {
  createPost, getFeed, getExplore, getPost,
  getUserPosts, updatePost, deletePost,
} = require('../controllers/postController');

// Middleware to set upload folder for posts
const postUpload = (req, res, next) => {
  req.uploadFolder = 'posts';
  next();
};

// GET /api/posts/feed    — Home feed (protected, paginated)
router.get('/feed', protect, getFeed);

// GET /api/posts/explore — All posts (public, paginated)
router.get('/explore', protect, getExplore);

// GET /api/posts/user/:userId — Posts by a specific user
router.get('/user/:userId', protect, getUserPosts);

// POST /api/posts — Create a post (protected)
router.post('/', protect, postUpload, upload.single('image'), createPost);

// GET /api/posts/:id — Single post
router.get('/:id', protect, getPost);

// PUT /api/posts/:id — Edit caption (protected, own post only)
router.put('/:id', protect, updatePost);

// DELETE /api/posts/:id — Delete post (protected, own post only)
router.delete('/:id', protect, deletePost);

module.exports = router;
