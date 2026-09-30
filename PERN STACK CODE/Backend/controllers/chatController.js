const { pool } = require('../config/db');

const { streamOllamaChat } = require('../services/ollamaService.js');

const sendMessage = async (req, res) => {
  // Placeholder for sending a message to the database
  try {
    const { sessionId, agentId, sender, content, metadata } = req.body;
    const newMessage = await pool.query(
      'INSERT INTO commands_log (session_id, agent_id, sender, content, metadata) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [sessionId, agentId, sender, content, metadata]
    );
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Failed to send message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
}

const  getSessionMessages = async (req, res) => {
  // Placeholder for retrieving messages from the database based on sessionId
  const { sessionId } = req.params;
  try {
    const messages = await pool.query('SELECT * FROM commands_log WHERE session_id = $1', [sessionId]);
    res.status(200).json({ sessionId, messages: messages.rows });
  } catch (error) {
    console.error('Failed to retrieve session messages:', error);
    res.status(500).json({ error: 'Failed to retrieve session messages' });
  }
}

const getSessions = async (req, res) => {
  // Placeholder for retrieving sessions from the database
  try {
    const sessions = await pool.query(`SELECT * FROM sessions`);
    res.status(200).json({ sessions: sessions.rows });
  } catch (error) {
    console.error('Failed to retrieve sessions:', error);
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
}

const createSession = async (req, res) => {
  // Placeholder for creating a new session in the database
  const { sessionName } = req.body;
  try {
    const newSession = await pool.query(
      `INSERT INTO sessions (title)
       VALUES ($1) RETURNING *`
    , [sessionName]);
    res.status(200).json({ session: newSession.rows[0] });
  } catch (error) {
    console.error('Failed to create session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
}

module.exports = { streamOllamaChat, sendMessage, getSessionMessages, getSessions, createSession };