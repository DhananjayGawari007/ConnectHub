const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', friendController.getFriends);
router.post('/request', friendController.sendFriendRequest);
router.get('/requests', friendController.getPendingRequests);
router.put('/request/:requestId/accept', friendController.acceptFriendRequest);
router.put('/request/:requestId/reject', friendController.rejectFriendRequest);
router.delete('/:friendId', friendController.removeFriend);

// C++ Graph traversals & queries
router.get('/graph/state', friendController.getGraphState);
router.get('/graph/bfs/:userId?', friendController.getBfsTraversal);
router.get('/graph/dfs/:userId?', friendController.getDfsTraversal);
router.get('/graph/mutual/:otherUserId', friendController.getMutualFriends);
router.get('/graph/suggestions', friendController.getFriendSuggestions);

module.exports = router;
