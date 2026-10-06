"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  getAdminCustomers,
  getAdminCustomerDetails,
  createCustomer,
  updateCustomer,
  toggleCustomerActive,
  deleteCustomer,
  validateProfileSlug,
  validatePhotoFile,
  uploadCustomerPhoto,
  deleteCustomerPhoto,
  recordConsentForCustomer,
  isValidHttpUrl,
} from "@/lib/customers";
import CustomerGallerySection from "@/components/admin/CustomerGallerySection";
import { getAdminGalleryItems, savePendingGalleryItems } from "@/lib/gallery";
import { supabase } from "@/lib/supabaseClient";

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
  photo_url: "",
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
  const [originalSlug, setOriginalSlug] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // DPDP: admin publication-consent confirmation (separate from formData; never auto-checked)
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  // Portfolio & Products items for customer modal
  const [galleryItems, setGalleryItems] = useState([]);

  // Photo management state
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);
  const fileInputRef = useRef(null);

  // Delete modal state
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create Login modal state
  const [loginModalCustomer, setLoginModalCustomer] = useState(null); // customer object
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copiedCreds, setCopiedCreds] = useState(false);
  const [isCreatingLogin, setIsCreatingLogin] = useState(false);
  const [loginModalError, setLoginModalError] = useState("");
  const [loginModalSuccess, setLoginModalSuccess] = useState("");

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
    setOriginalSlug(null);
    setFormData(initialFormData);
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsPhotoRemoved(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFormErrors({});
    setConsentConfirmed(false); // DPDP: always start unchecked
    setGalleryItems([]);
    setIsFormModalOpen(true);
  }

  // Open Edit Modal (fetches full customer details on demand)
  async function handleOpenEdit(customer) {
    setEditingId(customer.id);
    setOriginalSlug(customer.profile_slug || null);
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsPhotoRemoved(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFormErrors({});
    setConsentConfirmed(false); // DPDP: not required on edit, but always start unchecked
    setGalleryItems([]);
    setIsSubmitting(true);
    setIsFormModalOpen(true);

    try {
      const [fullRecord, existingGalleryItems] = await Promise.all([
        getAdminCustomerDetails(customer.id),
        getAdminGalleryItems(customer.id),
      ]);

      if (fullRecord?.profile_slug) {
        setOriginalSlug(fullRecord.profile_slug);
      }

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
        photo_url: fullRecord.photo_url || "",
        profile_slug: fullRecord.profile_slug || "",
        is_active: fullRecord.is_active !== undefined ? fullRecord.is_active : true,
      });
      setPhotoPreview(fullRecord.photo_url || null);
      setGalleryItems(existingGalleryItems || []);
    } catch (err) {
      console.error("Failed to load customer details:", err);
      setFormErrors({ general: "Failed to load full customer details." });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Photo handlers
  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validatePhotoFile(file);
    if (!validation.valid) {
      setFormErrors((prev) => ({ ...prev, photo: validation.message }));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFormErrors((prev) => {
      const copy = { ...prev };
      delete copy.photo;
      return copy;
    });

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setIsPhotoRemoved(false);
  }

  function handleRemovePhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsPhotoRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  // Trigger on-demand profile cache revalidation
  async function triggerProfileRevalidation(slug, oldSlug = null) {
    if (!slug && !oldSlug) return;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const headers = { "Content-Type": "application/json" };
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }

      const slugs = [slug, oldSlug].filter(Boolean);
      await fetch("/api/admin/revalidate", {
        method: "POST",
        headers,
        body: JSON.stringify({ slugs }),
      });
    } catch (err) {
      console.error("[Revalidate] Failed to trigger profile revalidation:", err);
    }
  }

  // Toggle active status
  async function handleToggleStatus(customer) {
    try {
      await toggleCustomerActive(customer.id, customer.is_active);
      await triggerProfileRevalidation(customer.profile_slug);
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
      if (deletingCustomer.photo_url) {
        await deleteCustomerPhoto(deletingCustomer.photo_url);
      }
      await deleteCustomer(deletingCustomer.id);
      await triggerProfileRevalidation(deletingCustomer.profile_slug);
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

  // Helper to generate a random temporary password
  function generateTemporaryPassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "Nfc";
    for (let i = 0; i < 7; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd + "1!";
  }

  // Open Create Login modal
  function handleOpenLoginModal(customer) {
    setLoginModalCustomer(customer);
    setLoginEmail(customer.email || "");
    setLoginPassword(generateTemporaryPassword());
    setCreatedCredentials(null);
    setCopiedCreds(false);
    setLoginModalError("");
    setLoginModalSuccess("");
  }

  // Submit Create Login
  async function handleCreateLogin(e) {
    e.preventDefault();
    setLoginModalError("");
    setLoginModalSuccess("");

    const trimmedEmail = loginEmail.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setLoginModalError("Please enter a valid email address.");
      return;
    }

    const trimmedPassword = loginPassword.trim();
    if (trimmedPassword && trimmedPassword.length < 6) {
      setLoginModalError("Password must be at least 6 characters.");
      return;
    }

    setIsCreatingLogin(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/admin/customers/create-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          customer_id: loginModalCustomer.id,
          email: trimmedEmail,
          password: trimmedPassword || undefined,
        }),
      });

      let result = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        try {
          result = await res.json();
        } catch {
          result = null;
        }
      }

      if (!result) {
        const rawText = await res.text().catch(() => "");
        console.error("Non-JSON or unparseable response from create-login API:", res.status, rawText);
        setLoginModalError(
          `Server returned status ${res.status}: ${rawText.slice(0, 150) || "Unable to parse server response."}`
        );
        return;
      }

      if (!res.ok) {
        setLoginModalError(result.error || `Failed to create customer login (HTTP ${res.status}).`);
        return;
      }

      // Update the in-memory customer list with new auth_user_id and email
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === loginModalCustomer.id
            ? { ...c, auth_user_id: result.auth_user_id, email: trimmedEmail }
            : c
        )
      );

      if (result.status === "already_linked") {
        setLoginModalSuccess(
          `This customer already has a portal login linked (${result.email || "active"}).`
        );
      } else {
        setCreatedCredentials({
          email: trimmedEmail,
          password: trimmedPassword || null,
          actionLink: result.action_link || null,
        });
        setLoginModalSuccess(result.message || "Customer login created successfully.");
      }
    } catch (err) {
      console.error("Failed to create customer login:", err);
      setLoginModalError(err?.message ? `Error: ${err.message}` : "An unexpected error occurred. Please try again.");
    } finally {
      setIsCreatingLogin(false);
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

    // 3. Customer Approval required when creating a NEW ACTIVE customer
    //    Not required when editing an existing customer or when creating an inactive customer.
    if (!editingId && formData.is_active && !consentConfirmed) {
      errors.consent =
        "Please confirm that the customer has approved displaying their information on their NFC profile.";
    }

    // 4. URL scheme validations (Website & Google Review URL must be http:// or https://)
    if (formData.website?.trim() && !isValidHttpUrl(formData.website)) {
      errors.website = "Website URL must begin with http:// or https://";
    }
    if (formData.google_review_url?.trim() && !isValidHttpUrl(formData.google_review_url)) {
      errors.google_review_url = "Google Review URL must begin with http:// or https://";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      let finalPhotoUrl = formData.photo_url || null;

      // Handle photo removal
      if (isPhotoRemoved) {
        if (formData.photo_url) {
          await deleteCustomerPhoto(formData.photo_url);
        }
        finalPhotoUrl = null;
      }

      // Handle photo upload
      if (photoFile) {
        const uploadResult = await uploadCustomerPhoto(
          photoFile,
          formData.profile_slug || "customer"
        );
        if (formData.photo_url && formData.photo_url !== uploadResult.publicUrl) {
          await deleteCustomerPhoto(formData.photo_url);
        }
        finalPhotoUrl = uploadResult.publicUrl;
      }

      const payload = {
        ...formData,
        photo_url: finalPhotoUrl,
      };

      if (editingId) {
        const updated = await updateCustomer(editingId, payload);
        await triggerProfileRevalidation(payload.profile_slug, originalSlug);
        setCustomers((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, ...updated } : c))
        );
        setSuccessMsg(`Updated customer "${formData.full_name}".`);
      } else {
        const created = await createCustomer(payload);
        setCustomers((prev) => [created, ...prev]);
        setSuccessMsg(`Created new customer "${formData.full_name}".`);

        // Save pending gallery items if any were added during Add Customer
        if (created?.id && galleryItems.length > 0) {
          try {
            await savePendingGalleryItems(created.id, galleryItems);
          } catch (gErr) {
            console.error("Failed to save pending gallery items:", gErr);
          }
        }

        // Customer Approval: record in public.customer_consents for new active customer
        if (payload.is_active && consentConfirmed && created?.id) {
          await recordConsentForCustomer(created.id);
        }

        // Invalidate newly created customer profile cache
        await triggerProfileRevalidation(payload.profile_slug);
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
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-label-md shadow-btn-primary transition-all active:scale-[0.98] w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add Customer</span>
        </button>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-card">
          <span className="text-[10px] sm:text-label-sm text-tertiary uppercase tracking-wider font-semibold block truncate">
            Total Customers
          </span>
          <p className="text-xl sm:text-3xl font-bold text-on-surface mt-0.5 sm:mt-1">
            {stats.total}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-card">
          <span className="text-[10px] sm:text-label-sm text-emerald-700 uppercase tracking-wider font-semibold block truncate">
            Active Cards
          </span>
          <p className="text-xl sm:text-3xl font-bold text-emerald-600 mt-0.5 sm:mt-1">
            {stats.active}
          </p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-card">
          <span className="text-[10px] sm:text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold block truncate">
            Inactive
          </span>
          <p className="text-xl sm:text-3xl font-bold text-on-surface-variant mt-0.5 sm:mt-1">
            {stats.inactive}
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-3 sm:p-4 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, company, title, or slug..."
            className="w-full h-11 pl-10 pr-8 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
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
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20 w-full sm:w-auto overflow-x-auto">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "inactive", label: "Inactive" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all whitespace-nowrap ${
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
          <>
            {/* Mobile Card List (md:hidden) */}
            <div className="block md:hidden divide-y divide-outline-variant/15">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-3.5 space-y-2.5 hover:bg-surface-container-low/20 transition-colors">
                  {/* Row 1: Avatar + Name + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-surface-container-low border border-outline-variant/30 flex items-center justify-center overflow-hidden shrink-0">
                        {customer.photo_url ? (
                          <img
                            src={customer.photo_url}
                            alt={customer.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-primary select-none">
                            {customer.full_name
                              ? customer.full_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()
                              : "NC"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-on-surface text-body-md truncate">
                          {customer.full_name}
                        </p>
                        {(customer.company_name || customer.job_title) && (
                          <p className="text-xs text-on-surface-variant truncate">
                            {customer.company_name}
                            {customer.company_name && customer.job_title ? " · " : ""}
                            {customer.job_title}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide shrink-0 ${
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
                  </div>

                  {/* Row 2: Profile Slug & Date */}
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="inline-flex items-center gap-1 font-mono text-[11px] bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant/20 text-on-surface truncate max-w-[200px]">
                      <span>/p/{customer.profile_slug}</span>
                    </div>
                    {customer.created_at && (
                      <span className="text-[11px] text-on-surface-variant">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Row 2.5: Customer Login Status (Mobile) */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-outline-variant/10">
                    <span className="text-[11px] text-on-surface-variant truncate max-w-[190px]">
                      <span className="font-semibold text-on-surface">Login:</span> {customer.email || "No email"}
                    </span>
                    {customer.auth_user_id ? (
                      <button
                        onClick={() => handleOpenLoginModal(customer)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>✓ Login Created</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenLoginModal(customer)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-primary bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors shrink-0"
                      >
                        <span className="material-symbols-outlined text-[13px]">key</span>
                        <span>Create Login</span>
                      </button>
                    )}
                  </div>

                  {/* Row 3: Touch-friendly Action Buttons */}
                  <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-outline-variant/10">
                    {customer.is_active && (
                      <Link
                        href={`/p/${customer.profile_slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-outline-variant/30 text-primary text-xs font-semibold hover:bg-surface-container-low transition-colors"
                        title="View Public Profile"
                      >
                        <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                        <span>View</span>
                      </Link>
                    )}

                    <button
                      onClick={() => handleToggleStatus(customer)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                        customer.is_active
                          ? "border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50"
                          : "border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {customer.is_active ? "toggle_on" : "toggle_off"}
                      </span>
                      <span>{customer.is_active ? "Active" : "Inactive"}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(customer)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-outline-variant/40 text-on-surface text-xs font-semibold hover:bg-surface-container-low transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => setDeletingCustomer(customer)}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg border border-error/20 text-error hover:bg-error-container/30 transition-colors"
                      title="Delete Customer"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-surface-container-low/40 text-[11px] uppercase tracking-wider text-tertiary font-semibold">
                    <th className="py-3.5 px-4 sm:px-6">Customer</th>
                    <th className="py-3.5 px-4">Company &amp; Title</th>
                    <th className="py-3.5 px-4">Slug &amp; URL</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Portal Login</th>
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
                      {/* Full Name & Avatar */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surface-container-low border border-outline-variant/30 flex items-center justify-center overflow-hidden shrink-0">
                            {customer.photo_url ? (
                              <img
                                src={customer.photo_url}
                                alt={customer.full_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[11px] font-bold text-primary select-none">
                                {customer.full_name
                                  ? customer.full_name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)
                                      .toUpperCase()
                                  : "NC"}
                              </span>
                            )}
                          </div>
                          <div className="font-semibold text-on-surface">
                            {customer.full_name}
                          </div>
                        </div>
                      </td>

                      {/* Company & Job Title */}
                      <td className="py-3.5 px-4">
                        {customer.company_name ? (
                          <>
                            <div className="font-medium text-on-surface truncate max-w-[160px]">
                              {customer.company_name}
                            </div>
                            {customer.job_title && (
                              <div className="text-[12px] text-on-surface-variant truncate max-w-[160px]">
                                {customer.job_title}
                              </div>
                            )}
                          </>
                        ) : customer.job_title ? (
                          <div className="text-body-sm text-on-surface truncate max-w-[160px]">
                            {customer.job_title}
                          </div>
                        ) : (
                          <span className="text-on-surface-variant/40 text-[12px]">—</span>
                        )}
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

                      {/* Portal Login Column */}
                      <td className="py-3.5 px-4">
                        {customer.auth_user_id ? (
                          <div className="space-y-0.5">
                            <button
                              onClick={() => handleOpenLoginModal(customer)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/60 transition-colors"
                              title="Click to view login details"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>✓ Login Created</span>
                            </button>
                            {customer.email && (
                              <div className="text-[11px] text-on-surface-variant font-mono truncate max-w-[150px]">
                                {customer.email}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <button
                              onClick={() => handleOpenLoginModal(customer)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-primary/40 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-colors shadow-xs"
                            >
                              <span className="material-symbols-outlined text-[14px]">key</span>
                              <span>Create Login</span>
                            </button>
                            {customer.email ? (
                              <div className="text-[11px] text-on-surface-variant truncate max-w-[150px]">
                                {customer.email}
                              </div>
                            ) : (
                              <div className="text-[10px] text-on-surface-variant/40 italic">
                                No email set
                              </div>
                            )}
                          </div>
                        )}
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
          </>
        )}
      </div>

      {/* ============================================================================== */}
      {/* ADD / EDIT CUSTOMER MODAL */}
      {/* ============================================================================== */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl my-2 sm:my-8 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-float overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/30">
              <h2 className="text-title-lg sm:text-headline-md font-bold text-on-surface">
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
            <form onSubmit={handleFormSubmit} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
              {formErrors.general && (
                <div className="p-3.5 rounded-xl bg-error-container/40 border border-error/30 text-on-error-container text-body-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-error">
                    error
                  </span>
                  <span>{formErrors.general}</span>
                </div>
              )}

              {/* 1. Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-label-sm font-bold uppercase tracking-wider text-primary">
                  <span>Basic Information</span>
                </div>

                {/* Profile Photo (Optional) */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-surface-container-low/40 border border-outline-variant/30">
                  <div className="relative w-16 h-16 rounded-full border-2 border-primary/20 bg-surface-container-lowest shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[32px] text-outline">
                        account_circle
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-label-sm font-semibold text-on-surface">
                        Profile Photo
                      </span>
                      <span className="text-[11px] text-tertiary font-normal">
                        (Optional)
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="admin-photo-upload"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-label-sm font-medium hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {photoPreview ? "sync" : "upload"}
                        </span>
                        <span>{photoPreview ? "Change Photo" : "Upload Photo"}</span>
                      </button>

                      {photoPreview && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-error hover:bg-error-container/30 border border-error/20 text-label-sm font-medium transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            delete
                          </span>
                          <span>Remove</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-on-surface-variant">
                      Allowed: JPG, PNG, WebP. Maximum size: 5 MB.
                    </p>

                    {formErrors.photo && (
                      <p className="text-[12px] text-error font-medium">
                        {formErrors.photo}
                      </p>
                    )}
                  </div>
                </div>

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
                    <p className="text-[12px] text-error mt-1 font-medium">
                      {formErrors.full_name}
                    </p>
                  )}
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
                      Company Name
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

                <div>
                  <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                    Description
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

              {/* 2. Contact Information */}
              <div className="space-y-4 pt-3 border-t border-outline-variant/20">
                <div className="flex items-center gap-2 text-label-sm font-bold uppercase tracking-wider text-primary">
                  <span>Contact Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                      Phone
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
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      placeholder="15550001234"
                      className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                      Email
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
                      Website
                    </label>
                    <input
                      type="text"
                      value={formData.website}
                      onChange={(e) => {
                        setFormData({ ...formData, website: e.target.value });
                        if (formErrors.website) {
                          setFormErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.website;
                            return copy;
                          });
                        }
                      }}
                      placeholder="https://example.com"
                      className={`w-full h-11 px-3.5 rounded-xl border bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.website ? "border-error" : "border-outline-variant/40"
                      }`}
                    />
                    {formErrors.website && (
                      <p className="mt-1 text-[12px] text-error font-medium">
                        {formErrors.website}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Social & Business */}
              <div className="space-y-4 pt-3 border-t border-outline-variant/20">
                <div className="flex items-center gap-2 text-label-sm font-bold uppercase tracking-wider text-primary">
                  <span>Social &amp; Business</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                      Instagram
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

                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                      Google Review URL
                    </label>
                    <input
                      type="text"
                      value={formData.google_review_url}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          google_review_url: e.target.value,
                        });
                        if (formErrors.google_review_url) {
                          setFormErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.google_review_url;
                            return copy;
                          });
                        }
                      }}
                      placeholder="https://g.page/r/..."
                      className={`w-full h-11 px-3.5 rounded-xl border bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        formErrors.google_review_url ? "border-error" : "border-outline-variant/40"
                      }`}
                    />
                    {formErrors.google_review_url && (
                      <p className="mt-1 text-[12px] text-error font-medium">
                        {formErrors.google_review_url}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                    Address
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

              {/* 4. Profile Settings */}
              <div className="space-y-4 pt-3 border-t border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="text-label-sm font-bold uppercase tracking-wider text-primary">
                    Profile Settings
                  </span>
                  {!editingId && (
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
                  )}
                </div>

                <div>
                  <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                    Profile Slug *
                  </label>
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
                  {editingId ? (
                    <p className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/60 rounded-lg px-2.5 py-1.5 mt-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] shrink-0">
                        lock
                      </span>
                      <span>
                        NFC Profile Slug remains stable. Only change if deliberately re-encoding physical NFC cards.
                      </span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-tertiary mt-1">
                      Lowercase letters, numbers, hyphens, and underscores only. Forms the unique link for their NFC card.
                    </p>
                  )}
                  {formErrors.profile_slug && (
                    <p className="text-[12px] text-error mt-1 font-medium">
                      {formErrors.profile_slug}
                    </p>
                  )}
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-label-md font-bold text-on-surface">
                      Active
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
              </div>{/* end Profile Settings */}

              {/* 5. Portfolio & Products */}
              <CustomerGallerySection
                customerId={editingId}
                items={galleryItems}
                setItems={setGalleryItems}
                customerWhatsApp={formData.whatsapp}
              />

              {/* ------------------------------------------------------------ */}
              {/* 6. Customer Approval (Only for Add New Customer)             */}
              {/* ------------------------------------------------------------ */}
              {!editingId && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center gap-2 text-label-sm font-bold uppercase tracking-wider text-primary">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span>Customer Approval</span>
                  </div>

                  <div
                    className={`p-4 rounded-xl border transition-colors ${
                      formErrors.consent
                        ? "border-error/60 bg-error-container/20 text-on-error-container"
                        : "border-primary/30 bg-primary/5 hover:bg-primary/10 text-on-surface"
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={consentConfirmed}
                        onChange={(e) => {
                          setConsentConfirmed(e.target.checked);
                          if (formErrors.consent) {
                            setFormErrors((prev) => {
                              const copy = { ...prev };
                              delete copy.consent;
                              return copy;
                            });
                          }
                        }}
                        disabled={isSubmitting}
                        className="mt-0.5 h-4 w-4 rounded border-slate-400 text-primary accent-primary cursor-pointer shrink-0"
                      />
                      <span className="text-body-sm leading-relaxed">
                        {formData.is_active && (
                          <span className="font-semibold text-primary mr-1">
                            [Required to Publish]:
                          </span>
                        )}
                        I confirm that the customer has agreed that the information provided may be displayed on their NFCISTA digital profile when someone taps or scans their NFC card.
                      </span>
                    </label>

                    {formErrors.consent && (
                      <p className="mt-2.5 flex items-center gap-1.5 text-[12px] text-error font-semibold">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        <span>{formErrors.consent}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-outline-variant/20 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsFormModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-semibold text-label-md hover:bg-surface-container-low transition-colors text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-label-md shadow-btn-primary transition-all disabled:opacity-60"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-5 sm:p-6 shadow-float flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-error-container/40 text-error flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[24px]">
                warning
              </span>
            </div>

            <h3 className="text-title-lg sm:text-headline-md font-bold text-on-surface">
              Delete Customer Profile?
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed">
              Are you sure you want to delete the profile for{" "}
              <span className="font-semibold text-on-surface">
                &ldquo;{deletingCustomer.full_name}&rdquo;
              </span>{" "}
              (<code className="text-[12px] bg-surface-container-low px-1 py-0.5 rounded break-all">/p/{deletingCustomer.profile_slug}</code>)?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingCustomer(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-semibold text-label-md hover:bg-surface-container-low transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-error hover:bg-red-700 text-on-error font-semibold text-label-md shadow-sm transition-all disabled:opacity-60"
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

      {/* ============================================================================== */}
      {/* CREATE CUSTOMER LOGIN MODAL                                                    */}
      {/* ============================================================================== */}
      {loginModalCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-float flex flex-col">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-outline-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">key</span>
                </div>
                <div>
                  <h3 className="text-title-md font-bold text-on-surface">
                    {loginModalCustomer.auth_user_id ? "Customer Portal Login" : "Create Customer Login"}
                  </h3>
                  <p className="text-[11px] text-on-surface-variant truncate max-w-[220px]">
                    {loginModalCustomer.full_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLoginModalCustomer(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Already linked status */}
              {loginModalCustomer.auth_user_id && !loginModalSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-emerald-800">
                    <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
                    <span>Portal Login Active</span>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    This customer has an active Supabase Auth account linked to their profile record.
                  </p>
                  <div className="pt-1 text-xs">
                    <span className="font-semibold">Customer Login URL: </span>
                    <code className="bg-emerald-100/70 px-1.5 py-0.5 rounded text-emerald-800">/login</code>
                  </div>
                </div>
              )}

              {/* Success message */}
              {loginModalSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-2.5 text-sm">
                  <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0 mt-0.5">check_circle</span>
                  <p className="font-medium leading-relaxed">{loginModalSuccess}</p>
                </div>
              )}

              {/* Created credentials handover card */}
              {createdCredentials && (
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      Login Credentials
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Ready to use
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Email</span>
                        <span className="font-mono font-semibold text-on-surface">{createdCredentials.email}</span>
                      </div>
                    </div>

                    {createdCredentials.password && (
                      <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Temporary Password</span>
                          <span className="font-mono font-semibold text-primary">{createdCredentials.password}</span>
                        </div>
                      </div>
                    )}

                    {createdCredentials.actionLink && (
                      <div className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 space-y-1">
                        <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Password Setup Link</span>
                        <p className="font-mono text-[11px] text-on-surface-variant truncate">{createdCredentials.actionLink}</p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const portalUrl = typeof window !== "undefined" ? `${window.location.origin}/login` : "https://nfcista.vercel.app/login";
                      const text = [
                        `NFCISTA Customer Portal Credentials:`,
                        `Portal URL: ${portalUrl}`,
                        `Email: ${createdCredentials.email}`,
                        createdCredentials.password ? `Temporary Password: ${createdCredentials.password}` : "",
                        createdCredentials.actionLink ? `Setup Link: ${createdCredentials.actionLink}` : "",
                        `Please log in and update your profile details anytime.`,
                      ].filter(Boolean).join("\n");
                      navigator.clipboard.writeText(text).then(() => {
                        setCopiedCreds(true);
                        setTimeout(() => setCopiedCreds(false), 2500);
                      });
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-surface-container-lowest hover:bg-surface-container border border-outline-variant/30 text-on-surface text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      {copiedCreds ? "check" : "content_copy"}
                    </span>
                    <span>{copiedCreds ? "Copied to Clipboard!" : "Copy Login Info for Customer"}</span>
                  </button>
                </div>
              )}

              {/* Error message */}
              {loginModalError && (
                <div className="p-3.5 rounded-xl bg-error-container/30 border border-error/30 text-error flex items-start gap-2.5 text-sm">
                  <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
                  <p className="font-medium leading-relaxed">{loginModalError}</p>
                </div>
              )}

              {/* Form — only show if not already linked OR if we want to retry */}
              {!loginModalCustomer.auth_user_id && !createdCredentials && (
                <form onSubmit={handleCreateLogin} className="space-y-4">
                  <div>
                    <label className="block text-label-sm font-semibold text-on-surface mb-1.5">
                      Customer Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="customer@example.com"
                      className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-label-sm font-semibold text-on-surface">
                        Temporary Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setLoginPassword(generateTemporaryPassword())}
                        className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">refresh</span>
                        <span>Generate new</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter or generate temporary password"
                      className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface font-mono text-body-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                    <p className="text-[11px] text-on-surface-variant mt-1.5 leading-relaxed">
                      Auto-generated for immediate login. The customer can change their password anytime.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low/60 border border-outline-variant/20 text-[11px] text-on-surface-variant space-y-1">
                    <p className="font-semibold text-on-surface flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">security</span>
                      Security note
                    </p>
                    <p>The customer logs in at <strong>/login</strong> — never /admin.</p>
                    <p>Password is encrypted via Supabase Auth and never stored in the customer table.</p>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setLoginModalCustomer(null)}
                      disabled={isCreatingLogin}
                      className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-semibold text-label-md hover:bg-surface-container-low transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingLogin}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-label-md shadow-btn-primary hover:bg-primary-hover transition-all disabled:opacity-60 active:scale-[0.98]"
                    >
                      {isCreatingLogin ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">key</span>
                          <span>Create Customer Login</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Close button after success */}
              {(loginModalSuccess || loginModalCustomer.auth_user_id || createdCredentials) && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setLoginModalCustomer(null)}
                    className="px-5 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 text-on-surface font-semibold text-label-md transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
