"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!isSupabaseConfigured) {
      setErrorMessage("Supabase is not configured. Please check environment variables.");
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // User-friendly error message mapping
        if (error.message.toLowerCase().includes("invalid login credentials")) {
          setErrorMessage("Invalid email or password. Please check your credentials and try again.");
        } else if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMessage("Your email address has not been confirmed yet. Please verify your email.");
        } else {
          setErrorMessage(error.message);
        }
        setIsLoading(false);
        return;
      }

      // Establish HttpOnly server session for proxy gating (never in document.cookie)
      if (data?.session?.access_token) {
        try {
          await fetch("/api/admin/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: data.session.access_token,
              expires_in: data.session.expires_in,
            }),
          });
        } catch {
          // Non-blocking fallback
        }
      }

      // Successful authentication -> redirect to /admin
      router.replace("/admin");
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#F8FAFC]">
      <div className="w-full max-w-[420px] bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-card flex flex-col">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-surface-container-low text-primary flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[26px]">
              admin_panel_settings
            </span>
          </div>
          <h1 className="text-headline-md font-bold text-on-surface">
            NFCISTA Admin
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant font-medium">
            Sign in to access your administrative portal
          </p>
        </div>

        {/* Error Message Box */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-error-container/40 border border-error/30 text-on-error-container flex items-start gap-2.5 text-body-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-error flex-shrink-0 mt-0.5">
              error
            </span>
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="admin-email"
              className="block text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="admin-email"
                type="email"
                name="email"
                autoComplete="email"
                autoFocus
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nfcista.com"
                className="w-full h-12 pl-10 pr-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
                mail
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type="password"
                name="password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-12 pl-10 pr-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
                lock
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 mt-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-label-lg flex items-center justify-center gap-2 shadow-btn-primary transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-5 border-t border-outline-variant/20 flex items-center justify-between text-body-sm text-on-surface-variant">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-primary transition-colors text-label-md font-medium"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            <span>Public Profile</span>
          </Link>

          <span className="text-[11px] text-tertiary">
            Secured by Supabase Auth
          </span>
        </div>
      </div>
    </div>
  );
}
