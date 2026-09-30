const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function streamChatResponse(prompt, chatHistory = []){
  const messages = [
    { role: 'system', content: 'You are ARYA, an intelligent local AI assistant.' },
    ...chatHistory
      .filter((message) => ['user', 'assistant', 'system'].includes(message.sender))
      .map((message) => ({
        role: message.sender,
        content: message.text ?? message.content,
      }))
      .filter((message) => typeof message.content === 'string' && message.content.trim()),
    { role: 'user', content: prompt },
  ];

    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'arya',
      messages,
        }),
    });

    if (!response.ok || !response.body) {
        throw new Error(`Chat request failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let answer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop();

        for (const event of events) {
            const line = event.split('\n').find((item) => item.startsWith('data: '));
            if (!line) continue;

            const payload = JSON.parse(line.slice(6));
            if (payload.error) throw new Error(payload.error);
            answer += payload.content ?? '';
        }
    }

    return answer;
}

// src/services/chatService.js


export const fetchSessions = async () => {
  const res = await fetch(`${API_BASE_URL}/api/chat/sessions`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
};

export const createSession = async (sessionName = 'New Chat Session') => {
  const res = await fetch(`${API_BASE_URL}/api/chat/createsession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionName }),
  });
  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
};

export const fetchSessionMessages = async (sessionId) => {
  const res = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}/messages`);
  if (!res.ok) throw new Error('Failed to fetch session messages');
  return res.json();
};

export const sendMessage = async ({ sessionId, agentId, sender, content }) => {
  const res = await fetch(`${API_BASE_URL}/api/chat/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, agentId, sender, content }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
};
