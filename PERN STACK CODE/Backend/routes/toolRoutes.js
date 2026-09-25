const express = require('express');
const { executeBashTool, executeFileSystemTool } = require('../controllers/toolController.js');

const router = express.Router();

router.post('/bash', executeBashTool);
router.post('/fs', executeFileSystemTool);

module.exports = router;