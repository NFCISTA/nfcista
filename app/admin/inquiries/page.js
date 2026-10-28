"use client";

import { useState, useEffect, useCallback } from "react";

const STATUS_LABELS = {
  new: { label: "New", className: "bg-blue-100 text-blue-800" },
  contacted: { label: "Contacted", className: "bg-amber-100 text-amber-800" },
  closed: { label: "Closed", className: "bg-gray-100 text-gray-600" },
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

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [migrationPending, setMigrationPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null); // id of inquiry being updated
  const [filter, setFilter] = useState("all"); // all | new | contacted | closed

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inquiries");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load inquiries.");
        return;
      }
      setInquiries(json.inquiries || []);
      setMigrationPending(json.migration_pending || false);
    } catch (err) {
      setError("Network error while loading inquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  async function updateStatus(id, newStatus) {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
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
      setUpdating(null);
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
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-on-surface">Direct Inquiries</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            B2B quote requests submitted via the homepage inquiry form.
          </p>
        </div>
        <button
          onClick={fetchInquiries}
          disabled={loading}
          className="text-sm text-primary border border-outline-variant rounded-lg px-3 py-1.5 hover:bg-primary/5 transition-colors disabled:opacity-50"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Migration pending notice */}
      {migrationPending && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong className="font-semibold block mb-1">Migration pending</strong>
          The <code className="font-mono text-xs bg-amber-100 px-1 rounded">company_inquiries</code> table has not been created in the database yet.
          Apply the SQL migration at{" "}
          <code className="font-mono text-xs bg-amber-100 px-1 rounded">
            supabase/migrations/20261028000000_create_company_inquiries.sql
          </code>{" "}
          via the Supabase Dashboard → SQL Editor to enable inquiry storage.
          Until then, the public inquiry form will return an error with the fallback email address.
        </div>
      )}

      {/* Error notice */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Filter tabs */}
      {!migrationPending && !error && (
        <div className="flex gap-2 mb-5 flex-wrap">
          {["all", "new", "contacted", "closed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border transition-colors ${
                filter === tab
                  ? "bg-primary text-white border-primary"
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      {!loading && !migrationPending && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-on-surface-variant text-sm">
          No {filter === "all" ? "" : filter} inquiries found.
        </div>
      )}

      {!loading && !migrationPending && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/40 shadow-card">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-lowest border-b border-outline-variant/30">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant text-xs uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant text-xs uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant text-xs uppercase tracking-wide">Shop</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant text-xs uppercase tracking-wide">Phone</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant text-xs uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant text-xs uppercase tracking-wide">Message</th>
                <th className="text-left px-4 py-3 font-medium text-on-surface-variant text-xs uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.map((inq) => (
                <tr key={inq.id} className="hover:bg-surface-container/40 transition-colors">
                  <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap text-xs">
                    {formatDate(inq.created_at)}
                  </td>
                  <td className="px-4 py-3 font-medium text-on-surface">{inq.name || "—"}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{inq.shop_name || "—"}</td>
                  <td className="px-4 py-3 font-mono text-on-surface">{inq.phone || "—"}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{inq.product_interest || "—"}</td>
                  <td className="px-4 py-3 text-on-surface-variant max-w-[200px]">
                    <span
                      className="line-clamp-2 block text-xs"
                      title={inq.message || ""}
                    >
                      {inq.message || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={inq.status || "new"}
                      disabled={updating === inq.id}
                      onChange={(e) => updateStatus(inq.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:ring-1 focus:ring-primary outline-none ${
                        STATUS_LABELS[inq.status]?.className || STATUS_LABELS.new.className
                      }`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {loading && (
        <div className="text-center py-16 text-on-surface-variant text-sm">
          Loading inquiries…
        </div>
      )}
    </div>
  );
}
