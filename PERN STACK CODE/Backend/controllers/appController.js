function connectApp(req, res) {
  res.status(501).json({ error: 'App connections are not implemented' });
}

function executeAppAction(req, res) {
  res.status(501).json({ error: 'App actions are not implemented' });
}

module.exports = { connectApp, executeAppAction };