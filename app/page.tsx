import { HeroDashboard } from "@/components/HeroDashboard";

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-surface-dim overflow-hidden flex flex-col items-center justify-center py-6 md:py-12">
      {/* Background Grid Layer - subtle & consistent with app */}
      <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
      
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-f1-red/5 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] translate-y-1/2 -translate-x-1/2 rounded-full" />

      {/* Main Command Center Dashboard */}
      <div className="relative z-10 w-full">
        <div className="flex flex-col items-center mb-8 px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container border border-white/5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-f1-red shadow-[0_0_8px_rgba(225,6,0,0.8)] animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-f1-silver/60 uppercase">
              SectorOne v0.2.0 // MISSION_CONTROL
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-f1-white font-heading tracking-tighter uppercase leading-[0.8]">
            Functional <span className="text-f1-red">Intelligence</span>
          </h1>
        </div>

        <HeroDashboard />
      </div>

      {/* Footer Info / Minimalist */}
      <div className="relative z-10 mt-auto w-full max-w-7xl px-10 py-8 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
        <div className="flex gap-12">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-f1-silver uppercase">API_STATUS</div>
            <div className="text-xs font-mono text-f1-white font-bold">NOMINAL</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-f1-silver uppercase">LATENCY</div>
            <div className="text-xs font-mono text-f1-white font-bold">12ms</div>
          </div>
        </div>
        <div className="text-[10px] font-mono text-f1-silver tracking-widest">
          SECTORONE LABORATORY // HIGH PERFORMANCE TELEMETRY
        </div>
      </div>
    </div>
  );
}