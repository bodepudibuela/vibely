// backend/routes/users.js
const express = require('express');
const router  = express.Router();
const upload  = require('../config/multer');
const { protect } = require('../middleware/auth');
const {
  getProfile, updateProfile, toggleFollow,
  getFollowers, getFollowing, searchUsers,
  getNotifications, getUnreadCount,
} = require('../controllers/userController');

// Middleware to set upload folder for avatars
const avatarUpload = (req, res, next) => {
  req.uploadFolder = 'avatars';
  next();
};

// GET /api/users/search?q=keyword — Search users (protected)
router.get('/search', protect, searchUsers);

// GET /api/users/notifications — Get notifications (protected)
router.get('/notifications', protect, getNotifications);

// GET /api/users/notifications/count — Unread count (protected)
router.get('/notifications/count', protect, getUnreadCount);

// PUT /api/users/profile — Update own profile (protected)
router.put('/profile', protect, avatarUpload, upload.single('avatar'), updateProfile);

// GET /api/users/:username — Get a user's public profile
router.get('/:username', protect, getProfile);

// POST /api/users/:id/follow — Follow/unfollow user (protected)
router.post('/:id/follow', protect, toggleFollow);

// GET /api/users/:id/followers — List followers
router.get('/:id/followers', protect, getFollowers);

// GET /api/users/:id/following — List following
router.get('/:id/following', protect, getFollowing);

module.exports = router;
