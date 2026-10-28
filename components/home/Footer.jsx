import Link from "next/link";
import Icon from "@/components/ui/Icon";

export default function Footer() {
  return (
    <footer className="bg-canvas border-t border-border-hairline py-12 md:py-16 text-text-secondary">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-border-hairline flex items-center justify-center text-accent-primary shadow-2xs">
                <Icon name="Radio" className="w-3.5 h-3.5 text-accent-primary" />
              </div>
              <span className="text-base font-bold tracking-tight text-text-primary">
                NFCISTA
              </span>
            </Link>
            <p className="text-xs text-text-secondary leading-relaxed">
              Physical contactless smart cards and review hardware for modern businesses. Share your business profile with a single tap.
            </p>
            <p className="text-xs text-text-secondary">
              Privacy / Grievance Contact:<br />
              <a href="mailto:hellonfcista@gmail.com" className="text-accent-primary hover:underline font-medium">
                hellonfcista@gmail.com
              </a>
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
              Hardware &amp; Flow
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#products" className="text-text-secondary hover:text-text-primary transition-colors">
                  Product Catalog
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-text-secondary hover:text-text-primary transition-colors">
                  The Contactless Flow
                </a>
              </li>
              <li>
                <a href="#specifications" className="text-text-secondary hover:text-text-primary transition-colors">
                  Dual-Tech Specifications
                </a>
              </li>
              <li>
                <a href="#contact" className="text-text-secondary hover:text-text-primary transition-colors">
                  B2B Orders &amp; Inquiries
                </a>
              </li>
              <li>
                <a href="#faq" className="text-text-secondary hover:text-text-primary transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Portals & Demo */}
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
              Portals &amp; Demo
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/demo" className="text-text-secondary hover:text-accent-primary transition-colors flex items-center gap-1.5">
                  <span>Live Profile Demo</span>
                  <Icon name="ExternalLink" className="w-3 h-3 text-text-secondary" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5">
                  <span>Client Login</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy & Legal Column */}
          <div>
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">
              Privacy &amp; Compliance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="text-text-secondary hover:text-text-primary transition-colors">
                  Privacy Notice (DPDP)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-text-secondary hover:text-text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy/data-request" className="text-accent-primary font-medium hover:underline">
                  Data Rights Request
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
          <div>
            &copy; 2026 NFCISTA. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
            <span>&bull;</span>
            <Link href="/terms" className="hover:text-text-primary transition-colors">Terms</Link>
            <span>&bull;</span>
            <Link href="/privacy/data-request" className="hover:text-text-primary transition-colors">Data Rights</Link>
            <span>&bull;</span>
            <span>Contactless Physical Identity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
