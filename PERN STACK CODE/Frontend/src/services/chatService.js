const BaseUrl = 'http://localhost:3000';

export async function streamChatResponse(prompt){
    const response = await fetch(`${BaseUrl}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'arya',
            messages: [{ role: 'user', content: prompt }],
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