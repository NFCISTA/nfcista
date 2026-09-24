"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: "Products", href: "#products" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ];

  const whatsappUrl = "https://wa.me/919000000000?text=Hi%20NFCISTA%2C%20I%20would%20like%20to%20order%20an%20NFC%20card.";

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-outline-variant/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-btn-primary group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[20px]">contactless</span>
          </div>
          <span className="text-headline-md font-bold tracking-tight text-on-surface">
            NFCISTA
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-body-md font-medium text-on-surface-variant hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white text-label-md font-semibold hover:bg-[#20ba59] shadow-sm transition-all active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Order on WhatsApp</span>
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle mobile menu"
          className="md:hidden w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">
            {isOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-outline-variant/30 bg-white px-4 py-5 shadow-float">
          <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 rounded-lg text-body-md font-medium text-on-surface hover:bg-surface-container-low transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 mt-1 border-t border-outline-variant/20 flex flex-col gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] text-white text-label-md font-semibold hover:bg-[#20ba59] shadow-sm transition-all text-center"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
