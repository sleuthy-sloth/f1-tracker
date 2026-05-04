export default function ArchiveLoading() {
  return (
    <div className="p-6 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-10 w-48 bg-white/[0.1] rounded-lg mb-2" />
        <div className="h-4 w-72 bg-white/[0.08] rounded" />
      </div>
      {/* GP Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-white/[0.05] rounded-xl" />
        ))}
      </div>
    </div>
  );
}