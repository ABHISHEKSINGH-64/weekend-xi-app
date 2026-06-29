const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.get('/active', verifyToken, matchController.getActiveMatch);
router.post('/', verifyToken, verifyAdmin, matchController.createMatch);
router.put('/active', verifyToken, verifyAdmin, matchController.editActiveMatch);
router.delete('/active', verifyToken, verifyAdmin, matchController.deleteActiveMatch);
router.post('/active/announcement', verifyToken, verifyAdmin, matchController.updateAnnouncement);
router.post('/active/reset', verifyToken, verifyAdmin, matchController.resetResponses);

module.exports = router;
