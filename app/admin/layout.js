"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // The login page manages its own unauthenticated state
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // 1. Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        if (isLoginPage) {
          if (session.access_token) {
            try {
              await fetch("/api/admin/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  access_token: session.access_token,
                  expires_in: session.expires_in,
                }),
              });
            } catch {
              // Non-blocking
            }
          }
          router.replace("/admin");
        }
      } else {
        setUser(null);
        if (!isLoginPage) {
          router.replace("/admin/login");
        }
      }
      setLoading(false);
    });

    // 2. Listen for auth state transitions (Sign in, Sign out, Token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (isLoginPage) {
          router.replace("/admin");
        }
      } else {
        setUser(null);
        if (!isLoginPage) {
          router.replace("/admin/login");
        }
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [isLoginPage, router]);

  // If on login page, let login page render without the admin navigation bar
  if (isLoginPage) {
    return <div className="min-h-screen bg-[#F8FAFC]">{children}</div>;
  }

  // Loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-body-sm text-on-surface-variant font-medium">
            Verifying admin access...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated and not on login page: hold render until redirect triggers
  if (!user) {
    return null;
  }

  async function handleSignOut() {
    if (supabase) {
      try {
        await fetch("/api/admin/session", { method: "DELETE" });
      } catch {
        // Continue sign out regardless
      }
      await supabase.auth.signOut();
      router.replace("/admin/login");
    }
  }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/admin", label: "Customers", icon: "badge" },
    { href: "/admin/gallery", label: "Gallery", icon: "photo_library" },
    { href: "/admin/qr-activate", label: "QR Activation", icon: "published_with_changes" },
    { href: "/admin/qr-codes", label: "Card Generator", icon: "add_circle" },
    { href: "/admin/qr-scan", label: "Scan QR", icon: "qr_code_scanner" },
    { href: "/admin/qr-print", label: "Print Cards", icon: "print" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Admin Navigation */}
      <header className="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant/30 shadow-card">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <Link href="/admin" className="flex items-center gap-2 shrink-0">
              <span className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                N
              </span>
              <div>
                <span className="font-bold text-on-surface text-label-lg tracking-tight">
                  NFCISTA
                </span>
                <span className="ml-1.5 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-container-low text-primary border border-outline-variant/20 uppercase tracking-wider">
                  Admin
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-label-md font-semibold transition-colors ${
                    pathname === link.href
                      ? "bg-surface-container-low text-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <span className="hidden lg:inline-block text-body-sm text-on-surface-variant font-medium truncate max-w-[180px]">
              {user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-label-md font-semibold transition-all active:scale-[0.98]"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[16px] text-error">
                logout
              </span>
              <span>Sign Out</span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-outline-variant/20 bg-surface-container-lowest px-3 py-3 space-y-1 shadow-float">
            <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 px-3 py-1">
              Navigation Menu
            </div>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-label-md font-semibold transition-colors ${
                    isActive
                      ? "bg-surface-container-low text-primary"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isActive ? "text-primary" : "text-on-surface-variant/70"
                    }`}
                  >
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 mt-2 border-t border-outline-variant/20 flex items-center justify-between px-3 py-1.5">
              <span className="text-xs text-on-surface-variant truncate max-w-[200px]">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error-container/20 text-error text-xs font-semibold hover:bg-error-container/40 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Admin Content Shell */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {children}
      </main>
    </div>
  );
}
