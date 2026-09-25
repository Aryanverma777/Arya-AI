function executeBashTool(req, res) {
  res.status(501).json({ error: 'Bash tools are not implemented' });
}

function executeFileSystemTool(req, res) {
  res.status(501).json({ error: 'File-system tools are not implemented' });
}

module.exports = { executeBashTool, executeFileSystemTool };