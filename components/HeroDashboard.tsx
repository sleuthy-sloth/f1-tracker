"use client";

import Image from "next/image";
import Link from "next/link";
import { DataCard } from "./DataCard";
import { TelemetryPulse } from "./TelemetryPulse";

export function HeroDashboard() {
  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:p-6">
      {/* Left Column - Key Metrics & Status */}
      <div className="lg:col-span-3 space-y-4">
        <div className="glass-panel p-4 rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
            <span className="panel-header text-[10px]">MISSION_STATUS</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-mono text-green-500 font-bold">READY</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="data-label mb-1">CURRENT SESSION</div>
              <div className="text-sm font-bold text-f1-white font-heading tracking-tight">MONZA GP - RACE 01/22</div>
            </div>
            
            <TelemetryPulse color="#00d2be" className="h-12" />
            
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-surface-container rounded-lg border border-white/5">
                <div className="data-label">TRACK TEMP</div>
                <div className="text-xl font-black text-f1-white font-heading">34.2<span className="text-xs text-f1-silver/50 ml-0.5">°C</span></div>
              </div>
              <div className="p-3 bg-surface-container rounded-lg border border-white/5">
                <div className="data-label">AIR TEMP</div>
                <div className="text-xl font-black text-f1-white font-heading">26.8<span className="text-xs text-f1-silver/50 ml-0.5">°C</span></div>
              </div>
            </div>
          </div>
        </div>

        <DataCard label="SEASON PROGRESS" value="48" unit="%" trend="up" trendLabel="+5% vs LY" />
        <DataCard label="SYSTEM LATENCY" value="12" unit="ms" trend="neutral" trendLabel="STABLE" />
      </div>

      {/* Middle Column - Main Visual & Branding */}
      <div className="lg:col-span-6 space-y-4">
        <div className="relative aspect-video lg:aspect-square xl:aspect-video rounded-2xl overflow-hidden glass-panel border-white/10 shadow-2xl group">
          <Image 
            src="/images/hero-command.png"
            alt="SectorOne Command Center" 
            fill
            className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/80 via-transparent to-transparent" />
          
          {/* HUD Overlays */}
          <div className="absolute top-4 left-4 flex gap-2">
            <div className="px-2 py-1 bg-f1-red/20 border border-f1-red/40 rounded text-[9px] font-mono font-bold text-f1-red backdrop-blur-md">
              LIVE_DATA_FEED
            </div>
            <div className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono font-bold text-f1-silver backdrop-blur-md">
              ENCRYPTED_LINK
            </div>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-f1-white font-heading leading-none mb-2">
                PRECISION <span className="text-f1-red text-glow-red">TELEMETRY</span>
              </h2>
              <p className="text-xs text-f1-silver/80 font-medium max-w-xs">
                Real-time data processing for the next generation of Formula 1 enthusiasts.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-[10px] font-mono text-f1-silver/40 text-right">
                COORDS: 44.5011° N, 11.3435° E<br/>
                SECTOR_ID: NORTH_01
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="grid grid-cols-2 gap-4">
          <Link 
            href="/standings"
            className="flex items-center justify-center gap-2 py-3 bg-f1-red text-white font-bold rounded-xl shadow-lg shadow-f1-red/20 hover:scale-[1.02] transition-all"
          >
            <span className="text-xs font-heading">LAUNCH DASHBOARD</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          </Link>
          <Link 
            href="/archive"
            className="flex items-center justify-center gap-2 py-3 glass-panel glass-panel-hover text-f1-white font-bold rounded-xl transition-all"
          >
            <span className="text-xs font-heading">EXPLORE ARCHIVES</span>
          </Link>
        </div>
      </div>

      {/* Right Column - Secondary Data & Logs */}
      <div className="lg:col-span-3 space-y-4">
        <div className="glass-panel p-4 rounded-xl h-full flex flex-col">
          <div className="panel-header text-[10px] mb-4 flex justify-between items-center">
            <span>SYSTEM_LOG</span>
            <span className="text-[9px] font-mono text-f1-silver/30 font-normal italic">v0.2.0_BETA</span>
          </div>
          
          <div className="flex-1 space-y-3 font-mono text-[10px] overflow-hidden">
            <div className="flex gap-2">
              <span className="text-f1-silver/30">[17:41:02]</span>
              <span className="text-f1-white italic">SYSCFG: Initializing telemetry_link...</span>
            </div>
            <div className="flex gap-2">
              <span className="text-f1-silver/30">[17:41:04]</span>
              <span className="text-green-500 font-bold">SUCCESS: Connection established</span>
            </div>
            <div className="flex gap-2">
              <span className="text-f1-silver/30">[17:41:05]</span>
              <span className="text-f1-white italic">DATALAYER: Fetching live_sessions...</span>
            </div>
            <div className="flex gap-2">
              <span className="text-f1-silver/30">[17:41:08]</span>
              <span className="text-f1-white italic">UI_RENDER: Loading command_center...</span>
            </div>
            <div className="flex gap-2">
              <span className="text-f1-silver/30">[17:41:10]</span>
              <span className="text-f1-red font-bold animate-pulse">ALERT: Weather pattern changing (S2)</span>
            </div>
            <div className="flex gap-3 pt-4 items-center">
              <div className="h-px flex-1 bg-white/5" />
              <div className="w-1.5 h-1.5 bg-f1-red rounded-full" />
              <div className="h-px flex-1 bg-white/5" />
            </div>
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-surface-container/50 border border-white/5 rounded-lg">
                <div className="data-label mb-1">AVG RESPONSE</div>
                <div className="text-xl font-black text-f1-white font-heading">142<span className="text-xs text-f1-silver/50 ml-0.5">μs</span></div>
              </div>
              <DataCard label="DATA THROUGHPUT" value="1.2" unit="GB/s" className="bg-transparent border-none p-0" />
            </div>
          </div>
          
          <div className="mt-auto pt-4 text-[9px] font-mono text-f1-silver/30 uppercase tracking-widest text-center">
            SectorOne Protocol © 2026
          </div>
        </div>
      </div>
    </div>
  );
}
