import ChatFeed from '../components/console/ChatFeed';
import ModeBar from '../components/console/ModeBar';
import TerminalLogs from '../components/console/TerminalLogs';
import VoiceVisualizer from '../components/audio/VoiceVisualizer';
import ControllerBar from '../components/controls/ControllerBar';
import useVoiceAssistant from '../hooks/useVoiceAssistant';

const Dashboard = () => {
  const {
    transcript,
    listening,
    mode,
    modeStyles,
    systemLogs,
    chatHistory,
    browserSupportsSpeechRecognition,
    AryaTalk,
    AryaStop,
  } = useVoiceAssistant();

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 font-mono relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04] mix-blend-screen"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 p-4 md:p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between border border-slate-800 px-4 py-3 mb-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className={`h-2 w-2 ${modeStyles[mode].bar} ${listening ? 'animate-pulse' : ''}`} />
            <span className="text-xs tracking-[0.25em] uppercase text-slate-500">Arya // Console</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] tracking-widest uppercase text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Models running
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr_260px] gap-4">
          <div className="flex flex-col gap-4">
            <ModeBar mode={mode} modeStyles={modeStyles} listening={listening} />
            <ControllerBar onStart={AryaTalk} onStop={AryaStop} />
          </div>

          <VoiceVisualizer transcript={transcript} mode={mode} modeStyles={modeStyles} />
          <TerminalLogs systemLogs={systemLogs} />
        </div>

        <ChatFeed chatHistory={chatHistory} />
      </div>
    </div>
  );
};

export default Dashboard;