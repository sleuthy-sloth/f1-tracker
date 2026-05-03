"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  { href: "/", label: "Dashboard", icon: ArchiveIcon }, // Home is now Dashboard
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
      className="hidden md:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-white/5 bg-surface-dim z-50"
      aria-label="Main navigation"
    >
      {/* Branding */}
      <div className="flex h-20 items-center px-6 border-b border-white/5 bg-surface/30 backdrop-blur-md">
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-f1-red flex items-center justify-center font-bold text-white shadow-lg shadow-f1-red/20 group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="text-heading text-xl font-bold text-f1-white tracking-tighter">
            SECTOR<span className="text-f1-red">ONE</span>
          </span>
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
                  ? "bg-white/5 text-f1-white shadow-sm"
                  : "text-f1-silver hover:bg-white/[0.03] hover:text-f1-white"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <div className={`transition-colors duration-200 ${active ? "text-f1-red" : "group-hover:text-f1-white"}`}>
                <Icon />
              </div>
              <span className={`font-medium ${active ? "text-f1-white" : ""}`}>{item.label}</span>
              {active && (
                <div className="ml-auto w-1 h-4 rounded-full bg-f1-red shadow-[0_0_8px_rgba(225,6,0,0.5)]" />
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
              ? "bg-white/5 text-f1-white shadow-sm"
              : "text-f1-silver hover:bg-white/[0.03] hover:text-f1-white"
          }`}
        >
          <div className={`transition-colors duration-200 ${isActive("/settings") ? "text-f1-red" : "group-hover:text-f1-white"}`}>
            <SettingsIcon />
          </div>
          <span className="font-medium">Settings</span>
        </Link>
      </div>

      {/* User Info / Status */}
      <div className="border-t border-white/5 p-4 bg-surface/20 backdrop-blur-sm">
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