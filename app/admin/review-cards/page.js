"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { generateCardCode } from "@/lib/dynamicQr";
import { validateGoogleReviewUrl } from "@/lib/reviewCards";

const CATEGORIES = [
  { value: "retail", label: "Retail & Shopping" },
  { value: "restaurant", label: "Restaurant & Cafe" },
  { value: "clinic", label: "Healthcare & Clinic" },
  { value: "salon", label: "Salon, Spa & Beauty" },
  { value: "fitness", label: "Gym & Fitness" },
  { value: "automotive", label: "Automotive & Repair" },
  { value: "services", label: "Professional Services" },
  { value: "hotel", label: "Hospitality & Hotel" },
];

export default function AdminReviewCardsPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [migrationPending, setMigrationPending] = useState(false);
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [formData, setFormData] = useState({
    card_code: "",
    business_name: "",
    category: "retail",
    google_review_url: "",
    review_assistant_enabled: false, // Default FALSE
    is_active: true,
    notes: "",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation State
  const [deletingCard, setDeletingCard] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Copy Feedback
  const [copiedCode, setCopiedCode] = useState(null);

  // Fetch cards from API
  const fetchCards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/review-cards");
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (json.migration_pending) {
          setMigrationPending(true);
        } else {
          setError(json.error || "Failed to load review cards.");
        }
        return;
      }

      if (json.migration_pending) {
        setMigrationPending(true);
      } else {
        setCards(json.cards || []);
      }
    } catch {
      setError("Network connection error. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Open Create Modal
  function handleOpenCreate() {
    setEditingCard(null);
    setFormData({
      card_code: generateCardCode(),
      business_name: "",
      category: "retail",
      google_review_url: "",
      review_assistant_enabled: false, // Explicitly false
      is_active: true,
      notes: "",
    });
    setFormError("");
    setModalOpen(true);
  }

  // Open Edit Modal
  function handleOpenEdit(card) {
    setEditingCard(card);
    setFormData({
      card_code: card.card_code,
      business_name: card.business_name,
      category: card.category || "retail",
      google_review_url: card.google_review_url,
      review_assistant_enabled: Boolean(card.review_assistant_enabled),
      is_active: Boolean(card.is_active),
      notes: card.notes || "",
    });
    setFormError("");
    setModalOpen(true);
  }

  // Handle Form Submit (Create or Update)
  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    // Validate review URL
    const urlCheck = validateGoogleReviewUrl(formData.google_review_url);
    if (!urlCheck.valid) {
      setFormError(urlCheck.error);
      return;
    }

    setSubmitting(true);
    try {
      const method = editingCard ? "PATCH" : "POST";
      const payload = editingCard
        ? { id: editingCard.id, ...formData, google_review_url: urlCheck.normalizedUrl }
        : { ...formData, google_review_url: urlCheck.normalizedUrl };

      const res = await fetch("/api/admin/review-cards", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(json.error || "Failed to save review card.");
        return;
      }

      setModalOpen(false);
      fetchCards();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Quick Toggle Handler
  async function handleToggle(card, field) {
    const newValue = !card[field];
    // Optimistic UI update
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, [field]: newValue } : c))
    );

    try {
      const res = await fetch("/api/admin/review-cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: card.id,
          [field]: newValue,
          card_code: card.card_code,
        }),
      });

      if (!res.ok) {
        // Rollback
        fetchCards();
      }
    } catch {
      fetchCards();
    }
  }

  // Handle Safe Deletion
  async function handleDeleteConfirm() {
    if (!deletingCard) return;
    setDeleteLoading(true);
    try {
      const forceParam = deletingCard.is_active ? "&force=true" : "";
      const res = await fetch(`/api/admin/review-cards?id=${deletingCard.id}${forceParam}`, {
        method: "DELETE",
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.error || "Failed to delete card.");
        return;
      }

      setDeletingCard(null);
      fetchCards();
    } catch {
      alert("Network error while deleting card.");
    } finally {
      setDeleteLoading(false);
    }
  }

  // Copy Link
  function copyCardLink(cardCode) {
    const url = `${window.location.origin}/review/c/${cardCode}`;
    navigator.clipboard?.writeText(url);
    setCopiedCode(cardCode);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  // Filtered Cards
  const filteredCards = cards.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.card_code?.toLowerCase().includes(q) ||
      c.business_name?.toLowerCase().includes(q) ||
      c.category?.toLowerCase().includes(q)
    );
  });

  const totalCount = cards.length;
  const activeCount = cards.filter((c) => c.is_active).length;
  const assistantCount = cards.filter((c) => c.review_assistant_enabled).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Standalone Review Cards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage Google Review Cards for customers without digital business profiles.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-semibold shadow-xs transition-all"
        >
          <Icon name="Plus" size={16} />
          <span>New Review Card</span>
        </button>
      </div>

      {/* Migration Pending Notice */}
      {migrationPending && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <Icon name="AlertTriangle" size={14} />
            <span>Database Table Pending Execution</span>
          </div>
          <p>
            The <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">public.review_cards</code> migration has not been run in Supabase yet.
            Please apply <code className="font-mono">supabase/migrations/20261101000000_create_review_cards.sql</code> in your Supabase SQL Editor.
          </p>
        </div>
      )}

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Review Cards
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
            {totalCount}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Active Physical Cards
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">
            {activeCount}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Assistant Activated
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600 mt-1">
            {assistantCount}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex items-center gap-3">
        <Icon name="Search" size={16} className="text-slate-400 ml-1" />
        <input
          type="text"
          placeholder="Search by card code, business name, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-xs text-slate-400 hover:text-slate-600 mr-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Loading review cards...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-xs text-red-600 space-y-2">
            <p>{error}</p>
            <button
              type="button"
              onClick={fetchCards}
              className="text-xs text-blue-600 underline font-medium"
            >
              Retry
            </button>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 space-y-3">
            <p>No standalone review cards found.</p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium text-xs"
            >
              Create First Review Card
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Card Code</th>
                  <th className="py-3 px-4">Business Name &amp; Category</th>
                  <th className="py-3 px-4">Google Link</th>
                  <th className="py-3 px-4">Review Assistant</th>
                  <th className="py-3 px-4">Card Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCards.map((card) => (
                  <tr key={card.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Card Code */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{card.card_code}</span>
                        <button
                          type="button"
                          onClick={() => copyCardLink(card.card_code)}
                          title="Copy customer review link"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Icon name="Copy" size={12} />
                        </button>
                        {copiedCode === card.card_code && (
                          <span className="text-[10px] font-sans font-medium text-emerald-600">
                            Copied!
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Business Name */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{card.business_name}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{card.category || "retail"}</div>
                    </td>

                    {/* Google Link */}
                    <td className="py-3 px-4">
                      <a
                        href={card.google_review_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline max-w-[180px] truncate"
                        title={card.google_review_url}
                      >
                        <span className="truncate">Google Review Page</span>
                        <Icon name="ExternalLink" size={11} />
                      </a>
                    </td>

                    {/* Review Assistant Toggle */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggle(card, "review_assistant_enabled")}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                          card.review_assistant_enabled
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-slate-100 border-slate-200 text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            card.review_assistant_enabled ? "bg-blue-600" : "bg-slate-400"
                          }`}
                        />
                        <span>{card.review_assistant_enabled ? "Enabled" : "Disabled (Direct)"}</span>
                      </button>
                    </td>

                    {/* Active Status Toggle */}
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggle(card, "is_active")}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                          card.is_active
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-300"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            card.is_active ? "bg-emerald-600" : "bg-amber-500"
                          }`}
                        />
                        <span>{card.is_active ? "Active" : "Inactive"}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1">
                      <Link
                        href={`/review/c/${card.card_code}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 inline-block transition-colors"
                        title="Preview Live Page"
                      >
                        <Icon name="ExternalLink" size={14} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(card)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 inline-block transition-colors"
                        title="Edit Card"
                      >
                        <Icon name="Pencil" size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingCard(card)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 inline-block transition-colors"
                        title="Delete Card"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Review Card */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">
                {editingCard ? "Edit Review Card" : "New Standalone Review Card"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Card Code */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Card Code <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingCard)}
                    placeholder="e.g. NF8K29"
                    value={formData.card_code}
                    onChange={(e) =>
                      setFormData({ ...formData, card_code: e.target.value.toUpperCase().trim() })
                    }
                    className="flex-1 font-mono uppercase text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                  />
                  {!editingCard && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, card_code: generateCardCode() })}
                      className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Generate ↻
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">
                  Matches the unique NFC/QR card code. Once created, code cannot be modified.
                </p>
              </div>

              {/* Business Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Mehra Dental Clinic"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Business Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">
                  Used by Review Assistant to load relevant industry experience tags.
                </p>
              </div>

              {/* Google Review URL */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Official Google Review URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://g.page/r/.../review or https://search.google.com/local/writereview?placeid=..."
                  value={formData.google_review_url}
                  onChange={(e) => setFormData({ ...formData, google_review_url: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400">
                  Must be an official Google review or maps link starting with https://
                </p>
              </div>

              {/* Toggles */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                {/* Assistant Toggle */}
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      Enable Review Assistant
                    </div>
                    <div className="text-[10px] text-slate-500">
                      If disabled (default), card directly launches Google review page.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.review_assistant_enabled}
                    onChange={(e) =>
                      setFormData({ ...formData, review_assistant_enabled: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </label>

                {/* Active Card Toggle */}
                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-200">
                  <div>
                    <div className="text-xs font-semibold text-slate-800">
                      Card Active
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Uncheck to immediately pause this card.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                </label>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Internal Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Order #1042 — 2x Card Stand for reception"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  {submitting ? "Saving..." : editingCard ? "Update Card" : "Create Card"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Safeguard 4) */}
      {deletingCard && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4 animate-scaleUp">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
              <Icon name="Trash2" size={20} />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Delete Review Card {deletingCard.card_code}?
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                You are deleting the configuration for <strong>{deletingCard.business_name}</strong>.
              </p>
            </div>

            {deletingCard.is_active && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
                <strong>Warning:</strong> This card is currently <strong>ACTIVE</strong> in production.
                Customers scanning or tapping this physical card will receive an inactive notice.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCard(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                {deleteLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
