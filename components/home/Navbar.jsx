"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import NfcistaLogo from "@/components/ui/NfcistaLogo";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Products", href: "#products" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Specifications", href: "#specifications" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-canvas/90 backdrop-blur-md border-b border-border-hairline transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-border-hairline flex items-center justify-center overflow-hidden shadow-2xs group-hover:border-accent-primary/40 transition-colors">
            <NfcistaLogo size={22} priority />
          </div>
          <span className="text-base font-bold tracking-tight text-text-primary">
            NFCISTA
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Working Customer Portal Login */}
          <Link
            href="/login"
            className="text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg hover:bg-surface-subtle transition-colors"
          >
            Client Login
          </Link>

          {/* Primary Inquire / Order Action -> Scrolls directly to verified on-page contact section */}
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent-primary text-white text-xs font-semibold hover:bg-accent-hover shadow-2xs transition-colors active:scale-[0.98]"
          >
            <Icon name="MessageSquare" className="w-3.5 h-3.5" />
            <span>Contact &amp; Orders</span>
          </a>
        </div>

        {/* Mobile Hamburger Button (44x44px minimum touch target) */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
          className="md:hidden w-11 h-11 rounded-lg border border-border-hairline bg-surface-elevated flex items-center justify-center text-text-primary hover:bg-surface-subtle transition-colors"
        >
          <Icon name={isOpen ? "X" : "Menu"} className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border-hairline bg-surface-elevated px-4 py-5 shadow-lg">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-subtle transition-colors"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-3 mt-2 border-t border-border-hairline flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border-hairline text-sm font-medium text-text-primary hover:bg-surface-subtle transition-colors text-center"
              >
                <Icon name="User" className="w-4 h-4 text-text-secondary" />
                <span>Client Login</span>
              </Link>

              <a
                href="#contact"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-accent-primary text-white text-sm font-semibold hover:bg-accent-hover shadow-2xs transition-colors text-center"
              >
                <Icon name="MessageSquare" className="w-4 h-4" />
                <span>Contact &amp; Orders</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
