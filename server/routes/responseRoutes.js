const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, responseController.submitResponse);
router.get('/players', verifyToken, responseController.getPlayers);

module.exports = router;
