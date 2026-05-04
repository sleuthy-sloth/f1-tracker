import type { Metadata } from "next";
import Link from "next/link";
import { HeroDashboard } from "@/components/HeroDashboard";

export const metadata: Metadata = {
  title: "SectorOne — F1 Telemetry Dashboard",
};

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
            FUNCTIONAL <span className="text-f1-red">INTELLIGENCE</span>
          </h1>
        </div>

        <HeroDashboard />

        {/* CTA buttons */}
        <div className="flex gap-4 justify-center mt-6 px-4">
          <Link
            href="/standings"
            className="flex items-center gap-2 px-6 py-4 bg-f1-red text-white font-black rounded-xl shadow-[0_4px_24px_rgba(225,6,0,0.4)] hover:shadow-[0_4px_32px_rgba(225,6,0,0.6)] hover:scale-[1.02] transition-all"
          >
            <span className="text-sm font-heading tracking-wide">LAUNCH DASHBOARD</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>
          <Link
            href="/archive"
            className="flex items-center gap-2 px-6 py-4 glass-panel glass-panel-hover text-f1-silver font-bold rounded-xl transition-all"
          >
            <span className="text-xs font-heading tracking-wide">EXPLORE ARCHIVES</span>
          </Link>
        </div>
      </div>
    </div>
  );
}