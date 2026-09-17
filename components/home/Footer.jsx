import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-outline-variant/30 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-[18px]">contactless</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-on-surface">
                NFCISTA
              </span>
            </Link>
            <p className="text-body-md text-on-surface-variant max-w-sm leading-relaxed">
              Smart NFC business cards for modern professionals. Share your contact and business details with a single tap.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-label-md font-bold text-on-surface uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-body-sm">
              <li>
                <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-on-surface-variant hover:text-primary transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#features" className="text-on-surface-variant hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#cards" className="text-on-surface-variant hover:text-primary transition-colors">
                  Card Concepts
                </a>
              </li>
              <li>
                <a href="#faq" className="text-on-surface-variant hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Actions */}
          <div>
            <h4 className="text-label-md font-bold text-on-surface uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-body-sm">
              <li>
                <a href="#contact" className="text-on-surface-variant hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Link href="/p/demo-customer" className="text-on-surface-variant hover:text-primary transition-colors">
                  Demo Card
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-on-surface-variant hover:text-primary transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <div>
            &copy; 2026 NFCISTA. All rights reserved.
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Built for modern business networking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
