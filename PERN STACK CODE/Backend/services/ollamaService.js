const OLLAMA_URL = 'http://localhost:11434';

async function streamOllamaChat(req, res) {
  const { messages, model = 'arya' } = req.body;

  if (!messages) {
    return res.status(400).json({ error: 'messages is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!ollamaRes.ok || !ollamaRes.body) {
      throw new Error(`Ollama request failed: ${ollamaRes.status}`);
    }

    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line for next chunk

      for (const line of lines) {
        if (!line.trim()) continue;

        const json = JSON.parse(line); // Ollama sends one JSON object per line
        const content = json.message?.content ?? '';
        const done = json.done ?? false;

        // Re-emit as SSE to the browser
        res.write(`data: ${JSON.stringify({ content, done })}\n\n`);

        if (done) {
          res.end();
          return;
        }
      }
    }

    res.end();
  } catch (err) {
    console.error(err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }

  req.on('close', () => {
    res.end();
  });
}

module.exports = { streamOllamaChat };