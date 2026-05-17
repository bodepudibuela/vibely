// backend/routes/comments.js
const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const { getComments, addComment, deleteComment } = require('../controllers/commentController');

// GET  /api/comments/:postId          — Get comments for a post (protected)
router.get('/:postId',         protect, getComments);

// POST /api/comments/:postId          — Add a comment (protected)
router.post('/:postId',        protect, addComment);

// DELETE /api/comments/:commentId     — Delete a comment (protected)
router.delete('/:commentId',   protect, deleteComment);

module.exports = router;
