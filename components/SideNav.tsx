"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="7" height="7" rx="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/archive",
    label: "Race Archive",
    icon: (
      <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="7" />
        <polyline points="10,6 10,10 13,12" />
      </svg>
    ),
  },
  {
    href: "/strategy-lab",
    label: "Strategy Lab",
    icon: (
      <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 17 L3 3" />
        <path d="M3 14 L8 9 L12 12 L17 5" />
      </svg>
    ),
  },
  {
    href: "/standings",
    label: "Standings",
    icon: (
      <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 17V11M10 17V5M15 17V9" />
      </svg>
    ),
  },
  {
    href: "/fantasy",
    label: "Fantasy",
    icon: (
      <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="10,2 12.9,7.3 19,8.1 14.5,12.4 15.6,18.4 10,15.4 4.4,18.4 5.5,12.4 1,8.1 7.1,7.3" />
      </svg>
    ),
  },
];

export function SideNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="hidden md:flex fixed left-0 top-0 h-screen z-50 flex-col"
      style={{
        width: "var(--nav-w)",
        background: "var(--surface-1)",
        borderRight: "1px solid var(--border)",
      }}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div
            style={{
              width: 28,
              height: 28,
              background: "var(--red)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 5,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: 12,
                color: "#fff",
                letterSpacing: 0,
              }}
            >
              S1
            </span>
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: 16,
                color: "var(--text-1)",
                letterSpacing: "0.04em",
              }}
            >
              SECTORONE
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 8,
                color: "var(--text-3)",
                letterSpacing: "0.1em",
              }}
            >
              F1 TELEMETRY
            </div>
          </div>
        </Link>
      </div>

      {/* Nav items */}
      <div
        style={{
          flex: 1,
          padding: "8px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          overflowY: "auto",
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="flex items-center gap-2.5 rounded no-underline transition-colors"
              style={{
                padding: "9px 10px",
                background: active ? "var(--red-bg)" : "transparent",
                color: active ? "var(--text-1)" : "var(--text-2)",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              <span style={{ color: active ? "var(--red)" : "inherit", flexShrink: 0 }}>
                {item.icon}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </span>
              {active && (
                <div
                  style={{
                    marginLeft: "auto",
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    background: "var(--red)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded no-underline w-full transition-colors"
          style={{
            padding: "7px 10px",
            color: isActive("/settings") ? "var(--text-1)" : "var(--text-2)",
            background: isActive("/settings") ? "var(--surface-2)" : "transparent",
            marginBottom: 2,
            fontSize: 13,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
          }}
          onMouseLeave={(e) => {
            if (!isActive("/settings"))
              (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="10" cy="10" r="2.5" />
            <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.1 4.1l1.4 1.4M14.5 14.5l1.4 1.4M4.1 15.9l1.4-1.4M14.5 5.5l1.4-1.4" />
          </svg>
          <span style={{ fontFamily: "var(--font-sans)", fontWeight: isActive("/settings") ? 600 : 400 }}>
            Settings
          </span>
        </Link>
        <Link
          href="/auth"
          className="flex items-center gap-2.5 rounded no-underline w-full transition-colors"
          style={{
            padding: "7px 10px",
            color: "var(--text-2)",
            background: "transparent",
            fontSize: 13,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="7" r="3" />
            <path d="M3 17c0-2.8 2.7-5 6-5" />
            <path d="M13 13l2 2 4-4" />
          </svg>
          <span style={{ fontFamily: "var(--font-sans)" }}>Sign In</span>
        </Link>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            color: "var(--text-3)",
            marginTop: 6,
            paddingLeft: 10,
          }}
        >
          v0.2.0 · OpenF1 API
        </div>
      </div>
    </nav>
  );
}
