const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/login', authController.playerLogin);
router.post('/admin/login', authController.adminLogin);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
