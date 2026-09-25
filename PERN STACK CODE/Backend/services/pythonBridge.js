function executePythonTask(req, res) {
  res.status(501).json({ error: 'Python CrewAI bridge is not implemented' });
}

module.exports = { executePythonTask };