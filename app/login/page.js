"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function CustomerLoginPage() {
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

      // Establish HttpOnly server session for proxy gating
      if (data?.session?.access_token) {
        try {
          await fetch("/api/session", {
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

      // Redirect to customer dashboard
      router.replace("/dashboard");
    } catch {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 sm:p-6 bg-[#F8FAFC] selection:bg-primary selection:text-white">
      {/* Top Header Link */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[18px]">contactless</span>
          </div>
          <span className="font-bold tracking-tight text-on-surface text-base">
            NFCISTA
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-[420px] bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-card flex flex-col space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-low text-primary flex items-center justify-center mx-auto border border-outline-variant/20 shadow-xs">
              <span className="material-symbols-outlined text-[26px]">badge</span>
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container-low text-primary border border-outline-variant/30">
                Customer Portal
              </span>
              <h1 className="text-2xl font-bold text-on-surface tracking-tight mt-1.5">
                Sign in to your card
              </h1>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Manage your digital business profile, update contact links, and keep your NFC card fresh.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs flex items-start gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-on-surface mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-bold text-on-surface">
                  Password
                </label>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-btn-primary hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-6xl mx-auto w-full text-center py-2 text-xs text-on-surface-variant/70">
        NFCISTA Contactless Solutions • All data encrypted and secured via Supabase Auth
      </div>
    </div>
  );
}
