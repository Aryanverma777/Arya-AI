const express = require('express');
const { getAgentStatus, executeAgentTask } = require('../controllers/agentController.js');

const router = express.Router();

router.get('/status', getAgentStatus);
router.post('/execute', executeAgentTask);

module.exports = router;