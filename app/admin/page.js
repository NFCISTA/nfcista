"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboardPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setUser(user);
        }
      });
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-primary text-label-sm font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Authenticated Session</span>
            </div>
            <h1 className="text-headline-md font-bold text-on-surface">
              NFCISTA Admin Portal
            </h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Logged in as <span className="font-semibold text-on-surface">{user?.email || "Administrator"}</span>
            </p>
          </div>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-label-md font-semibold transition-all active:scale-[0.98] self-start sm:self-auto"
          >
            <span>View Public NFC Profile</span>
            <span className="material-symbols-outlined text-[18px]">
              open_in_new
            </span>
          </Link>
        </div>
      </div>

      {/* System Status Overview (No Customer Data, Pure Status) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Auth System Status */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">
                verified_user
              </span>
            </div>
            <div>
              <h2 className="text-label-lg font-bold text-on-surface">
                Admin Authentication
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Powered by Supabase Auth
              </p>
            </div>
          </div>
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            Your admin session is verified and protected. Password hashing, session rotation, and JWT validation are handled securely.
          </p>
        </div>

        {/* Database & RLS Security Status */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-low text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">
                shield_lock
              </span>
            </div>
            <div>
              <h2 className="text-label-lg font-bold text-on-surface">
                Database Security
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Row Level Security (RLS) Active
              </p>
            </div>
          </div>
          <p className="text-body-sm text-on-surface-variant leading-relaxed">
            The <code className="text-[12px] bg-surface-container-low px-1.5 py-0.5 rounded font-mono">customers</code> table is shielded against direct public scans. Single-slug lookup exposes only designated public fields.
          </p>
        </div>
      </div>

      {/* Architecture Notice */}
      <div className="bg-surface-container-low/60 border border-outline-variant/30 rounded-2xl p-5 text-body-sm text-on-surface-variant">
        <div className="flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[20px] text-primary flex-shrink-0 mt-0.5">
            info
          </span>
          <div>
            <p className="font-semibold text-on-surface mb-1">
              Admin Foundation Ready
            </p>
            <p className="leading-relaxed">
              Authentication is in place. Customer management, profile creation, and editing tools can now be safely built on top of this authenticated foundation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
