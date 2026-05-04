export default function StandingsLoading() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-10 w-56 bg-white/[0.1] rounded-lg mb-2" />
      <div className="h-4 w-64 bg-white/[0.08] rounded mb-8" />
      {/* Year selector pills */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-16 bg-white/[0.08] rounded-full" />
        ))}
      </div>
      {/* DataCard row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-white/[0.05] rounded-xl" />
        ))}
      </div>
      {/* Table rows */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 bg-white/[0.03] rounded-lg" />
        ))}
      </div>
    </div>
  );
}