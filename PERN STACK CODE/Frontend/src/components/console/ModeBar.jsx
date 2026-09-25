export default function ModeBar({ mode, modeStyles, listening }) {
  return (
    <div className={`border ${modeStyles[mode].border} bg-slate-950/60 p-4 ${modeStyles[mode].glow} transition-all duration-300`}>
      <p className="text-[10px] tracking-[0.2em] uppercase text-slate-500 mb-2">Status</p>
      <p className={`text-lg font-semibold ${modeStyles[mode].accent}`}>{modeStyles[mode].label}</p>
      <p className="text-[11px] text-slate-600 mt-1">mode: {mode}</p>

      <div className="h-px bg-slate-800 my-3" />
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 uppercase tracking-wide">Mic</span>
        <span className={listening ? 'text-emerald-400' : 'text-slate-600'}>
          {listening ? '● on' : '○ off'}
        </span>
      </div>
    </div>
  );
}