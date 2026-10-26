"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleResetRequest(e) {
    e.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!isSupabaseConfigured) {
      setErrorMessage("Authentication service is temporarily unavailable. Please try again later.");
      return;
    }

    setIsLoading(true);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : "https://nfcista.vercel.app/reset-password";

      // Request password reset email from Supabase Auth
      await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      });

      // Always transition to submitted state to prevent email enumeration
      setIsSubmitted(true);
    } catch (err) {
      console.error("[forgot-password] Reset request error:", err);
      // Still show generic success state to avoid leaking user existence
      setIsSubmitted(true);
    } finally {
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
          href="/login"
          className="inline-flex items-center gap-1 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Sign In</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-[420px] bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-card flex flex-col space-y-6">
          {isSubmitted ? (
            /* Success confirmation (generic, anti-enumeration) */
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                <span className="material-symbols-outlined text-[30px]">mark_email_read</span>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                  Check your inbox
                </h1>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                  If an account exists for <span className="font-semibold text-on-surface">{email}</span>, we have sent instructions to reset your password.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 text-[11px] text-on-surface-variant text-left space-y-1">
                <p className="font-semibold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">info</span>
                  What to do next
                </p>
                <p>• Click the link in the email to set a new password.</p>
                <p>• Check your spam or promotions folder if it doesn&apos;t arrive within a few minutes.</p>
                <p>• The reset link expires according to security policy.</p>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  href="/login"
                  className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-btn-primary hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Return to Sign In</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="w-full py-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                >
                  Try another email address
                </button>
              </div>
            </div>
          ) : (
            /* Reset Request Form */
            <>
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-low text-primary flex items-center justify-center mx-auto border border-outline-variant/20 shadow-xs">
                  <span className="material-symbols-outlined text-[26px]">lock_reset</span>
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container-low text-primary border border-outline-variant/30">
                    Account Recovery
                  </span>
                  <h1 className="text-2xl font-bold text-on-surface tracking-tight mt-1.5">
                    Forgot password?
                  </h1>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Enter the email associated with your NFC card and we&apos;ll send you a link to reset your password.
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
              <form onSubmit={handleResetRequest} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-btn-primary hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending reset link...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                    </>
                  )}
                </button>
              </form>

              {/* Back to login option */}
              <div className="pt-2 text-center border-t border-outline-variant/20">
                <p className="text-xs text-on-surface-variant">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary font-bold hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer info */}
      <div className="max-w-6xl mx-auto w-full text-center py-2 text-xs text-on-surface-variant/70">
        NFCISTA Contactless Solutions • All data encrypted and secured via Supabase Auth
      </div>
    </div>
  );
}
