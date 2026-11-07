"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePortal } from "../layout";
import { supabase } from "@/lib/supabaseClient";

const DATE_FILTERS = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "overall", label: "Overall" },
];

export default function PortalAnalyticsPage() {
  const { customer, loading: portalLoading } = usePortal();
  const [filter, setFilter] = useState("today");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async (currentFilter) => {
    setLoading(true);
    setError("");

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/customer/analytics?filter=${currentFilter}`, {
        headers,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error || "Failed to load analytics data.");
        setData(null);
        return;
      }

      setData(json);
    } catch {
      setError("Network connection error. Please refresh to reload analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!portalLoading) {
      if (customer && customer.analytics_enabled) {
        fetchAnalytics(filter);
      } else {
        setLoading(false);
      }
    }
  }, [customer, portalLoading, filter, fetchAnalytics]);

  if (portalLoading || (loading && !data)) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-12 text-center space-y-3 shadow-card">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-body-sm text-on-surface-variant font-medium">Loading your Review Assistant analytics...</p>
      </div>
    );
  }

  // 1. Not Enabled State
  if (customer && !customer.analytics_enabled) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-card max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto border border-slate-200">
          <span className="material-symbols-outlined text-[32px]">lock</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-on-surface">Analytics Not Enabled</h2>
          <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">
            Review Assistant analytics are currently not enabled for your account. Please reach out to your NFCISTA account manager to activate live customer conversion analytics.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/portal"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Return to Overview</span>
          </Link>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error && !data) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 text-center space-y-4 shadow-card max-w-xl mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[28px]">error</span>
        </div>
        <p className="text-body-sm text-error font-medium">{error}</p>
        <button
          type="button"
          onClick={() => fetchAnalytics(filter)}
          className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface text-xs font-semibold hover:bg-surface-container transition-all cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // 3. No Cards Assigned State
  if (data && !data.has_assigned_cards) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-card max-w-xl mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
          <span className="material-symbols-outlined text-[32px]">contactless</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-on-surface">No Review Cards Connected Yet</h2>
          <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">
            Your analytics access is enabled, but no physical Google Review Cards have been linked to your profile yet. Once your card is paired by our team, real-time tap and review metrics will appear here.
          </p>
        </div>
      </div>
    );
  }

  const totals = data?.totals || {
    card_visits: 0,
    page_views: 0,
    drafts_generated: 0,
    drafts_copied: 0,
    google_clicks: 0,
  };

  const rates = data?.rates || { review_intent_rate: 0, draft_copy_rate: 0 };
  const cards = data?.cards || [];

  return (
    <div className="space-y-6">
      {/* Page Header & Date Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">
              Review Assistant Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              Live Metrics
            </span>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Real-time customer engagement and review conversion funnel (Asia/Kolkata).
          </p>
        </div>

        {/* Date Filter Tabs */}
        <div
          role="group"
          aria-label="Filter analytics by date"
          className="inline-flex items-center p-1 bg-surface-container-low rounded-2xl border border-outline-variant/30 shrink-0 self-start sm:self-auto"
        >
          {DATE_FILTERS.map((df) => {
            const isActive = filter === df.id;
            return (
              <button
                key={df.id}
                type="button"
                onClick={() => setFilter(df.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-primary shadow-xs ring-1 ring-black/5"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
                aria-pressed={isActive}
              >
                {df.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Metric 1: Card Visits */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Card Visits</span>
            <span className="material-symbols-outlined text-[20px] text-blue-600">contactless</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            {totals.card_visits.toLocaleString()}
          </div>
          <p className="text-[11px] text-on-surface-variant/80 mt-1">Direct hardware taps / scans</p>
        </div>

        {/* Metric 2: Review Page Views */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Review Pageviews</span>
            <span className="material-symbols-outlined text-[20px] text-indigo-600">visibility</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            {totals.page_views.toLocaleString()}
          </div>
          <p className="text-[11px] text-on-surface-variant/80 mt-1">Customers on review screen</p>
        </div>

        {/* Metric 3: Drafts Generated */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Drafts Generated</span>
            <span className="material-symbols-outlined text-[20px] text-amber-600">auto_awesome</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            {totals.drafts_generated.toLocaleString()}
          </div>
          <p className="text-[11px] text-on-surface-variant/80 mt-1">Natural review drafts created</p>
        </div>

        {/* Metric 4: Drafts Copied */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Drafts Copied</span>
            <span className="material-symbols-outlined text-[20px] text-emerald-600">content_copy</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            {totals.drafts_copied.toLocaleString()}
          </div>
          <p className="text-[11px] text-on-surface-variant/80 mt-1">
            {rates.draft_copy_rate}% of generated drafts
          </p>
        </div>

        {/* Metric 5: Google Review Clicks */}
        <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 border border-blue-200/60 rounded-2xl p-4 sm:p-5 shadow-card">
          <div className="flex items-center justify-between text-blue-900 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Google Clicks</span>
            <span className="material-symbols-outlined text-[20px] text-blue-700">open_in_new</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">
            {totals.google_clicks.toLocaleString()}
          </div>
          <p className="text-[11px] text-blue-700 font-medium mt-1">
            {rates.review_intent_rate}% conversion rate
          </p>
        </div>
      </div>

      {/* Review Funnel Visualization */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
        <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">
          Review Engagement Funnel
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="text-xs font-semibold text-slate-500 mb-1">1. Review Visits</div>
            <div className="text-xl font-bold text-slate-900">{totals.page_views}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">100% Top of Funnel</div>
          </div>

          <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-2xl">
            <div className="text-xs font-semibold text-amber-700 mb-1">2. Drafts Created</div>
            <div className="text-xl font-bold text-amber-950">{totals.drafts_generated}</div>
            <div className="text-[10px] text-amber-700 mt-0.5">
              {totals.page_views > 0 ? Math.round((totals.drafts_generated / totals.page_views) * 100) : 0}% of visitors
            </div>
          </div>

          <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
            <div className="text-xs font-semibold text-emerald-700 mb-1">3. Drafts Copied</div>
            <div className="text-xl font-bold text-emerald-950">{totals.drafts_copied}</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">
              {totals.page_views > 0 ? Math.round((totals.drafts_copied / totals.page_views) * 100) : 0}% copied text
            </div>
          </div>

          <div className="p-3.5 bg-blue-50 border border-blue-200/80 rounded-2xl">
            <div className="text-xs font-semibold text-blue-800 mb-1">4. Proceeded to Google</div>
            <div className="text-xl font-black text-blue-950">{totals.google_clicks}</div>
            <div className="text-[10px] text-blue-700 font-medium mt-0.5">
              {rates.review_intent_rate}% overall intent
            </div>
          </div>
        </div>

        {/* Transparency Notice */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5 text-slate-600 text-xs">
          <span className="material-symbols-outlined text-[18px] text-slate-400 shrink-0 mt-0.5">info</span>
          <p className="leading-relaxed text-[11px]">
            <strong>Note on Review Verification:</strong> Google Review clicks measure customers who tapped through to leave feedback on Google Maps. Due to Google’s privacy architecture, verified published reviews appear directly inside your official Google Business Profile.
          </p>
        </div>
      </div>

      {/* Assigned Review Cards Breakdown */}
      {cards.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-6 shadow-card space-y-4">
          <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider">
            Connected Cards ({cards.length})
          </h2>
          <div className="divide-y divide-slate-100">
            {cards.map((c) => (
              <div key={c.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {c.card_code}
                    </span>
                    <span className="text-sm font-bold text-slate-900">{c.business_name}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 capitalize">
                    Category: {c.category?.replace(/_/g, " ")}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Visits</span>
                    <span className="text-slate-900 font-bold">{c.metrics?.page_views || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Drafts</span>
                    <span className="text-slate-900 font-bold">{c.metrics?.drafts_generated || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase">Google Clicks</span>
                    <span className="text-blue-600 font-bold">{c.metrics?.google_clicks || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
