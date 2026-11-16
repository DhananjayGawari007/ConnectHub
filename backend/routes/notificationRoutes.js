const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.post('/', notificationController.createNotification);
router.post('/extract-max', notificationController.extractHighestPriority);
router.put('/:notificationId/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.get('/heap/state', notificationController.getHeapState);

module.exports = router;
