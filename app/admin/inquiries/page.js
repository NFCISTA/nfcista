"use client";

import { useState, useEffect, useCallback } from "react";

const STATUS_CONFIG = {
  new: { label: "New", className: "bg-blue-100 text-blue-800 border-blue-200" },
  contacted: { label: "Contacted", className: "bg-amber-100 text-amber-800 border-amber-200" },
  closed: { label: "Closed", className: "bg-gray-100 text-gray-700 border-gray-200" },
};

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function cleanPhoneForWhatsApp(rawPhone) {
  if (!rawPhone) return "";
  const digits = String(rawPhone).replace(/\D/g, "");
  // If 10 digits (standard Indian mobile), prepend 91
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [migrationPending, setMigrationPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inquiries");
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (json.migration_pending || res.status === 503) {
          setMigrationPending(true);
        } else if (res.status === 401 || res.status === 403) {
          setError("Administrator session expired or unauthorized. Please sign in again.");
        } else {
          setError(json.error || "Failed to load inquiries. Please try again.");
        }
        return;
      }

      setInquiries(json.inquiries || []);
      setMigrationPending(Boolean(json.migration_pending));
    } catch {
      setError("Network error while connecting to inquiry service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  async function updateStatus(id, newStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(json.error || "Failed to update status.");
        return;
      }

      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
    } catch {
      alert("Network error while updating status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered =
    filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);

  const counts = {
    all: inquiries.length,
    new: inquiries.filter((i) => i.status === "new").length,
    contacted: inquiries.filter((i) => i.status === "contacted").length,
    closed: inquiries.filter((i) => i.status === "closed").length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-outline-variant/30">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface">Direct Inquiries</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              B2B Store
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Customer inquiries and quote requests submitted through the NFCISTA storefront.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          disabled={loading}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-2 rounded-xl text-xs font-semibold text-primary border border-outline-variant/50 hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-[16px] ${loading ? "animate-spin" : ""}`}>
            refresh
          </span>
          <span>{loading ? "Refreshing…" : "Refresh List"}</span>
        </button>
      </div>

      {/* Migration Pending Notice */}
      {migrationPending && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 sm:p-6 text-amber-900 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 text-[24px] shrink-0 mt-0.5">
              database
            </span>
            <div className="space-y-1 flex-1">
              <h2 className="text-base font-bold text-amber-950">
                Database Migration Pending: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs text-amber-900">company_inquiries</code>
              </h2>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                The database table for company inquiries has not been created in your Supabase project yet. Once the SQL migration is applied, incoming inquiries will appear here automatically.
              </p>
            </div>
          </div>

          <div className="bg-white/80 border border-amber-200/80 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="font-semibold text-amber-950 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-amber-700">info</span>
              <span>How to apply this migration in Supabase:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-amber-900 pl-1">
              <li>Log in to your <strong>Supabase Dashboard</strong> and select your project.</li>
              <li>Click <strong>SQL Editor</strong> in the left sidebar.</li>
              <li>Open or copy the script from <code className="font-mono bg-amber-100 px-1 rounded text-[11px]">supabase/migrations/20261028000000_create_company_inquiries.sql</code>.</li>
              <li>Paste it into the query window and click <strong>Run</strong>.</li>
              <li>Return here and click <strong>Refresh List</strong> above.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Generic Error Notice */}
      {error && !migrationPending && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-3">
          <span className="material-symbols-outlined text-red-600 text-[20px] shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      {!migrationPending && !error && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["all", "new", "contacted", "closed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize border transition-colors shrink-0 ${
                filter === tab
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "border-outline-variant/60 text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !migrationPending && !error && filtered.length === 0 && (
        <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl">
          <span className="material-symbols-outlined text-[36px] text-on-surface-variant/40 mb-2">
            inbox
          </span>
          <p className="text-sm font-semibold text-on-surface">No inquiries found</p>
          <p className="text-xs text-on-surface-variant mt-1">
            {filter === "all"
              ? "New quote requests from the homepage will appear here."
              : `There are currently no inquiries marked as "${filter}".`}
          </p>
        </div>
      )}

      {/* Inquiries Table */}
      {!loading && !migrationPending && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low/50 border-b border-outline-variant/30 text-xs font-bold uppercase tracking-wider text-on-surface-variant/80">
              <tr>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Name</th>
                <th className="px-4 py-3.5">Shop / Business</th>
                <th className="px-4 py-3.5">Phone</th>
                <th className="px-4 py-3.5">Product</th>
                <th className="px-4 py-3.5">Message</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.map((inq) => {
                const waPhone = cleanPhoneForWhatsApp(inq.phone);
                return (
                  <tr key={inq.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-4 py-3 text-xs text-on-surface-variant whitespace-nowrap">
                      {formatDate(inq.created_at)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-on-surface whitespace-nowrap">
                      {inq.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs whitespace-nowrap">
                      {inq.shop_name || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-on-surface">
                          {inq.phone || "—"}
                        </span>
                        {waPhone && (
                          <a
                            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                              `Hi ${inq.name || ""}, thank you for contacting NFCISTA regarding ${
                                inq.product_interest || "our NFC cards"
                              }. How can we assist you?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 p-1 rounded-md hover:bg-emerald-50 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <span className="material-symbols-outlined text-[16px]">chat</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-surface-container-low border border-outline-variant/30 font-medium">
                        {inq.product_interest || "General"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant max-w-[220px]">
                      <span className="line-clamp-2" title={inq.message || ""}>
                        {inq.message || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={inq.status || "new"}
                        disabled={updatingId === inq.id}
                        onChange={(e) => updateStatus(inq.id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:ring-2 focus:ring-primary/20 outline-none transition-colors ${
                          STATUS_CONFIG[inq.status]?.className || STATUS_CONFIG.new.className
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16 text-on-surface-variant text-sm">
          <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
          <p>Loading inquiries…</p>
        </div>
      )}
    </div>
  );
}
