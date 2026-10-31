import Link from "next/link";
import NfcistaLogo from "@/components/ui/NfcistaLogo";

export default function Footer() {
  return (
    <footer className="bg-ink-alt border-t border-line py-16 text-muted">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-line">
          {/* Brand & Tagline */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 text-fg group">
              <div className="w-8 h-8 rounded-full bg-ink border border-line flex items-center justify-center overflow-hidden transition-colors group-hover:border-brand/40">
                <NfcistaLogo size={22} />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-fg">
                NFCISTA
              </span>
            </Link>
            <p className="font-sans text-sm text-dim leading-relaxed max-w-sm">
              Smart NFC products for shops. We design, program and test finished contactless hardware for in-person customer connection.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <div className="font-mono text-xs uppercase tracking-wider text-fg font-bold">
              Navigation
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#demo" className="text-dim hover:text-fg transition-colors">
                  Experience Demo
                </a>
              </li>
              <li>
                <a href="#difference" className="text-dim hover:text-fg transition-colors">
                  Why Us
                </a>
              </li>
              <li>
                <a href="#products" className="text-dim hover:text-fg transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="#process" className="text-dim hover:text-fg transition-colors">
                  Process
                </a>
              </li>
              <li>
                <a href="#faq" className="text-dim hover:text-fg transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Portals & Demo */}
          <div className="md:col-span-4 space-y-3">
            <div className="font-mono text-xs uppercase tracking-wider text-fg font-bold">
              Portals &amp; Compliance
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/demo" className="text-dim hover:text-brand-text transition-colors flex items-center gap-1.5">
                  <span>View Live Demo Profile</span>
                  <span className="text-[10px] text-brand-text">↗</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-dim hover:text-fg transition-colors">
                  Client Portal Login
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-dim hover:text-fg transition-colors">
                  Privacy Notice (DPDP)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-dim hover:text-fg transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy/data-request" className="text-dim hover:text-fg transition-colors">
                  Data Rights Request
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back-to-Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-dim">
          <div>
            &copy; {new Date().getFullYear()} NFCISTA. All rights reserved.
          </div>

          <a
            href="#"
            className="hover:text-fg transition-colors flex items-center gap-1.5 font-medium"
          >
            <span>Back to top</span>
            <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
