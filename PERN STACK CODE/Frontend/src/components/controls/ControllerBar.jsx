export default function ControllerBar({ onStart, onStop }) {
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={onStart}
        className="border border-emerald-500/60 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 active:scale-[0.98] font-semibold text-sm py-2.5 uppercase tracking-widest transition-all"
      >
        Start
      </button>
      <button
        onClick={onStop}
        className="border border-rose-500/60 text-rose-400 hover:bg-rose-500 hover:text-slate-950 active:scale-[0.98] font-semibold text-sm py-2.5 uppercase tracking-widest transition-all"
      >
        Stop
      </button>
    </div>
  );
}