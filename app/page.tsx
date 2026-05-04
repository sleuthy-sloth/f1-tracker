import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SectorOne — F1 Telemetry Dashboard",
  description: "High-performance Formula 1 telemetry suite with real-time race replay, championship standings, fantasy leagues, and satellite track maps.",
  openGraph: {
    title: "SectorOne — F1 Telemetry Dashboard",
    description: "Track live F1 data, replay races with satellite maps, analyze strategy, and compete in fantasy leagues.",
    siteName: "SectorOne",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-f1-carbon">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-20 pb-16 lg:pt-32 lg:pb-24">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#00D2BE]/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00D2BE]/3 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D2BE] to-[#E10600] flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">S1</span>
            </div>
            <span className="text-2xl font-heading font-bold text-f1-white tracking-wider">SectorOne</span>
          </div>
          
          {/* Tagline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-f1-white leading-tight mb-6">
            Your F1 Telemetry
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00D2BE] to-[#E10600]">
              Command Center
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-f1-silver max-w-2xl mx-auto mb-10 leading-relaxed">
            Replay races on satellite maps, analyze strategy with real telemetry, 
            track championship battles, and compete in fantasy leagues — all powered by live OpenF1 data.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth"
              className="px-8 py-3.5 bg-gradient-to-r from-[#E10600] to-[#E10600]/80 text-white font-heading font-bold rounded-lg hover:from-[#E10600]/90 hover:to-[#E10600]/70 transition-all shadow-lg shadow-f1-red/20 hover:shadow-f1-red/40"
            >
              Get Started — Sign Up Free
            </Link>
            <Link
              href="/archive"
              className="px-8 py-3.5 border border-white/[0.15] text-f1-white font-heading font-bold rounded-lg hover:bg-white/[0.05] transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Browse as Guest
            </Link>
          </div>
          
          {/* Guest hint */}
          <p className="text-xs text-f1-silver/50 mt-4">
            No account needed to explore the archive, replay races, or view standings
          </p>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Archive */}
            <Link href="/archive" className="group rounded-xl border border-white/[0.07] bg-[#111418] p-5 hover:border-[#00D2BE]/30 hover:bg-white/[0.04] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#00D2BE]/10 flex items-center justify-center mb-3 group-hover:bg-[#00D2BE]/20 transition-colors">
                <svg className="w-5 h-5 text-[#00D2BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-f1-white mb-1">Race Archive</h3>
              <p className="text-sm text-f1-silver">Browse historical sessions, view results, and launch full telemetry replays</p>
            </Link>

            {/* Replay */}
            <Link href="/strategy-lab" className="group rounded-xl border border-white/[0.07] bg-[#111418] p-5 hover:border-[#00D2BE]/30 hover:bg-white/[0.04] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#00D2BE]/10 flex items-center justify-center mb-3 group-hover:bg-[#00D2BE]/20 transition-colors">
                <svg className="w-5 h-5 text-[#00D2BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-f1-white mb-1">Strategy Lab</h3>
              <p className="text-sm text-f1-silver">Replay races on satellite maps with live telemetry, gap charts, and weather</p>
            </Link>

            {/* Standings */}
            <Link href="/standings" className="group rounded-xl border border-white/[0.07] bg-[#111418] p-5 hover:border-[#00D2BE]/30 hover:bg-white/[0.04] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#00D2BE]/10 flex items-center justify-center mb-3 group-hover:bg-[#00D2BE]/20 transition-colors">
                <svg className="w-5 h-5 text-[#00D2BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-f1-white mb-1">Standings</h3>
              <p className="text-sm text-f1-silver">Driver and constructor championships with form charts and PU tracking</p>
            </Link>

            {/* Fantasy */}
            <Link href="/fantasy" className="group rounded-xl border border-white/[0.07] bg-[#111418] p-5 hover:border-[#00D2BE]/30 hover:bg-white/[0.04] transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#00D2BE]/10 flex items-center justify-center mb-3 group-hover:bg-[#00D2BE]/20 transition-colors">
                <svg className="w-5 h-5 text-[#00D2BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-f1-white mb-1">Fantasy League</h3>
              <p className="text-sm text-f1-silver">Build your dream team, create leagues, and track points across the season</p>
            </Link>

          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto text-center rounded-xl border border-white/[0.07] bg-gradient-to-b from-[#111418] to-[#0d1114] p-10">
          <h2 className="font-heading text-2xl font-bold text-f1-white mb-3">Ready to dive in?</h2>
          <p className="text-f1-silver mb-6">
            All core features are available without an account. Sign up to save your fantasy teams and league data.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth"
              className="px-6 py-3 bg-f1-red text-white font-heading font-bold rounded-lg hover:bg-f1-red/90 transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              href="/archive"
              className="px-6 py-3 border border-white/[0.15] text-f1-white font-heading font-bold rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              Start Browsing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 pb-8">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-xs text-f1-silver/40">
            Powered by <a href="https://openf1.org/" target="_blank" rel="noopener noreferrer" className="text-f1-silver/60 hover:text-f1-silver">OpenF1 API</a> and NVIDIA NIM.
            Not affiliated with Formula 1 or any F1 team.
          </p>
        </div>
      </footer>
    </div>
  );
}