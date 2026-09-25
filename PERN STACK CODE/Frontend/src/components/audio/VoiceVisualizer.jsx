export default function VoiceVisualizer({ transcript, mode, modeStyles }) {
  return (
    <div className="border border-slate-800 bg-slate-950/60 p-5 min-h-[280px] flex flex-col">
      <p className="text-[10px] tracking-[0.2em] uppercase text-slate-500 mb-3">Transcript</p>
      <div className="flex-1 flex items-start">
        <p className="text-slate-200 text-lg leading-relaxed">
          {transcript || <span className="text-slate-700 italic">— awaiting input —</span>}
        </p>
      </div>
      <div className="h-1 bg-slate-800 mt-4 overflow-hidden">
        <div className={`h-full w-1/3 ${modeStyles[mode].bar} ${mode !== 'resting' ? 'animate-pulse' : ''} transition-all duration-500`} />
      </div>
    </div>
  );
}