"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function CustomerEnquiriesPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'
  const [unreadCount, setUnreadCount] = useState(0);
  const [deliverySettings, setDeliverySettings] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch(`/api/customer/enquiries?filter=${filter}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to load enquiries.");
      } else {
        setEnquiries(data.enquiries || []);
        setUnreadCount(data.unread_count || 0);
        setDeliverySettings(data.delivery_settings || null);
      }
    } catch {
      setError("Network error while loading your enquiries.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadEnquiries();
  }, [loadEnquiries]);

  async function handleToggleRead(enquiry) {
    if (updatingId) return;
    setUpdatingId(enquiry.id);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const newStatus = !enquiry.is_read;

      const res = await fetch(`/api/customer/enquiries/${enquiry.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ is_read: newStatus }),
      });

      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === enquiry.id ? { ...e, is_read: newStatus } : e))
        );
        setUnreadCount((c) => (newStatus ? Math.max(0, c - 1) : c + 1));
      }
    } catch {
      // Non-fatal
    } finally {
      setUpdatingId(null);
    }
  }

  function formatTimestamp(isoString) {
    if (!isoString) return "";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-8 shadow-card">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Enquiries</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-bold bg-primary text-on-primary rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Leads and messages sent by visitors through your public profile.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-1 bg-surface-container-low rounded-2xl self-start sm:self-auto border border-outline-variant/20">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "all"
                ? "bg-surface-container-lowest text-on-surface shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            All Enquiries
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === "unread"
                ? "bg-surface-container-lowest text-on-surface shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Unread Only ({unreadCount})
          </button>
        </div>
      </div>

      {/* ── Status Banner if Enquiry is OFF ──────────────── */}
      {deliverySettings && !deliverySettings.enquiry_enabled && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-amber-600">info</span>
            <span>The Enquiry Form is currently <strong>disabled</strong> on your public card.</span>
          </div>
          <Link
            href="/dashboard/profile"
            className="font-bold text-primary hover:underline shrink-0"
          >
            Enable in Profile Settings →
          </Link>
        </div>
      )}

      {/* ── Content Area ─────────────────────────────────── */}
      {loading ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-12 text-center space-y-3 shadow-card">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-body-sm text-on-surface-variant font-medium">Loading enquiries...</p>
        </div>
      ) : error ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 text-center space-y-3 shadow-card">
          <p className="text-body-sm text-error font-medium">{error}</p>
          <button
            type="button"
            onClick={loadEnquiries}
            className="text-xs text-primary font-bold hover:underline"
          >
            Try Again
          </button>
        </div>
      ) : enquiries.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-12 text-center space-y-3 shadow-card max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-low text-on-surface-variant/60 flex items-center justify-center mx-auto border border-outline-variant/20">
            <span className="material-symbols-outlined text-[30px]">mail</span>
          </div>
          <h2 className="text-base font-bold text-on-surface">No enquiries received yet</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Visitors who tap &ldquo;Send Enquiry&rdquo; on your public profile will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {enquiries.map((enquiry) => {
            const visitorPhoneDigits = enquiry.visitor_phone.replace(/\D/g, "");
            const waUrl = visitorPhoneDigits
              ? `https://wa.me/${visitorPhoneDigits}`
              : null;
            const telUrl = `tel:${enquiry.visitor_phone.trim()}`;

            return (
              <div
                key={enquiry.id}
                className={`bg-surface-container-lowest border rounded-2xl p-5 transition-all shadow-card ${
                  enquiry.is_read
                    ? "border-outline-variant/20 opacity-90"
                    : "border-primary/30 ring-1 ring-primary/10"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-on-surface text-sm sm:text-base">
                        {enquiry.visitor_name}
                      </span>
                      {!enquiry.is_read && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full">
                          NEW
                        </span>
                      )}
                      <span className="text-[11px] text-on-surface-variant">
                        {formatTimestamp(enquiry.created_at)}
                      </span>
                    </div>

                    {/* Contact detail row */}
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant flex-wrap pt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">phone</span>
                        {enquiry.visitor_phone}
                      </span>
                      {enquiry.visitor_email && (
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">mail</span>
                          {enquiry.visitor_email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    {/* Mark Read/Unread */}
                    <button
                      type="button"
                      disabled={updatingId === enquiry.id}
                      onClick={() => handleToggleRead(enquiry)}
                      className="px-2.5 py-1.5 rounded-xl border border-outline-variant/30 hover:bg-surface-container-low text-on-surface-variant text-[11px] font-medium transition-colors"
                      title={enquiry.is_read ? "Mark as unread" : "Mark as read"}
                    >
                      {enquiry.is_read ? "Mark Unread" : "Mark Read"}
                    </button>

                    {/* WhatsApp Reply */}
                    {waUrl && (
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white text-[11px] font-semibold transition-colors shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[13px]">chat</span>
                        WhatsApp
                      </a>
                    )}

                    {/* Call */}
                    <a
                      href={telUrl}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-[11px] font-semibold transition-colors border border-outline-variant/30"
                    >
                      <span className="material-symbols-outlined text-[13px]">call</span>
                      Call
                    </a>
                  </div>
                </div>

                {/* Message body */}
                <div className="mt-3.5 p-3.5 bg-surface-container-low/60 rounded-xl border border-outline-variant/10 text-xs text-on-surface leading-relaxed whitespace-pre-wrap">
                  {enquiry.message}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
