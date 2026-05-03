"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

// Menu icon for mobile
function MenuIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// Close icon for mobile
function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// User icon for profile
function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "LIVE" },
  { href: "/strategy-lab", label: "ANALYSIS" },
  { href: "/archive", label: "HISTORY" },
  { href: "/settings", label: "SETTINGS" },
];

export function TopNav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Shared closeMenu helper - closes menu and returns focus to hamburger button
  const closeMenu = () => {
    setMobileMenuOpen(false);
    hamburgerRef.current?.focus();
  };

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !hamburgerRef.current?.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  // Focus first menu item when menu opens
  useEffect(() => {
    if (mobileMenuOpen) {
      const firstItem = dropdownRef.current?.querySelector("a");
      if (firstItem) {
        (firstItem as HTMLElement).focus();
      }
    }
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Top Navigation Bar - Desktop */}
      <nav
        className="hidden md:flex fixed top-0 left-0 right-0 h-16 items-center justify-between px-6 border-b border-white/5 bg-surface-dim z-50"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center border border-f1-red/30 shadow-[0_0_15px_rgba(225,6,0,0.15)] group-hover:border-f1-red/60 group-hover:shadow-[0_0_20px_rgba(225,6,0,0.3)] transition-all duration-300">
            <span className="font-bold text-f1-white text-lg">S</span>
          </div>
          <span className="text-heading text-lg font-bold text-f1-white tracking-tighter">
            SECTOR<span className="text-f1-red text-glow-red">ONE</span>
          </span>
        </Link>

        {/* Navigation Tabs - Center */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-all duration-200 ${
                  active
                    ? "text-f1-white"
                    : "text-f1-silver hover:text-f1-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="relative z-10">{item.label}</span>
                {/* Active indicator underline */}
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-f1-red shadow-[0_0_10px_rgba(225,6,0,0.8)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* User Profile Icon - Right */}
        <div className="flex items-center">
          <button
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center border border-white/10 text-f1-silver hover:text-f1-white hover:border-f1-red/30 transition-colors duration-200"
            aria-label="User profile"
          >
            <UserIcon />
          </button>
        </div>
      </nav>

      {/* Mobile Navigation - Hamburger Menu */}
      <nav
        className="md:hidden fixed top-0 left-0 right-0 h-14 items-center justify-between px-4 border-b border-white/5 bg-surface-dim z-50 flex"
        aria-label="Mobile navigation"
      >
        {/* Mobile Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center border border-f1-red/30 shadow-[0_0_12px_rgba(225,6,0,0.15)] transition-all duration-300">
            <span className="font-bold text-f1-white text-base">S</span>
          </div>
          <span className="text-heading text-sm font-bold text-f1-white tracking-tighter">
            SECTOR<span className="text-f1-red">ONE</span>
          </span>
        </Link>

        {/* Hamburger Button */}
        <button
          ref={hamburgerRef}
          className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center border border-white/10 text-f1-silver hover:text-f1-white hover:border-f1-red/30 transition-colors duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          ref={dropdownRef}
          id="mobile-menu"
          className="md:hidden fixed top-14 left-0 right-0 bg-surface-dim border-b border-white/5 z-40"
          role="menu"
          aria-label="Navigation menu"
        >
          <div className="flex flex-col py-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className={`px-4 py-3 text-sm font-medium tracking-wide transition-colors duration-200 ${
                    active
                      ? "text-f1-white bg-f1-red/[0.1] border-l-2 border-f1-red"
                      : "text-f1-silver hover:text-f1-white hover:bg-white/[0.04]"
                  }`}
                  onClick={closeMenu}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}