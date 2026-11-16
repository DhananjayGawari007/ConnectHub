const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', serverController.getUserServers);
router.post('/', serverController.createServer);
router.post('/join', serverController.joinServer);
router.get('/:serverId/hierarchy', serverController.getServerHierarchy);
router.get('/:serverId/members', serverController.getServerMembers);
router.post('/:serverId/categories', serverController.createCategory);
router.post('/:serverId/channels', serverController.createChannel);
router.put('/channels/:channelId/move', serverController.moveChannel);
router.delete('/channels/:channelId', serverController.deleteChannel);

module.exports = router;
