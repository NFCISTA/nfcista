"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export const PortalContext = createContext({
  customer: null,
  user: null,
  loading: true,
  error: "",
  setCustomer: () => {},
});

export function usePortal() {
  return useContext(PortalContext);
}

export default function ClientPortalLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
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
        } else {
          const data = await res.json().catch(() => ({}));
          setProfileError(data.error || "Unable to load your client profile.");
        }
      } catch (err) {
        console.error("[portal] Client auth error:", err);
        setProfileError("Network error while loading your profile.");
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
        await fetch("/api/session", { method: "DELETE" });
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
            Loading your Client Portal...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navLinks = [
    { href: "/portal", label: "Overview", icon: "dashboard" },
    { href: "/portal/cards", label: "My NFC Cards", icon: "contactless" },
    ...(customer?.analytics_enabled
      ? [{ href: "/portal/analytics", label: "Analytics", icon: "insights" }]
      : []),
  ];

  return (
    <PortalContext.Provider
      value={{
        customer,
        user,
        loading,
        error: profileError,
        setCustomer,
      }}
    >
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col selection:bg-primary selection:text-white">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant/30 shadow-card">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            {/* Brand Logo & Client Portal Label */}
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/portal" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">contactless</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface text-base sm:text-lg tracking-tight">
                    NFCISTA
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                    Client Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Right Action Area */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {customer?.profile_slug && (
                <Link
                  href={`/p/${customer.profile_slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-xs font-semibold transition-all shadow-xs"
                  title="Preview Public Profile"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">open_in_new</span>
                  <span>View Card</span>
                </Link>
              )}

              {/* Customer User Pill */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/20">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[11px] font-bold">
                  {customer?.full_name ? customer.full_name.charAt(0).toUpperCase() : "C"}
                </div>
                <span className="text-xs font-semibold text-on-surface truncate max-w-[150px]">
                  {customer?.full_name || user.email}
                </span>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant/40 hover:bg-surface-container-low text-on-surface text-xs font-semibold transition-all active:scale-[0.98]"
                title="Sign Out"
              >
                <span className="material-symbols-outlined text-[16px] text-error">logout</span>
                <span>Sign Out</span>
              </button>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden inline-flex items-center justify-center p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {mobileMenuOpen ? "close" : "menu"}
                </span>
              </button>
            </div>
          </div>

          {/* Tier 2: Navigation Tab Strip */}
          <div className="border-t border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
              <nav
                className="flex items-center gap-1.5 py-2"
                aria-label="Client Portal Navigation"
              >
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-xs font-bold"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/70"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[18px] ${isActive ? "text-white" : "text-on-surface-variant/70"}`}>
                        {link.icon}
                      </span>
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t border-outline-variant/20 bg-surface-container-lowest px-4 py-3 space-y-2 shadow-float">
              <div className="space-y-1">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-primary text-white font-bold"
                          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {link.icon}
                      </span>
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              {customer?.profile_slug && (
                <div className="pt-1 border-t border-outline-variant/20">
                  <Link
                    href={`/p/${customer.profile_slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/5 border border-primary/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    <span>View Public Profile</span>
                  </Link>
                </div>
              )}

              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                <span className="text-xs text-on-surface-variant truncate max-w-[200px]">
                  {customer?.full_name || user.email}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-error text-xs font-semibold hover:bg-red-100 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </PortalContext.Provider>
  );
}
