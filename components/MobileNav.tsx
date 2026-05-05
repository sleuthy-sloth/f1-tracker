"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="7" height="7" rx="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/archive",
    label: "Archive",
    icon: (
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="7" />
        <polyline points="10,6 10,10 13,12" />
      </svg>
    ),
  },
  {
    href: "/standings",
    label: "Standings",
    icon: (
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 17V11M10 17V5M15 17V9" />
      </svg>
    ),
  },
  {
    href: "/fantasy",
    label: "Fantasy",
    icon: (
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="10,2 12.9,7.3 19,8.1 14.5,12.4 15.6,18.4 10,15.4 4.4,18.4 5.5,12.4 1,8.1 7.1,7.3" />
      </svg>
    ),
  },
  {
    href: "/strategy-lab",
    label: "Replay",
    icon: (
      <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 17 L3 3" />
        <path d="M3 14 L8 9 L12 12 L17 5" />
      </svg>
    ),
  },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="flex md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "var(--surface-1)",
        borderTop: "1px solid var(--border)",
      }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around w-full py-2 pb-6 px-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-1 px-3 transition-colors no-underline"
              style={{ color: active ? "var(--red)" : "var(--text-2)" }}
              aria-current={active ? "page" : undefined}
            >
              {item.icon}
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
