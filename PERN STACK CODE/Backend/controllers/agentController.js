function getAgentStatus(req, res) {
  res.status(501).json({ error: 'Agent orchestration is not implemented' });
}

function executeAgentTask(req, res) {
  res.status(501).json({ error: 'Agent execution is not implemented' });
}

module.exports = { getAgentStatus, executeAgentTask };