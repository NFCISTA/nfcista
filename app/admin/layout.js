"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
    supabase.auth.getSession().then(({ data: { session } }) => {
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
      await supabase.auth.signOut();
      router.replace("/admin/login");
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Top Admin Navigation */}
      <header className="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant/30 shadow-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
              N
            </span>
            <div>
              <span className="font-bold text-on-surface text-label-lg tracking-tight">
                NFCISTA
              </span>
              <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-container-low text-primary border border-outline-variant/20 uppercase tracking-wider">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-body-sm text-on-surface-variant font-medium truncate max-w-[200px]">
              {user.email}
            </span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-label-md font-semibold transition-all active:scale-[0.98]"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[16px] text-error">
                logout
              </span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content Shell */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
