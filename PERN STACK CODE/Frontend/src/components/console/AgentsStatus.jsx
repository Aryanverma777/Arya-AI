function AgentsStatus({ agentsList = [] }) {
    return (
        <div className="sticky top-0 z-20 border-b border-slate-800 bg-[#111114] p-4 md:h-screen md:overflow-y-auto md:border-b-0 md:border-r">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Agents</p>
            <ul className="grid grid-cols-2 gap-3">
                {agentsList.map((agent, index) => (
                    <li key={agent.id ?? index} className="aspect-square w-full rounded-md border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300 transition-colors hover:bg-slate-900 hover:text-white">
                        <span className="flex h-full flex-col items-center justify-center gap-3 text-center">
                            <img className="h-16 w-16 rounded-md bg-slate-800 object-cover" src={agent.image} alt={agent.name} />
                            <span className="w-full truncate">{agent.name}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AgentsStatus;