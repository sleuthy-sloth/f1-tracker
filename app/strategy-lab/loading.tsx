export default function StrategyLabLoading() {
  return (
    <div className="min-h-screen bg-f1-carbon flex flex-col animate-pulse">
      {/* Header */}
      <div className="h-16 bg-white/[0.03] border-b border-white/[0.07] flex items-center px-6">
        <div className="h-6 w-40 bg-white/[0.1] rounded" />
      </div>
      {/* Map + Side panel */}
      <div className="flex-1 flex">
        <div className="flex-1 bg-white/[0.02] m-4 rounded-xl" />
        <div className="w-96 bg-white/[0.02] m-4 mr-4 rounded-xl" />
      </div>
    </div>
  );
}