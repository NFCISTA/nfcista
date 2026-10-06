"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function CustomerDashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    async function checkAuthAndProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.replace("/login");
          return;
        }

        setUser(session.user);

        // Fetch customer profile linked to this user
        const res = await fetch("/api/customer/profile", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setCustomer(data.customer);
        }
      } catch (err) {
        console.error("Dashboard auth check error:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        setUser(null);
        setCustomer(null);
        router.replace("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router]);

  async function handleSignOut() {
    if (supabase) {
      try {
        await fetch("/api/admin/session", { method: "DELETE" });
      } catch {}
      await supabase.auth.signOut();
      router.replace("/login");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-body-sm text-on-surface-variant font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navLinks = [
    { href: "/dashboard", label: "My Profile", icon: "badge" },
    { href: "/dashboard/profile", label: "Edit Details", icon: "edit_note" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-primary selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant/30 shadow-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0">
            <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-sm">
                <span className="material-symbols-outlined text-[18px]">contactless</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-on-surface text-label-lg tracking-tight">
                  NFCISTA
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container-low text-primary border border-outline-variant/20 uppercase tracking-wider">
                  Customer
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-xl text-label-md font-semibold transition-colors ${
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

          {/* Right Action Icons & User Menu */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Card Preview Link if slug is known */}
            {customer?.profile_slug && (
              <a
                href={`/p/${customer.profile_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 hover:bg-surface-container-low text-primary text-label-sm font-semibold transition-colors shadow-xs"
                title="Open live public digital business card"
              >
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                <span>View Live Card</span>
              </a>
            )}

            <button
              onClick={handleSignOut}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-label-sm font-semibold transition-all active:scale-[0.98] cursor-pointer"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[16px] text-error">logout</span>
              <span>Sign Out</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-[24px]">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-outline-variant/20 bg-surface-container-lowest px-4 py-3 space-y-1 shadow-float">
            <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 px-3 py-1">
              Customer Menu
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

            {customer?.profile_slug && (
              <a
                href={`/p/${customer.profile_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-label-md font-semibold text-primary hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                <span>View Live Card</span>
              </a>
            )}

            <div className="pt-2 mt-2 border-t border-outline-variant/20 flex items-center justify-between px-3 py-1.5">
              <span className="text-xs text-on-surface-variant truncate max-w-[200px]">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error-container/20 text-error text-xs font-semibold hover:bg-error-container/40 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
