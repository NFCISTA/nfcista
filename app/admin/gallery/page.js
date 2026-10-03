"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { isValidHttpUrl } from "@/lib/customers";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthHeader() {
  if (!supabase) return {};
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    // Fall back to HttpOnly cookie
  }
  return {};
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent = "default" }) {
  const accentMap = {
    default: "text-on-surface border-outline-variant/30",
    green: "text-emerald-700 border-emerald-200 bg-emerald-50/30",
    amber: "text-amber-700 border-amber-200 bg-amber-50/30",
    blue: "text-blue-700 border-blue-200 bg-blue-50/30",
  };
  return (
    <div
      className={`flex-1 min-w-0 bg-surface-container-lowest border rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 shadow-xs flex flex-col gap-0.5 ${accentMap[accent] ?? accentMap.default}`}
    >
      <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums">{value ?? "—"}</span>
      <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider opacity-70 truncate block">
        {label}
      </span>
    </div>
  );
}

// ─── Main Admin Gallery Page ──────────────────────────────────────────────────

export default function AdminGalleryPage() {
  // Customers list
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Gallery items for selected customer
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [filterType, setFilterType] = useState("all"); // 'all' | 'portfolio' | 'product'

  // Modal State: Add or Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = add, object = edit
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Modal Form Fields
  const [formType, setFormType] = useState("portfolio");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formExternalUrl, setFormExternalUrl] = useState("");
  const [formCtaText, setFormCtaText] = useState("");
  const [formWhatsappEnabled, setFormWhatsappEnabled] = useState(false);
  const [formIsActive, setFormIsActive] = useState(false);

  // Images state inside edit modal
  const [modalImages, setModalImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  // Delete Confirmation State
  const [deleteItemModal, setDeleteItemModal] = useState(null); // item to delete
  const [isDeleting, setIsDeleting] = useState(false);

  // Reorder State
  const [reordering, setReordering] = useState(false);

  // ─── Load Customers List ────────────────────────────────────────────────────

  const loadCustomers = useCallback(async () => {
    setCustomersLoading(true);
    setErrorMsg("");
    try {
      const headers = await getAuthHeader();
      const res = await fetch("/api/admin/gallery", { headers });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load customers.");
      }
      const data = await res.json();
      setCustomers(data.customers || []);
      // If we don't have a selection yet and there are customers, select the first one
      if (data.customers?.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(data.customers[0].id);
        setSelectedCustomer(data.customers[0]);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to load customers.");
    } finally {
      setCustomersLoading(false);
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // ─── Load Gallery Items for Customer ────────────────────────────────────────

  const loadCustomerItems = useCallback(async (customerId) => {
    if (!customerId) {
      setItems([]);
      return;
    }
    setItemsLoading(true);
    setErrorMsg("");
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`/api/admin/gallery?customerId=${encodeURIComponent(customerId)}`, {
        headers,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load gallery items.");
      }
      const data = await res.json();
      setItems(data.items || []);
      if (data.customer) {
        setSelectedCustomer(data.customer);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to load gallery items.");
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      loadCustomerItems(selectedCustomerId);
    }
  }, [selectedCustomerId, loadCustomerItems]);

  // Handle customer selection change
  function handleCustomerSelect(e) {
    const id = e.target.value;
    setSelectedCustomerId(id);
    const found = customers.find((c) => c.id === id);
    setSelectedCustomer(found || null);
    setErrorMsg("");
    setSuccessMsg("");
  }

  // ─── Modal Open/Close Handlers ──────────────────────────────────────────────

  function openAddModal() {
    setEditingItem(null);
    setFormType("portfolio");
    setFormTitle("");
    setFormDescription("");
    setFormPrice("");
    setFormCategory("");
    setFormExternalUrl("");
    setFormCtaText("");
    setFormWhatsappEnabled(false);
    setFormIsActive(false); // default false per requirements
    setModalImages([]);
    setFormError("");
    setUploadError("");
    setModalOpen(true);
  }

  function openEditModal(item) {
    setEditingItem(item);
    setFormType(item.type || "portfolio");
    setFormTitle(item.title || "");
    setFormDescription(item.description || "");
    setFormPrice(item.price || "");
    setFormCategory(item.category || "");
    setFormExternalUrl(item.external_url || "");
    setFormCtaText(item.cta_text || "");
    setFormWhatsappEnabled(Boolean(item.whatsapp_enabled));
    setFormIsActive(Boolean(item.is_active));
    setModalImages(item.images || []);
    setFormError("");
    setUploadError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (formSubmitting || uploadingImage) return;
    setModalOpen(false);
    setEditingItem(null);
    setFormError("");
    setUploadError("");
  }

  // ─── Form Save (Add / Edit) ─────────────────────────────────────────────────

  async function handleSaveItem(e) {
    e.preventDefault();
    setFormError("");

    if (!selectedCustomerId) {
      setFormError("Please select a customer first.");
      return;
    }

    const cleanTitle = formTitle.trim();
    if (!cleanTitle) {
      setFormError("Title is required.");
      return;
    }
    if (cleanTitle.length > 150) {
      setFormError("Title must be 150 characters or less.");
      return;
    }

    if (formDescription && formDescription.length > 2000) {
      setFormError("Description must be 2000 characters or less.");
      return;
    }

    if (formExternalUrl && formExternalUrl.trim()) {
      if (!isValidHttpUrl(formExternalUrl.trim())) {
        setFormError("External URL must be a valid HTTP or HTTPS address.");
        return;
      }
    }

    setFormSubmitting(true);
    try {
      const headers = await getAuthHeader();
      headers["Content-Type"] = "application/json";

      const payload = {
        customerId: selectedCustomerId,
        type: formType,
        title: cleanTitle,
        description: formDescription.trim() || null,
        price: formPrice.trim() || null,
        category: formCategory.trim() || null,
        external_url: formExternalUrl.trim() || null,
        cta_text: formCtaText.trim() || null,
        whatsapp_enabled: formWhatsappEnabled,
        is_active: formIsActive,
      };

      let res;
      if (editingItem) {
        // Edit existing
        payload.itemId = editingItem.id;
        res = await fetch("/api/admin/gallery", {
          method: "PUT",
          headers,
          body: JSON.stringify(payload),
        });
      } else {
        // Add new
        res = await fetch("/api/admin/gallery", {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to save gallery item.");
      }

      setSuccessMsg(editingItem ? "Item updated successfully." : "Item created successfully.");
      closeModal();
      await loadCustomerItems(selectedCustomerId);
    } catch (err) {
      setFormError(err.message || "Failed to save item.");
    } finally {
      setFormSubmitting(false);
    }
  }

  // ─── Image Upload inside Edit Modal ─────────────────────────────────────────

  async function handleImageFileUpload(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!editingItem) {
      setUploadError("Please save the item first before uploading images.");
      return;
    }

    setUploadError("");
    setUploadingImage(true);

    try {
      const headers = await getAuthHeader();

      for (const file of files) {
        // Client-side validations
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds maximum allowed file size of 5 MB.`);
        }
        const mime = file.type?.toLowerCase();
        if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
          throw new Error(`"${file.name}" has invalid type. Only JPEG, PNG, and WebP are allowed.`);
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("customerId", selectedCustomerId);
        formData.append("galleryItemId", editingItem.id);

        const res = await fetch("/api/admin/gallery/upload", {
          method: "POST",
          headers: {
            ...headers,
          },
          body: formData,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || `Failed to upload ${file.name}.`);
        }

        if (data.image) {
          setModalImages((prev) => [...prev, data.image]);
        }
      }

      // Refresh items in background
      loadCustomerItems(selectedCustomerId);
    } catch (err) {
      setUploadError(err.message || "Image upload failed.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  // ─── Remove Image Handler ───────────────────────────────────────────────────

  async function handleRemoveImage(imageId) {
    if (!editingItem || !selectedCustomerId || !imageId) return;
    setUploadError("");

    try {
      const headers = await getAuthHeader();
      const res = await fetch(
        `/api/admin/gallery/image?customerId=${encodeURIComponent(selectedCustomerId)}&itemId=${encodeURIComponent(editingItem.id)}&imageId=${encodeURIComponent(imageId)}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete image.");
      }

      setModalImages((prev) => prev.filter((img) => img.id !== imageId));
      loadCustomerItems(selectedCustomerId);
    } catch (err) {
      setUploadError(err.message || "Failed to remove image.");
    }
  }

  // ─── Reorder Images inside Edit Modal ───────────────────────────────────────

  async function handleMoveImage(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= modalImages.length) return;

    const newImages = [...modalImages];
    const [moved] = newImages.splice(index, 1);
    newImages.splice(targetIndex, 0, moved);
    setModalImages(newImages);

    try {
      const headers = await getAuthHeader();
      headers["Content-Type"] = "application/json";

      const res = await fetch("/api/admin/gallery/image", {
        method: "POST",
        headers,
        body: JSON.stringify({
          customerId: selectedCustomerId,
          itemId: editingItem.id,
          imageIds: newImages.map((img) => img.id),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to persist image order.");
      }

      loadCustomerItems(selectedCustomerId);
    } catch (err) {
      setUploadError("Could not save new image order.");
    }
  }

  // ─── Toggle Active (Show / Hide) Quick Action ───────────────────────────────

  async function handleToggleActive(item) {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const headers = await getAuthHeader();
      headers["Content-Type"] = "application/json";

      const res = await fetch("/api/admin/gallery", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          itemId: item.id,
          customerId: selectedCustomerId,
          is_active: !item.is_active,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to update visibility.");
      }

      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i))
      );
      setSuccessMsg(`"${item.title}" is now ${!item.is_active ? "Active" : "Hidden"}.`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to toggle status.");
    }
  }

  // ─── Reorder Items (Move Up / Down) ─────────────────────────────────────────

  async function handleMoveItem(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    setReordering(true);
    setErrorMsg("");

    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    setItems(newItems);

    try {
      const headers = await getAuthHeader();
      headers["Content-Type"] = "application/json";

      const res = await fetch("/api/admin/gallery/reorder", {
        method: "POST",
        headers,
        body: JSON.stringify({
          customerId: selectedCustomerId,
          itemIds: newItems.map((i) => i.id),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to save reorder.");
      }

      setSuccessMsg("Order saved.");
    } catch (err) {
      setErrorMsg(err.message || "Failed to save order.");
      // Rollback on error
      loadCustomerItems(selectedCustomerId);
    } finally {
      setReordering(false);
    }
  }

  // ─── Delete Item Handler ────────────────────────────────────────────────────

  async function confirmDeleteItem() {
    if (!deleteItemModal || !selectedCustomerId) return;
    setIsDeleting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const headers = await getAuthHeader();
      const res = await fetch(
        `/api/admin/gallery?customerId=${encodeURIComponent(selectedCustomerId)}&itemId=${encodeURIComponent(deleteItemModal.id)}`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete gallery item.");
      }

      setSuccessMsg(`"${deleteItemModal.title}" deleted.`);
      setDeleteItemModal(null);
      await loadCustomerItems(selectedCustomerId);
    } catch (err) {
      setErrorMsg(err.message || "Failed to delete item.");
    } finally {
      setIsDeleting(false);
    }
  }

  // ─── Filtered Items ─────────────────────────────────────────────────────────

  const filteredItems = items.filter((item) => {
    if (filterType === "portfolio") return item.type === "portfolio";
    if (filterType === "product") return item.type === "product";
    return true;
  });

  const totalCount = items.length;
  const activeCount = items.filter((i) => i.is_active).length;
  const hiddenCount = totalCount - activeCount;
  const portfolioCount = items.filter((i) => i.type === "portfolio").length;
  const productCount = items.filter((i) => i.type === "product").length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]">
              photo_library
            </span>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">
              Portfolio &amp; Product Gallery
            </h1>
          </div>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Manage showcase projects, client portfolios, and products for NFCISTA customer profiles.
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full sm:w-auto">
          <button
            onClick={openAddModal}
            disabled={!selectedCustomerId || customersLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-label-md hover:bg-primary/90 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Add Gallery Item</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {errorMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-error/10 border border-error/20 text-error text-body-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">error</span>
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg("")} className="text-error/70 hover:text-error">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-body-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-700/70 hover:text-emerald-800">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* Customer Selector Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-3.5 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <label htmlFor="customer-select" className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Select Customer Profile
            </label>
            {customersLoading ? (
              <div className="h-10 bg-surface-container-low rounded-xl animate-pulse" />
            ) : customers.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No customers found.</p>
            ) : (
              <div className="relative">
                <select
                  id="customer-select"
                  value={selectedCustomerId}
                  onChange={handleCustomerSelect}
                  className="w-full h-11 px-3.5 pr-10 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-semibold text-body-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all cursor-pointer"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} {c.company_name ? `— ${c.company_name}` : ""} (/p/{c.profile_slug})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  unfold_more
                </span>
              </div>
            )}
          </div>

          {selectedCustomer && (
            <div className="flex items-center gap-2 pt-1 sm:pt-6">
              <Link
                href={`/p/${selectedCustomer.profile_slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-low/50 hover:bg-surface-container-low text-on-surface-variant hover:text-primary text-xs font-semibold transition-all"
                title="Preview public profile"
              >
                <span>View Public Profile</span>
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Counters & Filter Bar */}
      {selectedCustomerId && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <StatCard label="Total Items" value={totalCount} accent="default" />
            <StatCard label="Active (Published)" value={activeCount} accent="green" />
            <StatCard label="Hidden (Draft)" value={hiddenCount} accent="amber" />
            <StatCard
              label="Portfolios / Products"
              value={`${portfolioCount} / ${productCount}`}
              accent="blue"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setFilterType("all")}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  filterType === "all"
                    ? "bg-surface-container-lowest text-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setFilterType("portfolio")}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  filterType === "portfolio"
                    ? "bg-surface-container-lowest text-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Portfolio ({portfolioCount})
              </button>
              <button
                onClick={() => setFilterType("product")}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  filterType === "product"
                    ? "bg-surface-container-lowest text-primary shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Products ({productCount})
              </button>
            </div>

            {reordering && (
              <span className="text-xs text-primary font-semibold animate-pulse">
                Saving order...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Gallery Items Grid / Empty State */}
      {!selectedCustomerId ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">
            account_circle
          </span>
          <p className="mt-2 text-on-surface font-semibold text-body-lg">
            No customer selected
          </p>
          <p className="text-on-surface-variant text-body-sm mt-1">
            Please choose a customer profile above to view or manage gallery items.
          </p>
        </div>
      ) : itemsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-44 bg-surface-container-low rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-surface-container-lowest border border-dashed border-outline-variant/40 rounded-2xl p-12 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">
            photo_library
          </span>
          <p className="mt-2 text-on-surface font-semibold text-body-lg">
            No gallery items yet
          </p>
          <p className="text-on-surface-variant text-body-sm mt-1 max-w-md mx-auto">
            {filterType === "all"
              ? "This customer does not have any portfolio projects or products yet. Click 'Add Gallery Item' to create the first one."
              : `No items matching the '${filterType}' filter.`}
          </p>
          {filterType === "all" && (
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary/90 transition-all shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Create Item</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item, idx) => {
            const primaryImage = item.images?.[0]?.image_url;
            const imgCount = item.images?.length || 0;

            return (
              <div
                key={item.id}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-outline-variant/60 transition-all"
              >
                <div>
                  {/* Top Bar: Reorder Controls + Type Badge + Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      {/* Order Controls */}
                      <button
                        onClick={() => handleMoveItem(idx, -1)}
                        disabled={idx === 0 || reordering}
                        className="w-7 h-7 rounded-lg border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Move Up"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          arrow_upward
                        </span>
                      </button>
                      <button
                        onClick={() => handleMoveItem(idx, 1)}
                        disabled={idx === items.length - 1 || reordering}
                        className="w-7 h-7 rounded-lg border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        title="Move Down"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          arrow_downward
                        </span>
                      </button>
                      <span className="text-[11px] font-mono text-on-surface-variant ml-1 font-semibold">
                        #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Type Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          item.type === "portfolio"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.type}
                      </span>

                      {/* Active Status Badge */}
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all ${
                          item.is_active
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                        title="Click to toggle visibility"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.is_active ? "bg-emerald-600" : "bg-slate-500"
                          }`}
                        />
                        <span>{item.is_active ? "Active" : "Hidden"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Item Content Row: Thumbnail + Info */}
                  <div className="flex gap-3.5">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl bg-surface-container-low border border-outline-variant/30 flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[32px] text-on-surface-variant/40">
                          {item.type === "portfolio" ? "image" : "shopping_bag"}
                        </span>
                      )}
                      {imgCount > 1 && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold font-mono">
                          +{imgCount - 1}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-on-surface text-body-md truncate">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {item.category && (
                          <span className="text-[11px] font-medium text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded">
                            {item.category}
                          </span>
                        )}
                        {item.price && (
                          <span className="text-[11px] font-bold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">
                            {item.price}
                          </span>
                        )}
                        {item.whatsapp_enabled && (
                          <span
                            className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded"
                            title="WhatsApp CTA enabled"
                          >
                            <span className="material-symbols-outlined text-[12px]">chat</span>
                            WhatsApp
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-on-surface-variant text-xs mt-1.5 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3 mt-3">
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">photo_library</span>
                    <span>
                      {imgCount} {imgCount === 1 ? "image" : "images"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-low/40 hover:bg-surface-container-low text-on-surface text-xs font-semibold transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setDeleteItemModal(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-error/20 bg-error/5 hover:bg-error/15 text-error text-xs font-semibold transition-all"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Add / Edit Modal ─────────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-xl my-2 sm:my-8 max-h-[96vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h2 className="text-lg font-bold text-on-surface">
                {editingItem ? "Edit Gallery Item" : "Add Gallery Item"}
              </h2>
              <button
                onClick={closeModal}
                disabled={formSubmitting || uploadingImage}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveItem} className="space-y-4 mt-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Item Type <span className="text-error">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType("portfolio")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      formType === "portfolio"
                        ? "bg-purple-100 border-purple-300 text-purple-900"
                        : "bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">work</span>
                    <span>Portfolio Project</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType("product")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      formType === "product"
                        ? "bg-blue-100 border-blue-300 text-blue-900"
                        : "bg-surface-container-low border-outline-variant/40 text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                    <span>Product Item</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Title <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Modern Brand Identity, NFC Metal Card"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Category & Price Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g. Branding, Hardware"
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    Price (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. ₹1,499, Free Quote"
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  maxLength={2000}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Short summary of this project or product features..."
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              {/* External URL & CTA Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    External Link URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formExternalUrl}
                    onChange={(e) => setFormExternalUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1">
                    CTA Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={formCtaText}
                    onChange={(e) => setFormCtaText(e.target.value)}
                    placeholder="e.g. View Project, Order Now"
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Toggles: WhatsApp CTA & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formWhatsappEnabled}
                    onChange={(e) => setFormWhatsappEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-on-surface block">
                      WhatsApp Inquiry
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Allow direct inquiry tap
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-on-surface block">
                      Active / Published
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Visible on public profile
                    </span>
                  </div>
                </label>
              </div>

              {/* ── Image Upload & Management Section ── */}
              {editingItem ? (
                <div className="border-t border-outline-variant/20 pt-4 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs font-bold text-on-surface uppercase tracking-wider block">
                        Images ({modalImages.length})
                      </span>
                      <span className="text-[11px] text-on-surface-variant">
                        Max 5 MB each (JPEG, PNG, WebP)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-all disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">upload</span>
                      <span>{uploadingImage ? "Uploading..." : "Upload Image"}</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />

                  {uploadError && (
                    <div className="p-2.5 rounded-xl bg-error/10 border border-error/20 text-error text-[11px] mb-2">
                      {uploadError}
                    </div>
                  )}

                  {/* Images Thumbnails Grid */}
                  {modalImages.length === 0 ? (
                    <div className="p-4 rounded-xl bg-surface-container-low/50 border border-dashed border-outline-variant/40 text-center text-xs text-on-surface-variant">
                      No images uploaded yet. Click "Upload Image" to add photos.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-2">
                      {modalImages.map((img, idx) => (
                        <div
                          key={img.id}
                          className="relative group rounded-xl overflow-hidden border border-outline-variant/30 aspect-square bg-surface-container-low"
                        >
                          <img
                            src={img.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          {/* Overlay action bar */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono font-bold text-white bg-black/40 px-1 rounded">
                                #{idx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(img.id)}
                                className="w-5 h-5 rounded bg-error text-white flex items-center justify-center hover:bg-error/80 transition-all"
                                title="Remove Image"
                              >
                                <span className="material-symbols-outlined text-[12px]">delete</span>
                              </button>
                            </div>

                            {/* Left/Right reorder */}
                            <div className="flex justify-between items-center">
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, -1)}
                                disabled={idx === 0}
                                className="w-5 h-5 rounded bg-white/30 text-white flex items-center justify-center disabled:opacity-30 hover:bg-white/50"
                                title="Move left"
                              >
                                <span className="material-symbols-outlined text-[12px]">arrow_left</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, 1)}
                                disabled={idx === modalImages.length - 1}
                                className="w-5 h-5 rounded bg-white/30 text-white flex items-center justify-center disabled:opacity-30 hover:bg-white/50"
                                title="Move right"
                              >
                                <span className="material-symbols-outlined text-[12px]">arrow_right</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">info</span>
                  <span>You can upload multiple project images immediately after creating the item.</span>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formSubmitting || uploadingImage}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-xs font-semibold hover:bg-surface-container-low/80 transition-all text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting || uploadingImage}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs disabled:opacity-50"
                >
                  {formSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingItem ? "Save Changes" : "Create Item"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ────────────────────────────────────────── */}
      {deleteItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-xl">
            <div className="flex items-center gap-3 text-error mb-3">
              <span className="material-symbols-outlined text-[28px]">warning</span>
              <h2 className="text-lg font-bold text-on-surface">Delete Gallery Item</h2>
            </div>

            <p className="text-body-sm text-on-surface-variant">
              Are you sure you want to delete{" "}
              <strong className="text-on-surface">"{deleteItemModal.title}"</strong>?
            </p>
            <p className="text-xs text-on-surface-variant/80 mt-1">
              All associated images will be permanently removed from storage and the database. This action cannot be undone.
            </p>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setDeleteItemModal(null)}
                disabled={isDeleting}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl border border-outline-variant/40 bg-surface-container-low text-on-surface text-xs font-semibold hover:bg-surface-container-low/80 transition-all text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteItem}
                disabled={isDeleting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl bg-error text-white text-xs font-semibold hover:bg-error/90 transition-all shadow-xs disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
