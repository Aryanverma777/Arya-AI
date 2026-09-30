import { useChatSessionContext } from "../../context/ChatSessionContext";

function SessionBar({ sessions = [] }) {
  const { activeSessionId, selectSession } = useChatSessionContext();

  return ( 
    <div>
      <div className="sticky top-0 z-20 border-b border-slate-800 bg-[#111114] p-4 md:h-screen md:overflow-y-auto md:border-b-0 md:border-r">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Sessions
        </p>
        <ul className="grid grid-cols-1 gap-3">
          {sessions.map((session, index) => {
            const id = session.id ?? index;
            const isActive = activeSessionId === id;

            return (
              <button 
                key={id} 
                onClick={() => selectSession?.(id)}
                className={`w-full rounded-md border p-3 text-sm transition-colors ${
                  isActive 
                    ? 'border-cyan-500/50 bg-slate-900 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                    : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <span className="w-full truncate">{session.title || session.name || `Session ${index + 1}`}</span>
                </span>
              </button>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default SessionBar;

// function SessionBar(sessions) {
//     return ( 
//         <div>
//             <div className="sticky top-0 z-20 border-b border-slate-800 bg-[#111114] p-4 md:h-screen md:overflow-y-auto md:border-b-0 md:border-r">
//                 <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Sessions</p>
//                 <ul className="grid grid-cols-2 gap-3">
//                     {sessions.map((session, index) => (
//                         <button key={session.id ?? index}   className="aspect-square w-full rounded-md border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300 transition-colors hover:bg-slate-900 hover:text-white">
//                             <span className="flex h-full flex-col items-center justify-center gap-3 text-center">
//                                 <span className="w-full truncate">{session.name}</span>
//                             </span>
//                         </button>
//                     ))}
//                 </ul>
//             </div>
//         </div>
//     );
// }

// export default SessionBar;