"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  getAdminCustomers,
  getAdminCustomerDetails,
  createCustomer,
  updateCustomer,
  toggleCustomerActive,
  deleteCustomer,
  validateProfileSlug,
} from "@/lib/customers";

// Default empty form template
const initialFormData = {
  full_name: "",
  job_title: "",
  company_name: "",
  category: "",
  description: "",
  phone: "",
  whatsapp: "",
  instagram: "",
  email: "",
  website: "",
  address: "",
  google_review_url: "",
  profile_slug: "",
  is_active: true,
};

export default function AdminCustomersDashboard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search and status filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'inactive'

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load customer list
  async function loadCustomers() {
    setLoading(true);
    setErrorMsg("");
    try {
      const list = await getAdminCustomers();
      setCustomers(list);
    } catch (err) {
      console.error("Failed to load customers:", err);
      setErrorMsg(
        err.message?.includes("permission denied")
          ? "Permission denied. Ensure your Supabase account has the admin RLS policy applied."
          : err.message || "Failed to load customers."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        !searchTerm.trim() ||
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.profile_slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.job_title?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && c.is_active) ||
        (statusFilter === "inactive" && !c.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // Status counts
  const stats = useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.is_active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [customers]);

  // Open Create Modal
  function handleOpenCreate() {
    setEditingId(null);
    setFormData(initialFormData);
    setFormErrors({});
    setIsFormModalOpen(true);
  }

  // Open Edit Modal (fetches full customer details on demand)
  async function handleOpenEdit(customer) {
    setEditingId(customer.id);
    setFormErrors({});
    setIsSubmitting(true);
    setIsFormModalOpen(true);

    try {
      const fullRecord = await getAdminCustomerDetails(customer.id);
      setFormData({
        full_name: fullRecord.full_name || "",
        job_title: fullRecord.job_title || "",
        company_name: fullRecord.company_name || "",
        category: fullRecord.category || "",
        description: fullRecord.description || "",
        phone: fullRecord.phone || "",
        whatsapp: fullRecord.whatsapp || "",
        instagram: fullRecord.instagram || "",
        email: fullRecord.email || "",
        website: fullRecord.website || "",
        address: fullRecord.address || "",
        google_review_url: fullRecord.google_review_url || "",
        profile_slug: fullRecord.profile_slug || "",
        is_active: fullRecord.is_active !== undefined ? fullRecord.is_active : true,
      });
    } catch (err) {
      console.error("Failed to load customer details:", err);
      setFormErrors({ general: "Failed to load full customer details." });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Auto-slug generator from Name or Company
  function handleGenerateSlug() {
    const base = formData.company_name || formData.full_name || "";
    const generated = base
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (generated) {
      setFormData((prev) => ({ ...prev, profile_slug: generated }));
    }
  }

  // Toggle active status
  async function handleToggleStatus(customer) {
    try {
      await toggleCustomerActive(customer.id, customer.is_active);
      setCustomers((prev) =>
        prev.map((item) =>
          item.id === customer.id ? { ...item, is_active: !item.is_active } : item
        )
      );
      setSuccessMsg(`Updated status for "${customer.full_name}".`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Failed to toggle status:", err);
      setErrorMsg(err.message || "Failed to update status.");
    }
  }

  // Handle delete
  async function handleConfirmDelete() {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(deletingCustomer.id);
      setCustomers((prev) => prev.filter((c) => c.id !== deletingCustomer.id));
      setSuccessMsg(`Deleted "${deletingCustomer.full_name}".`);
      setTimeout(() => setSuccessMsg(""), 3000);
      setDeletingCustomer(null);
    } catch (err) {
      console.error("Failed to delete customer:", err);
      setErrorMsg(err.message || "Failed to delete customer.");
    } finally {
      setIsDeleting(false);
    }
  }

  // Form submit (Create or Update)
  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormErrors({});

    // 1. Client-side field validations
    const errors = {};
    if (!formData.full_name.trim()) {
      errors.full_name = "Full Name is required.";
    }

    // 2. Slug validation
    const slugValidation = await validateProfileSlug(formData.profile_slug, editingId);
    if (!slugValidation.valid) {
      errors.profile_slug = slugValidation.message;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const updated = await updateCustomer(editingId, formData);
        setCustomers((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...updated } : c))
        );
        setSuccessMsg(`Updated customer "${formData.full_name}".`);
      } else {
        const created = await createCustomer(formData);
        setCustomers((prev) => [created, ...prev]);
        setSuccessMsg(`Created new customer "${formData.full_name}".`);
      }
      setTimeout(() => setSuccessMsg(""), 3000);
      setIsFormModalOpen(false);
    } catch (err) {
      console.error("Form submit error:", err);
      setFormErrors({ general: err.message || "An error occurred while saving." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 text-body-sm shadow-card">
          <span className="material-symbols-outlined text-[20px] text-emerald-600">
            check_circle
          </span>
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-error-container/40 border border-error/30 text-on-error-container flex items-center gap-2 text-body-sm shadow-card">
          <span className="material-symbols-outlined text-[20px] text-error">
            error
          </span>
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-bold text-on-surface">
            Customer Profiles
          </h1>
          <p className="text-body-sm text-on-surface-variant font-medium">
            Manage NFC digital business cards and customer records
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-label-md shadow-btn-primary transition-all active:scale-[0.98] self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add Customer</span>
        </button>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-card">
          <span className="text-label-sm text-tertiary uppercase tracking-wider font-semibold">
            Total Customers
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-on-surface mt-1">
            {stats.total}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-card">
          <span className="text-label-sm text-emerald-700 uppercase tracking-wider font-semibold">
            Active Cards
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
            {stats.active}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-card">
          <span className="text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
            Inactive
          </span>
          <p className="text-2xl sm:text-3xl font-bold text-on-surface-variant mt-1">
            {stats.inactive}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, company, job title, or slug..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">
            search
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-[14px]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20 self-start sm:self-auto">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "inactive", label: "Inactive" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all ${
                statusFilter === tab.id
                  ? "bg-surface-container-lowest text-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-body-sm text-on-surface-variant font-medium">
              Loading customer profiles...
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-surface-container-low text-outline flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[24px]">
                badge
              </span>
            </div>
            <h3 className="text-label-lg font-bold text-on-surface">
              No customer profiles found
            </h3>
            <p className="text-body-sm text-on-surface-variant max-w-sm mt-1 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "No customer matches your current search filters. Try clearing your search."
                : "No customers have been registered yet. Click below to add your first customer."}
            </p>
            {searchTerm || statusFilter !== "all" ? (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="text-label-md text-primary font-semibold hover:underline"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-label-md"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Add First Customer</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low/40 text-[11px] uppercase tracking-wider text-tertiary font-semibold">
                  <th className="py-3.5 px-4 sm:px-6">Customer</th>
                  <th className="py-3.5 px-4">Company &amp; Title</th>
                  <th className="py-3.5 px-4">Slug &amp; URL</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Created</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-body-sm text-on-surface">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-surface-container-low/30 transition-colors"
                  >
                    {/* Full Name */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-semibold text-on-surface">
                        {customer.full_name}
                      </div>
                    </td>

                    {/* Company & Job Title */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-on-surface truncate max-w-[160px]">
                        {customer.company_name || "—"}
                      </div>
                      <div className="text-[12px] text-on-surface-variant truncate max-w-[160px]">
                        {customer.job_title || "—"}
                      </div>
                    </td>

                    {/* Profile Slug & Link */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1 font-mono text-[12px] bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/20 text-on-surface">
                        <span>/p/{customer.profile_slug}</span>
                      </div>
                    </td>

                    {/* Active/Inactive Status Pill */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
                          customer.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            customer.is_active ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        <span>{customer.is_active ? "Active" : "Inactive"}</span>
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 hidden md:table-cell text-[12px] text-on-surface-variant">
                      {customer.created_at
                        ? new Date(customer.created_at).toLocaleDateString()
                        : "—"}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        {/* View Public Profile (Active only) */}
                        {customer.is_active && (
                          <Link
                            href={`/p/${customer.profile_slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-primary hover:bg-surface-container-low transition-colors"
                            title="View Public Profile"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              open_in_new
                            </span>
                          </Link>
                        )}

                        {/* Quick Toggle Active */}
                        <button
                          onClick={() => handleToggleStatus(customer)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            customer.is_active
                              ? "text-emerald-700 hover:bg-emerald-50"
                              : "text-slate-500 hover:bg-slate-100"
                          }`}
                          title={
                            customer.is_active
                              ? "Deactivate Profile"
                              : "Activate Profile"
                          }
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {customer.is_active ? "toggle_on" : "toggle_off"}
                          </span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(customer)}
                          className="p-1.5 rounded-lg text-on-surface hover:bg-surface-container-low transition-colors"
                          title="Edit Customer"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            edit
                          </span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingCustomer(customer)}
                          className="p-1.5 rounded-lg text-error hover:bg-error-container/30 transition-colors"
                          title="Delete Customer"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================================== */}
      {/* ADD / EDIT CUSTOMER MODAL */}
      {/* ============================================================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-float overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/30">
              <h2 className="text-headline-md font-bold text-on-surface">
                {editingId ? "Edit Customer Profile" : "Add New Customer"}
              </h2>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[22px]">
                  close
                </span>
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="overflow-y-auto p-6 space-y-5">
              {formErrors.general && (
                <div className="p-3.5 rounded-xl bg-error-container/40 border border-error/30 text-on-error-container text-body-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-error">
                    error
                  </span>
                  <span>{formErrors.general}</span>
                </div>
              )}

              {/* Identity Details */}
              <div className="space-y-4">
                <div className="text-label-sm font-bold uppercase tracking-wider text-primary">
                  1. Business &amp; Personal Identity
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      placeholder="Sarah Mitchell"
                      className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {formErrors.full_name && (
                      <p className="text-[12px] text-error mt-1">
                        {formErrors.full_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                      Company / Brand Name
                    </label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) =>
                        setFormData({ ...formData, company_name: e.target.value })
                      }
                      placeholder="Nova Studio"
                      className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={formData.job_title}
                      onChange={(e) =>
                        setFormData({ ...formData, job_title: e.target.value })
                      }
                      placeholder="Principal Architect"
                      className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      placeholder="Interior Design & Architecture"
                      className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                    Bio / Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Brief description appearing on the digital business card..."
                    className="w-full p-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Profile Slug & Card URL */}
              <div className="space-y-3 pt-2 border-t border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="text-label-sm font-bold uppercase tracking-wider text-primary">
                    2. Profile Slug &amp; Public URL *
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    className="text-[12px] font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      auto_awesome
                    </span>
                    <span>Generate from Name/Company</span>
                  </button>
                </div>

                <div>
                  <div className="flex items-center rounded-xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                    <span className="px-3.5 py-2.5 bg-surface-container-low text-tertiary text-body-sm font-mono border-r border-outline-variant/30 select-none">
                      /p/
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.profile_slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profile_slug: e.target.value.toLowerCase(),
                        })
                      }
                      placeholder="sarah-mitchell"
                      className="w-full h-11 px-3.5 bg-transparent text-on-surface text-body-md font-mono focus:outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-tertiary mt-1">
                    Lowercase letters, numbers, hyphens, and underscores only. This will form the unique link for their NFC card.
                  </p>
                  {formErrors.profile_slug && (
                    <p className="text-[12px] text-error mt-1 font-medium">
                      {formErrors.profile_slug}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Information (Private / Admin view only) */}
              <div className="space-y-4 pt-2 border-t border-outline-variant/20">
                <div className="flex items-center gap-2 text-label-sm font-bold uppercase tracking-wider text-primary">
                  <span>3. Contact Channels</span>
                  <span className="text-[11px] text-tertiary normal-case font-normal">
                    (Visible in Admin; excluded from public search endpoints)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+1 (555) 012-3456"
                      className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                      WhatsApp (digits only with country code)
                    </label>
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      placeholder="919000000000"
                      className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="hello@example.com"
                      className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) =>
                        setFormData({ ...formData, instagram: e.target.value })
                      }
                      placeholder="username (without @)"
                      className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      placeholder="https://example.com"
                      className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                      Google Review URL
                    </label>
                    <input
                      type="url"
                      value={formData.google_review_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          google_review_url: e.target.value,
                        })
                      }
                      placeholder="https://g.page/r/..."
                      className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                    Physical Address / Office Location
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Suite 100, 123 Innovation Way, City"
                    className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                <div>
                  <span className="text-label-md font-bold text-on-surface">
                    Active Status
                  </span>
                  <p className="text-body-sm text-on-surface-variant">
                    When inactive, the public URL (/p/[slug]) will display an inactive card notice.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-semibold text-label-md hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-label-md shadow-btn-primary transition-all disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingId ? "Save Changes" : "Create Customer"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================================================== */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-float flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-error-container/40 text-error flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[24px]">
                warning
              </span>
            </div>

            <h3 className="text-headline-md font-bold text-on-surface">
              Delete Customer Profile?
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">
              Are you sure you want to delete the profile for{" "}
              <span className="font-semibold text-on-surface">
                &ldquo;{deletingCustomer.full_name}&rdquo;
              </span>{" "}
              (<code className="text-[12px] bg-surface-container-low px-1 py-0.5 rounded">/p/{deletingCustomer.profile_slug}</code>)?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingCustomer(null)}
                className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-semibold text-label-md hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-error hover:bg-red-700 text-on-error font-semibold text-label-md shadow-sm transition-all disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Profile</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
