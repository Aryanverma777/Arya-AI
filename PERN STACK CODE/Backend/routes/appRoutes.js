const express = require('express');
const { connectApp, executeAppAction } = require('../controllers/appController.js');

const router = express.Router();

router.post('/connect', connectApp);
router.post('/action', executeAppAction);

module.exports = router;