"use client";

import { useState } from "react";
import Link from "next/link";

export default function StickyNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Experience", href: "#demo" },
    { label: "Why us", href: "#difference" },
    { label: "Products", href: "#products" },
    { label: "Process", href: "#process" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-ink/80 backdrop-blur-md border-b border-line">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 text-fg group">
          <div className="w-8 h-8 rounded-full bg-ink-alt border border-line flex items-center justify-center text-brand transition-colors group-hover:border-brand/40">
            {/* Inline SVG NFC Wave Icon */}
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 8a9 9 0 0 1 12 0" />
              <path d="M8.5 11.5a5 5 0 0 1 7 0" />
              <circle cx="12" cy="15" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <span className="font-display font-bold text-base tracking-tight text-fg">
            NFCISTA
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted hover:text-fg transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted hover:text-fg transition-colors px-3 py-1.5"
          >
            Client Login
          </Link>
          <a
            href="#inquire"
            className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-brand hover:bg-brand-hover text-white text-xs font-semibold tracking-wide transition-colors active:scale-[0.98] shadow-sm"
          >
            Get a quote
          </a>
        </div>

        {/* Mobile Hamburger (min 44px touch target) */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
          className="md:hidden w-11 h-11 rounded-full border border-line bg-ink-alt flex items-center justify-center text-fg hover:border-muted/40 transition-colors"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-line bg-ink-alt px-4 py-5 space-y-3">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-fg hover:bg-ink transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-fg hover:bg-ink transition-colors"
            >
              Client Login
            </Link>
          </nav>

          <div className="pt-3 border-t border-line">
            <a
              href="#inquire"
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center px-5 py-3 rounded-full bg-brand hover:bg-brand-hover text-white text-sm font-semibold tracking-wide transition-colors"
            >
              Get a quote
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
