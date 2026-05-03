import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-surface-dim overflow-hidden flex flex-col">
      {/* Background Grid Layer */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      
      {/* Hero Section */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        {/* Animated Accent Blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-f1-red/10 rounded-full blur-[120px] animate-telemetry" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-telemetry delay-1000" />

        <div className="relative z-10 max-w-5xl mx-auto space-y-12">
          {/* Logo / Brand Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-panel border-f1-red/30 shadow-xl shadow-f1-red/5">
            <div className="w-2 h-2 rounded-full bg-f1-red shadow-[0_0_8px_rgba(225,6,0,0.8)] animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-f1-silver/80 uppercase">
              SectorOne Protocol v0.2.0
            </span>
          </div>

          {/* Hero Content */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-heading leading-[0.9] tracking-tighter text-f1-white">
              PRECISION<br />
              <span className="text-f1-red text-glow-red">TELEMETRY</span>
            </h1>
            
            {/* Design Influence: Telemetry Pulse Line */}
            <div className="relative w-full max-w-lg mx-auto py-4 opacity-60">
              <svg viewBox="0 0 400 40" className="w-full h-auto">
                <path 
                  d="M0 20 L40 20 L60 5 L80 35 L100 10 L125 38 L150 15 L180 20 L240 20 L260 5 L280 35 L300 10 L325 38 L350 15 L380 20 L400 20" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2"
                  className="animate-telemetry"
                />
                <circle cx="400" cy="20" r="3" fill="#e10600" className="animate-pulse shadow-[0_0_8px_#e10600]" />
              </svg>
            </div>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-f1-silver font-medium leading-relaxed">
              Experience Formula 1 like a race engineer. High-performance analysis, 
              live strategy simulation, and advanced championship tracking.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link 
              href="/standings" 
              className="group relative px-8 py-4 bg-f1-red text-white font-bold rounded-xl overflow-hidden shadow-2xl shadow-f1-red/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                Launch Mission Control
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </span>
            </Link>
            <Link 
              href="/archive" 
              className="px-8 py-4 glass-panel glass-panel-hover text-f1-white font-bold rounded-xl transition-all"
            >
              Race Archives
            </Link>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="mt-20 relative w-full max-w-6xl aspect-[21/9] rounded-2xl overflow-hidden glass-panel border-white/10 shadow-3xl group">
          <Image 
            src="/images/hero.png" 
            alt="F1 Cinematic Telemetry" 
            fill
            className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.01] transition-all duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dim via-transparent to-transparent opacity-60" />
          
          {/* Mockup Overlays */}
          <div className="absolute bottom-6 left-6 flex items-center gap-4">
            <div className="px-3 py-1.5 rounded bg-black/60 backdrop-blur-md border border-white/10 font-mono text-[10px] text-f1-red font-bold">
              SYSTEM: ACTIVE
            </div>
            <div className="px-3 py-1.5 rounded bg-black/60 backdrop-blur-md border border-white/10 font-mono text-[10px] text-f1-silver font-bold">
              GPS: 44.5011° N, 11.3435° E
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-10 py-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex gap-12">
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-f1-silver/40 uppercase">Data Source</div>
            <div className="text-xs font-mono text-f1-white font-bold">OpenF1 API</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-f1-silver/40 uppercase">Season</div>
            <div className="text-xs font-mono text-f1-white font-bold">{new Date().getFullYear()}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-f1-silver/40 uppercase">Status</div>
            <div className="text-xs font-mono text-green-500 font-bold">NOMINAL</div>
          </div>
        </div>
        <div className="text-[10px] font-mono text-f1-silver/40">
          DESIGNED FOR MAXIMUM PERFORMANCE BY SECTORONE LABS
        </div>
      </div>
    </div>
  );
}