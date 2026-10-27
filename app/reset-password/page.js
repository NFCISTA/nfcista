"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLinkInvalid, setIsLinkInvalid] = useState(false);
  const [isRecoveryAuthorized, setIsRecoveryAuthorized] = useState(false);
  const recoveryGrantedRef = useRef(false);
  const recoveryCredentialRef = useRef({ accessToken: null, tokenHash: null });

  useEffect(() => {
    let isMounted = true;

    async function initRecoverySession() {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setIsLinkInvalid(true);
          setErrorMessage("Authentication service is temporarily unavailable.");
          setIsVerifying(false);
        }
        return;
      }

      try {
        // 1. Check for PKCE authorization code in query params (?code=...)
        const code = searchParams.get("code");
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error("[reset-password] Exchange code error:", error.message);
            if (isMounted) {
              setIsLinkInvalid(true);
              setIsVerifying(false);
            }
            return;
          }
          if (isMounted) {
            if (data?.session?.access_token) {
              recoveryCredentialRef.current.accessToken = data.session.access_token;
            }
            recoveryGrantedRef.current = true;
            setIsRecoveryAuthorized(true);
            setIsLinkInvalid(false);
            setIsVerifying(false);
          }
          return;
        }

        // 2. Check for token_hash and type in query params (?token_hash=...&type=recovery)
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        if (tokenHash && type === "recovery") {
          recoveryCredentialRef.current.tokenHash = tokenHash;
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (error) {
            console.error("[reset-password] Verify OTP error:", error.message);
            if (isMounted) {
              setIsLinkInvalid(true);
              setIsVerifying(false);
            }
            return;
          }
          if (isMounted) {
            if (data?.session?.access_token) {
              recoveryCredentialRef.current.accessToken = data.session.access_token;
            }
            recoveryGrantedRef.current = true;
            setIsRecoveryAuthorized(true);
            setIsLinkInvalid(false);
            setIsVerifying(false);
          }
          return;
        }

        // 3. Listen for auth state change event — accept ONLY PASSWORD_RECOVERY.
        // Captures recovery session token delivered via URL hash fragment or internal event.
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "PASSWORD_RECOVERY") {
            if (session?.access_token) {
              recoveryCredentialRef.current.accessToken = session.access_token;
            }
            recoveryGrantedRef.current = true;
            if (isMounted) {
              setIsRecoveryAuthorized(true);
              setIsLinkInvalid(false);
              setIsVerifying(false);
            }
          }
        });

        // 4. Enforce explicit recovery grant via ref to prevent stale-closure timing issues.
        // We do NOT check supabase.auth.getSession() here, ensuring normal active sessions
        // cannot unlock the password reset form.
        const timeout = setTimeout(() => {
          if (isMounted && !recoveryGrantedRef.current) {
            setIsLinkInvalid(true);
            setIsVerifying(false);
          }
        }, 1200);

        return () => {
          clearTimeout(timeout);
          authListener?.subscription?.unsubscribe();
        };
      } catch (err) {
        console.error("[reset-password] Initialization exception:", err);
        if (isMounted) {
          setIsLinkInvalid(true);
          setIsVerifying(false);
        }
      }
    }

    initRecoverySession();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setErrorMessage("");

    if (!isRecoveryAuthorized || !recoveryGrantedRef.current) {
      setErrorMessage("Password recovery session is missing or expired. Please request a new link.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setIsSubmitting(true);

    try {
      // POST new password plus recovery credentials to dedicated server endpoint
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword,
          accessToken: recoveryCredentialRef.current.accessToken,
          tokenHash: recoveryCredentialRef.current.tokenHash,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to update password. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Invalidate recovery session and credentials from memory
      recoveryCredentialRef.current = { accessToken: null, tokenHash: null };
      try {
        await supabase.auth.signOut();
      } catch {
        // Non-blocking
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("[reset-password] Update error:", err);
      setErrorMessage("An unexpected error occurred while resetting your password.");
    } finally {
      setIsSubmitting(false);
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
          {/* Loading verification state */}
          {isVerifying && (
            <div className="text-center py-12 space-y-3">
              <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-sm font-medium text-on-surface">
                Verifying recovery link...
              </p>
              <p className="text-xs text-on-surface-variant">
                Please wait while we secure your session.
              </p>
            </div>
          )}

          {/* Invalid or Expired link state */}
          {!isVerifying && isLinkInvalid && !isSuccess && (
            <div className="text-center space-y-4 py-2 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-error-container/20 text-error flex items-center justify-center mx-auto border border-error/20 shadow-xs">
                <span className="material-symbols-outlined text-[30px]">link_off</span>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                  Invalid or Expired Link
                </h1>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                  This password reset link is invalid, expired, or has already been used. For your security, reset links are single-use.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 text-[11px] text-on-surface-variant text-left space-y-1">
                <p className="font-semibold text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-primary">help</span>
                  Need to reset your password?
                </p>
                <p>• Request a new reset link from the forgot password page.</p>
                <p>• Use the newest link sent to your email inbox.</p>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  href="/forgot-password"
                  className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-btn-primary hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                  <span>Request New Reset Link</span>
                </Link>

                <Link
                  href="/login"
                  className="w-full inline-block py-2 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors text-center cursor-pointer"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          )}

          {/* Success state */}
          {!isVerifying && isSuccess && (
            <div className="text-center space-y-4 py-2 animate-fadeIn">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                <span className="material-symbols-outlined text-[30px]">check_circle</span>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                  Password Updated
                </h1>
                <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                  Your password has been successfully reset. You can now sign in to your NFCISTA customer dashboard using your new credentials.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-btn-primary hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sign In with New Password</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          )}

          {/* Active password reset form */}
          {!isVerifying && !isLinkInvalid && !isSuccess && isRecoveryAuthorized && (
            <>
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-low text-primary flex items-center justify-center mx-auto border border-outline-variant/20 shadow-xs">
                  <span className="material-symbols-outlined text-[26px]">password</span>
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container-low text-primary border border-outline-variant/30">
                    Security Verification
                  </span>
                  <h1 className="text-2xl font-bold text-on-surface tracking-tight mt-1.5">
                    Set new password
                  </h1>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Choose a strong password with at least 6 characters.
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

              {/* Reset Form */}
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="new-password" className="block text-xs font-bold text-on-surface">
                      New Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="text-[11px] font-medium text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-bold text-on-surface mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-[11px] text-on-surface-variant space-y-1">
                  <p className="font-semibold text-on-surface">Password requirements:</p>
                  <p className={newPassword.length >= 6 ? "text-emerald-600 font-medium" : ""}>
                    • Minimum 6 characters
                  </p>
                  <p className={newPassword && newPassword === confirmPassword ? "text-emerald-600 font-medium" : ""}>
                    • Passwords must match
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary text-sm font-bold shadow-btn-primary hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating password...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <span className="material-symbols-outlined text-[18px]">check</span>
                    </>
                  )}
                </button>
              </form>
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

function ResetPasswordFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
