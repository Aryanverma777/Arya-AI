const express = require('express');
const { streamOllamaChat, sendMessage, getSessionMessages, getSessions, createSession } = require('../controllers/chatController.js');

const router = express.Router();

router.post('/stream', streamOllamaChat);
router.post('/message', sendMessage);
router.get('/sessions', getSessions);
router.get('/sessions/:sessionId/messages', getSessionMessages);
router.post('/createsession', createSession);

module.exports = router;