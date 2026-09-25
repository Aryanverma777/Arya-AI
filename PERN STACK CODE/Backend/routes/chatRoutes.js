const express = require('express');
const { streamOllamaChat } = require('../controllers/chatController.js');

const router = express.Router();

router.post('/stream', streamOllamaChat);

module.exports = router;