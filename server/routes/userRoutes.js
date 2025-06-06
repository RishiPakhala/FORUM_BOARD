const express = require('express');
const router = express.Router();
const { getUserContent, getLikedContent, getSavedItems } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

// Get user's content (threads and responses)
router.get('/:userId/content', auth, getUserContent);

// Get user's liked content
router.get('/:userId/liked-content', auth, getLikedContent);

// Add this route for fetching saved items
router.get('/saved', auth, getSavedItems);

module.exports = router; 