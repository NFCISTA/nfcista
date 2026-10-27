"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * CustomerSecuritySection
 * 
 * Wave 3: Customer Account & Login Security Management
 * Allows authenticated customers to view account login details and
 * update their password directly from the dashboard.
 * 
 * Strict boundary rules:
 * - Completely isolated from customer profile details form.
 * - Zero references to admin routes or service roles.
 * - Submitting password changes never triggers profile updates.
 */
export default function CustomerSecuritySection({ customer }) {
  const [userEmail, setUserEmail] = useState("");
  const [lastSignIn, setLastSignIn] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const successTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    async function loadAccountInfo() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserEmail(session.user.email || customer?.email || "");
          if (session.user.last_sign_in_at) {
            setLastSignIn(new Date(session.user.last_sign_in_at).toLocaleString());
          }
        } else if (customer?.email) {
          setUserEmail(customer.email);
        }
      } catch {
        if (customer?.email) {
          setUserEmail(customer.email);
        }
      }
    }

    loadAccountInfo();
  }, [customer?.email]);

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please re-enter.");
      return;
    }

    setUpdating(true);

    try {
      // Verify an active customer session exists prior to update
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setErrorMsg(error.message || "Failed to update password.");
        return;
      }

      // Clear password fields immediately upon successful update
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg("Password updated successfully! Your account credentials have been saved.");
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccessMsg(""), 6000);
    } catch (err) {
      setErrorMsg(err.message || "An unexpected error occurred while updating your password.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-surface-container-low text-primary flex items-center justify-center shrink-0 border border-outline-variant/20 shadow-xs">
          <span className="material-symbols-outlined text-[26px]">security</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-on-surface tracking-tight">
              Account &amp; Login Security
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Security
            </span>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1 leading-relaxed">
            Manage your credentials and view your customer authentication status.
          </p>
        </div>
      </div>

      {/* Account Info Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-surface-container-low/40 border border-outline-variant/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
            Login Email
          </span>
          <span className="font-semibold text-on-surface text-sm break-all block">
            {userEmail || "Loading..."}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-container-low/40 border border-outline-variant/20 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
            Last Sign In
          </span>
          <span className="font-medium text-on-surface text-sm block">
            {lastSignIn || "Current active session"}
          </span>
        </div>
      </div>

      {/* Password Change Subform */}
      <div className="pt-2 border-t border-outline-variant/20 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-on-surface">Change Password</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Update your account password with at least 6 characters.
          </p>
        </div>

        {/* Feedback messages */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs flex items-start gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span className="font-medium leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-[18px] shrink-0 text-emerald-600">check_circle</span>
            <span className="font-medium leading-relaxed">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="customer-new-password"
                  className="block text-xs font-bold text-on-surface"
                >
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
                id="customer-new-password"
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
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="customer-confirm-password"
                  className="block text-xs font-bold text-on-surface"
                >
                  Confirm New Password
                </label>
              </div>
              <input
                id="customer-confirm-password"
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
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low/50 border border-outline-variant/20 text-[11px] text-on-surface-variant space-y-1">
            <p className="font-semibold text-on-surface">Password requirements:</p>
            <p className={newPassword.length >= 6 ? "text-emerald-700 font-medium" : ""}>
              • Minimum 6 characters
            </p>
            <p className={newPassword && newPassword === confirmPassword ? "text-emerald-700 font-medium" : ""}>
              • Passwords must match
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={updating || !newPassword || !confirmPassword}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-btn-primary hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer flex items-center gap-2"
            >
              {updating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
