// src/hooks/useChatSession.js
import { useState, useCallback, useRef } from 'react';
import { createSession, fetchSessionMessages } from '../services/chatService';
import { ChatSessionContext } from "../context/ChatSessionContext";

export function useChatSession() {
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeAgentId, setActiveAgentId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const activeSessionIdRef = useRef(null);
  const sessionCreationRef = useRef(null);

  const addChatMessage = useCallback((message) => {
    setChatHistory((prev) => [...prev, message]);
  }, []);

  const selectSession = useCallback(async (sessionId) => {
    if (!sessionId || sessionId === activeSessionIdRef.current) return;

    activeSessionIdRef.current = sessionId;
    setActiveSessionId(sessionId);
    setLoading(true);

    try {
      const data = await fetchSessionMessages(sessionId);
      
      // Transform PostgreSQL records into UI format
      const formatted = (data.messages ?? []).map((msg) => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.content,
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      setChatHistory(formatted);
    } catch (err) {
      console.error('Error fetching session messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const ensureActiveSession = useCallback(async (sessionName = 'New Chat Session') => {
    if (activeSessionIdRef.current) {
      return { activeSessionId: activeSessionIdRef.current, createdSession: null };
    }

    if (!sessionCreationRef.current) {
      const title = sessionName.trim().slice(0, 255) || 'New Chat Session';
      sessionCreationRef.current = createSession(title)
        .then(({ session }) => {
          if (!session?.id) throw new Error('Created session did not include an ID');

          if (!activeSessionIdRef.current) {
            activeSessionIdRef.current = session.id;
            setActiveSessionId(session.id);
            return { activeSessionId: session.id, createdSession: session };
          }

          return { activeSessionId: activeSessionIdRef.current, createdSession: null };
        })
        .finally(() => {
          sessionCreationRef.current = null;
        });
    }

    return sessionCreationRef.current;
  }, []);

  return {
    activeSessionId,
    activeAgentId,
    setActiveAgentId,
    chatHistory,
    loading,
    selectSession,
    ensureActiveSession,
    addChatMessage
  };
}


export function ChatSessionProvider({ children }) {
  const chatSession = useChatSession();

  return (
    <ChatSessionContext.Provider value={chatSession}>
      {children}
    </ChatSessionContext.Provider>
  );
}