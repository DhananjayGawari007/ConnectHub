const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Channel messages
router.post('/channel/:channelId', messageController.sendChannelMessage);
router.get('/channel/:channelId', messageController.getChannelMessages);

// Direct messages
router.post('/direct/:receiverId', messageController.sendDirectMessage);
router.get('/direct/:otherUserId', messageController.getDirectMessages);

// Edit & delete
router.put('/:messageId', messageController.editMessage);
router.delete('/:messageId', messageController.deleteMessage);

// C++ Queue inspect & dequeue
router.get('/queue/state', messageController.getQueueState);
router.post('/queue/dequeue', messageController.processNextMessage);

module.exports = router;
