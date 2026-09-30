/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef, useCallback, use } from 'react';
import SpeechRecognition from 'react-speech-recognition';
import { puter } from '@heyputer/puter.js';
import useSpeechRecognition from './useSpeechRecognition';
import { fetchSessions, sendMessage, streamChatResponse } from '../services/chatService';
import { useChatSessionContext } from '../context/ChatSessionContext';
import axios from 'axios';
const BaseUrl = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000';

const SILENCE_TIMEOUT_MS = 2500;

export default function useVoiceAssistant() {
  const silenceTimer = useRef(null);
  const audioRef = useRef(null);
  const stopAudioResolverRef = useRef(null);
  const modeRef = useRef('waiting'); // avoids stale closures inside the transcript effect
  const wakeword = (import.meta.env.PUBLIC_WAKEWORD || 'arya').toLowerCase();
  const [mode, setMode] = useState('waiting'); // waiting | listening | searching | speaking | resting
  const [systemLogs, setSystemLogs] = useState(['Started Arya']);
  // const [chatHistory, setChatHistory] = useState([]); // keep history of chat interactions
  const [agentsList, setAgentsList] = useState([]); // keep track of agents
  const [sessions, setSessions] = useState([]);
  const {
    activeAgentId,
    setActiveAgentId,
    chatHistory,
    addChatMessage,
    ensureActiveSession,
  } = useChatSessionContext();

  const modeStyles = {
    waiting: { label: 'Waiting for wakeword', accent: 'text-amber-400', border: 'border-amber-400/50', glow: 'shadow-[0_0_20px_-4px_rgba(251,191,36,0.35)]', bar: 'bg-amber-400' },
    listening: { label: 'Listening', accent: 'text-emerald-400', border: 'border-emerald-400/50', glow: 'shadow-[0_0_20px_-4px_rgba(52,211,153,0.35)]', bar: 'bg-emerald-400' },
    searching: { label: 'Thinking', accent: 'text-violet-400', border: 'border-violet-400/50', glow: 'shadow-[0_0_20px_-4px_rgba(167,139,250,0.35)]', bar: 'bg-violet-400' },
    speaking: { label: 'Speaking', accent: 'text-rose-400', border: 'border-rose-400/50', glow: 'shadow-[0_0_20px_-4px_rgba(251,113,133,0.35)]', bar: 'bg-rose-400' },
    resting: { label: 'Resting', accent: 'text-slate-400', border: 'border-slate-600/50', glow: '', bar: 'bg-slate-500' },
  };

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // keep a ref in sync so timers/callbacks always see the latest mode
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  

  // helpers -----------------------------------------------------------------------------------

  const addLog = useCallback((message) => {
    setSystemLogs((prev) => [...prev, message]);
  }, []);

  // const addChatMessage = useCallback((message) => {
  //   setChatHistory((prev) => [...prev, message]);
  // }, []);

  const addAgent = useCallback((agent) => {
    setAgentsList((prev) => [...prev, agent]);
  }, []);

  const persistMessage = useCallback(async (sender, content) => {
    try {
      const sessionName = sender === 'user' ? content : undefined;
      const { activeSessionId: sessionId, createdSession } = await ensureActiveSession(sessionName);
      if (createdSession) {
        setSessions((currentSessions) => currentSessions.some(
          (session) => session.id === createdSession.id
        ) ? currentSessions : [createdSession, ...currentSessions]);
      }

      addChatMessage({
        sender,
        text: content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      await sendMessage({
        sessionId,
        agentId: activeAgentId,
        sender,
        content,
      });
    } catch (error) {
      console.error('Failed to save chat message:', error);
    }
  }, [activeAgentId, addChatMessage, ensureActiveSession]);

  // Forcefully stop playing audio AND unblock the speech Promise
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (stopAudioResolverRef.current) {
      stopAudioResolverRef.current();
      stopAudioResolverRef.current = null;
    }
  };

  // functions -------------------------------------------------------------------------------

  function AryaTalk() {
    stopAudio();
    addLog('Listening for wakeword...');
    setMode('waiting');
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  }

  function AryaStop() {
    addLog('Stopped');
    stopAudio();
    clearTimeout(silenceTimer.current);
    SpeechRecognition.stopListening();
    resetTranscript();
    setMode('resting');
  }

  async function AryaSpeak(sentence) {
    if (!sentence) {
      setMode('waiting');
      return;
    }

    try {
      stopAudio();
      SpeechRecognition.stopListening();

      setMode('searching');
      addLog(`Searching: "${sentence}"`);
      const answer = await streamChatResponse(sentence, chatHistory);

      setMode('speaking');
      addLog('Speaking response');
      // const audio = await puter.ai.txt2speech(answer, {
      //   provider: 'openai',
      //   model: 'gpt-4o-mini-tts',
      //   voice: 'nova',
      //   response_format: 'wav',
      //   instructions: 'Keep the delivery clear and friendly.',
      // });

      const audio = await puter.ai.txt2speech(answer, {
        provider: "openai",
        model: "gpt-4o-mini-tts",
        voice: "nova",
        response_format: "wav",
        instructions: "Keep the delivery clear and friendly.",
      });


      persistMessage('assistant', answer);

      // Turn mic on right before audio plays to capture barge-in wakewords
      SpeechRecognition.startListening({ continuous: true });
      audioRef.current = audio;

      // Wrap audio playback in an interruptible Promise
      await new Promise((resolve) => {
        stopAudioResolverRef.current = resolve;

        audio.onended = () => {
          audioRef.current = null;
          resolve();
        };

        audio.onerror = (err) => {
          console.error('Audio error:', err);
          audioRef.current = null;
          resolve();
        };

        audio.play().catch(() => resolve());
      });

    } catch (err) {
      console.error(err);
      addLog('Error while processing command');
    } finally {
      // Clean up resolver ref
      stopAudioResolverRef.current = null;
      resetTranscript();

      // FIX 1: Check modeRef.current (will be "listening" if interrupted)
      if (modeRef.current === 'speaking') {
        setMode('waiting');
        addLog('Listening for wakeword...');
      }

      SpeechRecognition.startListening({ continuous: true });
    }
  }

  // wakeword + command detection -------------------------------------------------------------

  useEffect(() => {
    const text = transcript.toLowerCase().trim();

    // BARGE-IN / INTERRUPTION CHECK
    if (mode === 'speaking' && text.includes(wakeword)) {
      addLog('⚡ Interrupted by user!');

      // FIX 2: Manually sync modeRef FIRST so finally block reads 'listening'
      modeRef.current = 'listening';
      setMode('listening');

      stopAudio(); // Halts audio & resolves Promise synchronously
      resetTranscript();
      return;
    }

    // Normal Wakeword Trigger
    if (mode === 'waiting' && text.includes(wakeword)) {
      addLog('🔥 Wakeword detected');
      stopAudio();
      modeRef.current = 'listening';
      setMode('listening');
      resetTranscript();
      return;
    }

    if (mode === 'listening') {
      clearTimeout(silenceTimer.current);

      silenceTimer.current = setTimeout(() => {
        if (modeRef.current !== 'listening') return;

        const sentence = transcript.trim();

        // FIX 3: Ignore empty transcripts immediately after an interruption reset
        if (sentence && sentence.toLowerCase() !== wakeword) {
          persistMessage('user', sentence);
          AryaSpeak(sentence);
        } else if (!sentence) {
          // Keep listening for a bit longer if user just interrupted without speaking a command yet
          addLog('Listening for command...');
        }
      }, SILENCE_TIMEOUT_MS);
    }

    return () => clearTimeout(silenceTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, mode]);

  // cleanup on unmount ------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      clearTimeout(silenceTimer.current);
      stopAudio();
      SpeechRecognition.stopListening();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    axios.get(BaseUrl + '/api/agents/status')
      .then(({ data }) => {
        const agents = data?.data?.rows;
        if (isMounted) {
          const availableAgents = Array.isArray(agents) ? agents : [];
          setAgentsList(availableAgents);
          setActiveAgentId((currentAgentId) => currentAgentId ?? availableAgents[0]?.id ?? null);
        }
      })
      .catch((error) => {
        console.error('Failed to load agents:', error);
      });

    return () => {
      isMounted = false;
    };
  }, [setActiveAgentId]);

  useEffect(() => {
    let isMounted = true;

    fetchSessions()
      .then((data) => {
        if (isMounted) setSessions(Array.isArray(data?.sessions) ? data.sessions : []);
      })
      .catch((error) => {
        console.error('Failed to load sessions:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    transcript,
    listening,
    mode,
    modeStyles,
    systemLogs,
    agentsList,
    // chatHistory,
    sessions,
    browserSupportsSpeechRecognition,
    AryaTalk,
    AryaStop,
  };
}