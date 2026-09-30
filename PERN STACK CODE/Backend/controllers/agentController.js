const {pool} = require('../config/db'); // Assuming you have a database connection module

async function getAgentStatus(req, res) {
  try{
    const agents = await pool.query(`SELECT * FROM agents;`);
    res.status(200).json({ success: true, data: agents }); 
  } catch (error) { 
    // Log the error internally for debugging, but keep the client message generic for security
    console.error('Database Error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve agent status' }); 
  } 
}



async function executeAgentTask(req, res) {
  try{
    // Implementation for executing agent task
  }catch (error) {
    res.status(500).json({ error: 'Failed to execute agent task' });
  }
}

module.exports = { getAgentStatus, executeAgentTask };