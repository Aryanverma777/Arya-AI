export default function TerminalLogs({ systemLogs }) {
  return (
    <div className="border border-slate-800 bg-slate-950/60 p-4">
      <p className="text-[10px] tracking-[0.2em] uppercase text-slate-500 mb-3">System log</p>
      <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {systemLogs.map((log, index) => (
          <li key={index} className="text-[11px] text-slate-500 border-l border-violet-500/40 pl-2 py-0.5 leading-snug">
            {log}
          </li>
        ))}
      </ul>
    </div>
  );
}