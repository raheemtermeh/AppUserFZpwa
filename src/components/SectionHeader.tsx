export default function SectionHeader({ 
  title, 
  actionLabel, 
  onAction 
}: { 
  title: string; 
  actionLabel?: string; 
  onAction?: () => void 
}) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-slate-700/50">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/30"></div>
        <div>
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
            {title}
          </h2>
          <div className="h-0.5 w-16 mt-1 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full"></div>
        </div>
      </div>
      {actionLabel && onAction && (
        <button 
          onClick={onAction} 
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm md:text-base text-slate-300 hover:text-white hover:border-cyan-400/50 hover:bg-slate-800/80 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
        >
          <span>{actionLabel}</span>
          {/* <span className="text-cyan-400 group-hover:translate-x-1 transition-transform">→</span> */}
        </button>
      )}
    </div>
  )
}



