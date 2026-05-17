// backend/routes/likes.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { toggleLike, getLikedBy } = require('../controllers/likeController');

// POST /api/likes/:postId       — Like or unlike a post (protected)
router.post('/:postId',          protect, toggleLike);

// GET  /api/likes/:postId/users — Get users who liked a post (protected)
router.get('/:postId/users',     protect, getLikedBy);

module.exports = router;
