const express = require('express');
const router = express.Router();
const dsLabController = require('../controllers/dsLabController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/all', dsLabController.getAllStructures);
router.post('/execute', dsLabController.executeOperation);

module.exports = router;
