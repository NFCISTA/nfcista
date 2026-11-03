"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";

const DATE_FILTERS = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "overall", label: "Overall" },
];

export default function AdminAnalyticsPage() {
  const [filter, setFilter] = useState("today");
  const [selectedCardCode, setSelectedCardCode] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async (currentFilter, currentCard) => {
    setLoading(true);
    setError("");

    try {
      let url = `/api/admin/analytics?filter=${currentFilter}`;
      if (currentCard) {
        url += `&card_code=${encodeURIComponent(currentCard)}`;
      }

      const res = await fetch(url);
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error || "Failed to load admin analytics.");
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
    fetchAnalytics(filter, selectedCardCode);
  }, [filter, selectedCardCode, fetchAnalytics]);

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
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/review-cards"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Review Cards</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Review Assistant Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin conversion overview across all NFCISTA Google Review Cards (Asia/Kolkata).
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Card Selector Dropdown */}
          <select
            value={selectedCardCode}
            onChange={(e) => setSelectedCardCode(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 shadow-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            aria-label="Filter by review card"
          >
            <option value="">All Review Cards ({cards.length})</option>
            {cards.map((c) => (
              <option key={c.id} value={c.card_code}>
                {c.card_code} — {c.business_name}
              </option>
            ))}
          </select>

          {/* Date Filter Tabs */}
          <div
            role="group"
            aria-label="Filter analytics by date"
            className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200"
          >
            {DATE_FILTERS.map((df) => {
              const isActive = filter === df.id;
              return (
                <button
                  key={df.id}
                  type="button"
                  onClick={() => setFilter(df.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  aria-pressed={isActive}
                >
                  {df.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loading && !data && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Aggregating analytics events...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
          <p className="text-xs text-red-700 font-medium">{error}</p>
          <button
            onClick={() => fetchAnalytics(filter, selectedCardCode)}
            className="px-4 py-1.5 rounded-xl bg-white border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-100 transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {data && (
        <>
          {/* KPI Summary Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Card Visits</span>
                <span className="material-symbols-outlined text-[20px] text-blue-600">contactless</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{totals.card_visits.toLocaleString()}</div>
              <p className="text-[11px] text-slate-500 mt-1">NFC / QR /r/[cardCode] visits</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Review Pageviews</span>
                <span className="material-symbols-outlined text-[20px] text-indigo-600">visibility</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{totals.page_views.toLocaleString()}</div>
              <p className="text-[11px] text-slate-500 mt-1">Review Assistant page renders</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Drafts Generated</span>
                <span className="material-symbols-outlined text-[20px] text-amber-600">auto_awesome</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{totals.drafts_generated.toLocaleString()}</div>
              <p className="text-[11px] text-slate-500 mt-1">Natural review drafts created</p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Drafts Copied</span>
                <span className="material-symbols-outlined text-[20px] text-emerald-600">content_copy</span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900">{totals.drafts_copied.toLocaleString()}</div>
              <p className="text-[11px] text-slate-500 mt-1">{rates.draft_copy_rate}% of generated drafts</p>
            </div>

            <div className="col-span-2 lg:col-span-1 bg-blue-50/70 border border-blue-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between text-blue-900 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Google Clicks</span>
                <span className="material-symbols-outlined text-[20px] text-blue-700">open_in_new</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-blue-950">{totals.google_clicks.toLocaleString()}</div>
              <p className="text-[11px] text-blue-700 font-medium mt-1">{rates.review_intent_rate}% intent rate</p>
            </div>
          </div>

          {/* Cards Breakdown Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Performance by Review Card ({cards.length})
              </h2>
              {selectedCardCode && (
                <button
                  onClick={() => setSelectedCardCode("")}
                  className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  Clear card filter
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Card Code</th>
                    <th className="px-4 py-3">Business Name</th>
                    <th className="px-4 py-3 text-right">Card Visits</th>
                    <th className="px-4 py-3 text-right">Pageviews</th>
                    <th className="px-4 py-3 text-right">Drafts</th>
                    <th className="px-4 py-3 text-right">Copied</th>
                    <th className="px-4 py-3 text-right">Google Clicks</th>
                    <th className="px-4 py-3 text-right">Intent Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {cards.map((c) => {
                    const isSelected = selectedCardCode === c.card_code;
                    return (
                      <tr
                        key={c.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          isSelected ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-mono font-bold text-blue-700">
                          <button
                            type="button"
                            onClick={() => setSelectedCardCode(isSelected ? "" : c.card_code)}
                            className="hover:underline cursor-pointer"
                          >
                            {c.card_code}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-slate-900 font-semibold">{c.business_name}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">{c.metrics?.card_visits || 0}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-900 font-bold">{c.metrics?.page_views || 0}</td>
                        <td className="px-4 py-3 text-right font-mono text-amber-700">{c.metrics?.drafts_generated || 0}</td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-700">{c.metrics?.drafts_copied || 0}</td>
                        <td className="px-4 py-3 text-right font-mono text-blue-800 font-bold">{c.metrics?.google_clicks || 0}</td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">
                          {c.metrics?.review_intent_rate || 0}%
                        </td>
                      </tr>
                    );
                  })}
                  {cards.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        No review cards found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
