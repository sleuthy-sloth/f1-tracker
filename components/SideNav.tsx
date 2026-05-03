"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Dashboard icon
function DashboardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  );
}

// Archive icon
function ArchiveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
  );
}

// Strategy icon
function StrategyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" /></svg>
  );
}

// Standings icon
function StandingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
  );
}

// Fantasy icon
function FantasyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
  );
}

// Settings icon
function SettingsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: DashboardIcon },
  { href: "/archive", label: "Race Archive", icon: ArchiveIcon },
  { href: "/strategy-lab", label: "Strategy Lab", icon: StrategyIcon },
  { href: "/standings", label: "Standings", icon: StandingsIcon },
  { href: "/fantasy", label: "Fantasy Hub", icon: FantasyIcon },
];

export function SideNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col border-t-2 border-t-f1-red border-r border-white/5 bg-surface-dim z-50"
      aria-label="Main navigation"
    >
      {/* Branding */}
      <div className="flex h-20 items-center px-6 border-b border-white/5 bg-surface-dim">
        <Link href="/" className="group flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center border border-f1-red/30 shadow-[0_0_15px_rgba(225,6,0,0.15)] group-hover:border-f1-red/60 group-hover:shadow-[0_0_20px_rgba(225,6,0,0.3)] transition-all duration-300">
              <span className="font-bold text-f1-white text-lg">S</span>
            </div>
            <span className="text-heading text-xl font-bold text-f1-white tracking-tighter">
              SECTOR<span className="text-f1-red text-glow-red">ONE</span>
            </span>
          </div>
          {/* Neon Pulse Line Sub-branding */}
          <div className="ml-0.5 h-[1px] w-full bg-gradient-to-r from-f1-red via-white to-transparent opacity-40 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex flex-1 flex-col gap-1.5 p-4 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold text-f1-silver/40 uppercase tracking-widest">
          Main Menu
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                active
                  ? "bg-f1-red/[0.1] border border-f1-red/25 text-f1-white"
                  : "text-f1-silver hover:bg-white/[0.04] hover:text-f1-white border border-transparent"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <div className={`transition-colors duration-200 ${active ? "text-f1-red drop-shadow-[0_0_5px_rgba(225,6,0,0.5)]" : "group-hover:text-f1-white"}`}>
                <Icon />
              </div>
              <span className={`font-medium tracking-tight ${active ? "text-f1-white" : ""}`}>{item.label}</span>
              {active && (
                <div className="ml-auto w-1 h-5 rounded-full bg-f1-red shadow-[0_0_12px_rgba(225,6,0,0.8)]" />
              )}
            </Link>
          );
        })}

        <div className="mt-8 px-3 mb-2 text-[10px] font-bold text-f1-silver/40 uppercase tracking-widest">
          System
        </div>
        <Link
          href="/settings"
          className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
            isActive("/settings")
              ? "bg-f1-red/[0.1] border border-f1-red/25 text-f1-white"
              : "text-f1-silver hover:bg-white/[0.04] hover:text-f1-white border border-transparent"
          }`}
        >
          <div className={`transition-colors duration-200 ${isActive("/settings") ? "text-f1-red" : "group-hover:text-f1-white"}`}>
            <SettingsIcon />
          </div>
          <span className="font-medium">Settings</span>
        </Link>
      </div>

      {/* User Info / Status */}
      <div className="border-t border-white/5 p-4 bg-surface-dim">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-mono text-f1-silver/60 uppercase tracking-widest">
            Telemetry Online
          </span>
        </div>
        <div className="mt-2 px-2">
          <span className="text-[10px] font-mono text-f1-silver/30">
            SEC-ONE // V0.2.0-STABLE
          </span>
        </div>
      </div>
    </nav>
  );
}