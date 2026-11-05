"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { isValidHttpUrl } from "@/lib/customers";
import { getAuthHeader, getAdminGalleryItems, getDomainFromUrl, isSafeHttpUrl } from "@/lib/gallery";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * CustomerGallerySection
 *
 * Embeds Portfolio & Products management directly inside the Add / Edit Customer modal.
 *
 * @param {{
 *   customerId: string | null,
 *   items: Array<object>,
 *   setItems: React.Dispatch<React.SetStateAction<Array<object>>>,
 *   customerWhatsApp?: string,
 * }} props
 */
export default function CustomerGallerySection({
  customerId,
  items,
  setItems,
  customerWhatsApp,
  profileSlug,
}) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null); // null = adding, number = editing index
  const [isSaving, setIsSaving] = useState(false);
  const [editorError, setEditorError] = useState("");

  // Editor form state
  const [formType, setFormType] = useState("product"); // 'product' | 'portfolio'
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formExternalUrl, setFormExternalUrl] = useState("");
  const [formCtaText, setFormCtaText] = useState("");
  const [formWhatsappEnabled, setFormWhatsappEnabled] = useState(false);
  const [formIsActive, setFormIsActive] = useState(true);

  // Images state inside editor
  const [pendingFiles, setPendingFiles] = useState([]); // Array<File>
  const [pendingPreviews, setPendingPreviews] = useState([]); // Array<string object URLs>
  const [existingImages, setExistingImages] = useState([]); // Array<{ id, image_url, display_order }>
  const [deletedImageIds, setDeletedImageIds] = useState([]); // Array<string>
  const fileInputRef = useRef(null);

  // ---------------------------------------------------------------------------
  // Editor Open / Close
  // ---------------------------------------------------------------------------

  const safeItems = Array.isArray(items) ? items : [];

  function openAddItem(type = "product") {
    setEditingIndex(null);
    setFormType(type);
    setFormTitle("");
    setFormDescription("");
    setFormPrice("");
    setFormCategory("");
    setFormExternalUrl("");
    setFormCtaText("");
    setFormWhatsappEnabled(false);
    setFormIsActive(true);
    setPendingFiles([]);
    setPendingPreviews([]);
    setExistingImages([]);
    setDeletedImageIds([]);
    setEditorError("");
    setIsEditorOpen(true);
  }

  function openEditItem(index) {
    const item = safeItems[index];
    if (!item) return;

    const isExt = Boolean(item.is_external_link || item.category === "external_link");
    setEditingIndex(index);
    setFormType(isExt ? "external_link" : (item.type || "product"));
    setFormTitle(item.title || "");
    setFormDescription(item.description || "");
    setFormPrice(item.price || "");
    setFormCategory(item.category || "");
    setFormExternalUrl(item.external_url || "");
    setFormCtaText(item.cta_text || "");
    setFormWhatsappEnabled(Boolean(item.whatsapp_enabled));
    setFormIsActive(item.is_active !== undefined ? Boolean(item.is_active) : true);

    setPendingFiles(item.pendingFiles || []);
    setPendingPreviews(item.pendingPreviews || []);
    setExistingImages(item.images || []);
    setDeletedImageIds([]);
    setEditorError("");
    setIsEditorOpen(true);
  }

  function closeEditor() {
    if (isSaving) return;
    setIsEditorOpen(false);
    setEditingIndex(null);
    setEditorError("");
  }

  // ---------------------------------------------------------------------------
  // File Upload Handlers (Client-Side)
  // ---------------------------------------------------------------------------

  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = [];
    const validPreviews = [];

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        setEditorError("Only JPEG, PNG, and WebP images are allowed.");
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setEditorError("Image size must be 5 MB or less.");
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      setPendingFiles((prev) => [...prev, ...validFiles]);
      setPendingPreviews((prev) => [...prev, ...validPreviews]);
      setEditorError("");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removePendingFile(idx) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  function removeExistingImage(imageId) {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    setDeletedImageIds((prev) => [...prev, imageId]);
  }

  // ---------------------------------------------------------------------------
  // Save Item (Local State or Live API if customerId exists)
  // ---------------------------------------------------------------------------

  async function handleSaveItem() {
    setEditorError("");
    const cleanTitle = formTitle.trim();
    if (!cleanTitle) {
      setEditorError("Title is required.");
      return;
    }
    if (cleanTitle.length > 150) {
      setEditorError("Title must be 150 characters or less.");
      return;
    }
    if (formDescription && formDescription.length > 2000) {
      setEditorError("Description must be 2000 characters or less.");
      return;
    }

    const isExternal = formType === "external_link";
    const itemType = isExternal ? "portfolio" : formType;
    const itemCategory = isExternal ? (formCategory.trim() || "external_link") : (formCategory.trim() || null);

    if (isExternal) {
      const cleanUrl = formExternalUrl ? formExternalUrl.trim() : "";
      if (!cleanUrl || !isSafeHttpUrl(cleanUrl) || !isValidHttpUrl(cleanUrl)) {
        setEditorError("Destination URL is required and must be a valid HTTP or HTTPS address.");
        return;
      }
    } else if (formExternalUrl && formExternalUrl.trim() && (!isSafeHttpUrl(formExternalUrl.trim()) || !isValidHttpUrl(formExternalUrl.trim()))) {
      setEditorError("External URL must be a valid HTTP or HTTPS address.");
      return;
    }

    // ── CASE A: Existing Customer (Edit Mode) -> Save directly to API ──────────
    if (customerId) {
      setIsSaving(true);
      try {
        const headers = await getAuthHeader();
        headers["Content-Type"] = "application/json";

        let currentItemId = null;
        const currentItem = editingIndex !== null ? safeItems[editingIndex] : null;

        if (currentItem?.id) {
          // Update existing DB item
          currentItemId = currentItem.id;
          const putRes = await fetch("/api/admin/gallery", {
            method: "PUT",
            headers,
            body: JSON.stringify({
              id: currentItemId,
              customerId,
              type: itemType,
              title: cleanTitle,
              description: formDescription.trim() || null,
              price: formType === "product" ? formPrice.trim() || null : null,
              category: itemCategory,
              external_url: formExternalUrl.trim() || null,
              cta_text: formCtaText.trim() || null,
              whatsapp_enabled: formType === "product" ? formWhatsappEnabled : false,
              is_active: formIsActive,
              is_external_link: isExternal,
            }),
          });
          if (!putRes.ok) {
            const err = await putRes.json().catch(() => ({}));
            throw new Error(err.error || "Failed to update gallery item.");
          }
        } else {
          // Create new item for this existing customer
          const postRes = await fetch("/api/admin/gallery", {
            method: "POST",
            headers,
            body: JSON.stringify({
              customerId,
              type: itemType,
              title: cleanTitle,
              description: formDescription.trim() || null,
              price: formType === "product" ? formPrice.trim() || null : null,
              category: itemCategory,
              external_url: formExternalUrl.trim() || null,
              cta_text: formCtaText.trim() || null,
              whatsapp_enabled: formType === "product" ? formWhatsappEnabled : false,
              is_active: formIsActive,
              is_external_link: isExternal,
              display_order: safeItems.length,
            }),
          });
          if (!postRes.ok) {
            const err = await postRes.json().catch(() => ({}));
            throw new Error(err.error || "Failed to create gallery item.");
          }
          const postData = await postRes.json();
          currentItemId = postData?.item?.id;
        }

        // Delete removed existing images from DB/storage
        if (deletedImageIds.length > 0) {
          for (const imgId of deletedImageIds) {
            try {
              const authH = await getAuthHeader();
              await fetch(`/api/admin/gallery/image?imageId=${imgId}&customerId=${customerId}`, {
                method: "DELETE",
                headers: authH,
              });
            } catch (delErr) {
              console.warn("Failed to delete gallery image:", delErr);
            }
          }
        }

        // Upload any newly selected pending files
        if (currentItemId && pendingFiles.length > 0) {
          for (const file of pendingFiles) {
            const authH = await getAuthHeader();
            const fd = new FormData();
            fd.append("file", file);
            fd.append("customerId", customerId);
            fd.append("galleryItemId", currentItemId);

            const uploadRes = await fetch("/api/admin/gallery/upload", {
              method: "POST",
              headers: authH,
              body: fd,
            });
            if (!uploadRes.ok) {
              const uErr = await uploadRes.json().catch(() => ({}));
              console.warn("Image upload warning:", uErr.error);
            }
          }
        }

        // Refresh items from API to ensure exact synchronization
        const refreshed = await getAdminGalleryItems(customerId);
        setItems(refreshed);
        setIsEditorOpen(false);
      } catch (err) {
        console.error("Save item error:", err);
        setEditorError(err.message || "Failed to save gallery item.");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // ── CASE B: New Customer (Add Mode) -> Keep in local state ─────────────────
    const stagedItem = {
      type: itemType,
      title: cleanTitle,
      description: formDescription.trim() || "",
      price: formType === "product" ? formPrice.trim() : "",
      category: itemCategory || "",
      external_url: formExternalUrl.trim() || "",
      cta_text: formCtaText.trim() || "",
      whatsapp_enabled: formType === "product" ? formWhatsappEnabled : false,
      is_active: formIsActive,
      is_external_link: isExternal,
      pendingFiles: isExternal ? [] : [...pendingFiles],
      pendingPreviews: isExternal ? [] : [...pendingPreviews],
      images: isExternal ? [] : existingImages,
      display_order: editingIndex !== null ? (safeItems[editingIndex]?.display_order ?? safeItems.length) : safeItems.length,
    };

    if (editingIndex !== null) {
      setItems((prev) => {
        const copy = [...prev];
        copy[editingIndex] = stagedItem;
        return copy;
      });
    } else {
      setItems((prev) => [...prev, stagedItem]);
    }

    setIsEditorOpen(false);
  }

  // ---------------------------------------------------------------------------
  // Item Row Actions (Delete, Active Toggle, Reorder)
  // ---------------------------------------------------------------------------

  async function handleDeleteItem(index) {
    const item = safeItems[index];
    if (!item) return;

    if (customerId && item.id) {
      try {
        const headers = await getAuthHeader();
        const res = await fetch(`/api/admin/gallery?id=${item.id}&customerId=${customerId}`, {
          method: "DELETE",
          headers,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Failed to delete item.");
        }
      } catch (err) {
        console.error("Delete gallery item error:", err);
        alert(err.message || "Failed to delete item.");
        return;
      }
    }

    setItems((prev) => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setIsEditorOpen(false);
      setEditingIndex(null);
    }
  }

  async function handleToggleActive(index) {
    const item = safeItems[index];
    if (!item) return;
    const newStatus = !item.is_active;

    if (customerId && item.id) {
      try {
        const headers = await getAuthHeader();
        headers["Content-Type"] = "application/json";
        const res = await fetch("/api/admin/gallery", {
          method: "PUT",
          headers,
          body: JSON.stringify({
            id: item.id,
            customerId,
            is_active: newStatus,
          }),
        });
        if (!res.ok) {
          throw new Error("Failed to update status.");
        }
      } catch (err) {
        console.error("Toggle status error:", err);
        return;
      }
    }

    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], is_active: newStatus };
      return copy;
    });
  }

  async function handleMove(index, direction) {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= safeItems.length) return;

    const newItems = [...safeItems];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    // Update display_order property sequentially
    const ordered = newItems.map((it, idx) => ({ ...it, display_order: idx }));
    setItems(ordered);

    if (customerId) {
      try {
        const headers = await getAuthHeader();
        headers["Content-Type"] = "application/json";
        await fetch("/api/admin/gallery/reorder", {
          method: "POST",
          headers,
          body: JSON.stringify({
            customerId,
            items: ordered.filter((it) => it.id).map((it) => ({ id: it.id, display_order: it.display_order })),
          }),
        });
      } catch (err) {
        console.error("Reorder save error:", err);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const mediaItems = safeItems.filter(
    (i) => !i.is_external_link && i.category !== "external_link"
  );
  const externalLinkItems = safeItems.filter(
    (i) => i.is_external_link || i.category === "external_link"
  );

  return (
    <div
      className="space-y-4 pt-3 border-t border-outline-variant/20"
      onKeyDown={(e) => {
        // Isolate portfolio operations: prevent Enter key inside portfolio section from triggering outer customer form submission
        if (e.key === "Enter") {
          e.stopPropagation();
          if (e.target.tagName === "INPUT") {
            e.preventDefault();
            // If in the item editor, Enter key can safely trigger item save instead of outer customer submit
            if (isEditorOpen && !isSaving) {
              handleSaveItem();
            }
          }
        }
      }}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex items-center gap-2 text-label-sm font-bold uppercase tracking-wider text-primary">
          <span className="material-symbols-outlined text-[18px]">collections_bookmark</span>
          <span>Products &amp; Portfolio Showcase</span>
          {mediaItems.length > 0 && (
            <span className="text-[11px] font-semibold text-tertiary lowercase bg-surface-container-low px-2 py-0.5 rounded-full">
              {mediaItems.length} {mediaItems.length === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {/* Add Action Buttons */}
        {!isEditorOpen && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openAddItem("product")}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-label-sm font-semibold transition-colors active:scale-[0.98] flex-1 sm:flex-none"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Product / Service</span>
            </button>
            <button
              type="button"
              onClick={() => openAddItem("portfolio")}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container-low text-on-surface text-label-sm font-semibold transition-colors active:scale-[0.98] flex-1 sm:flex-none"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Add Portfolio Project</span>
            </button>
            <button
              type="button"
              onClick={() => openAddItem("external_link")}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-label-sm font-semibold transition-colors active:scale-[0.98] flex-1 sm:flex-none"
            >
              <span className="material-symbols-outlined text-[16px]">add_link</span>
              <span>Add External Link</span>
            </button>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* ITEM EDITOR PANEL (Inline Card inside Modal)                           */}
      {/* ---------------------------------------------------------------------- */}
      {isEditorOpen && (
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low/60 border border-primary/25 space-y-4 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  formType === "product"
                    ? "bg-blue-100 text-blue-800"
                    : formType === "external_link"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                {formType === "product"
                  ? "Product / Service"
                  : formType === "external_link"
                  ? "External Portfolio Link"
                  : "Portfolio Project"}
              </span>
              <span className="text-label-md font-bold text-on-surface">
                {editingIndex !== null
                  ? formType === "external_link"
                    ? "Edit External Link"
                    : "Edit Item"
                  : formType === "external_link"
                  ? "Add External Link"
                  : "Add New Item"}
              </span>
            </div>
            <button
              type="button"
              onClick={closeEditor}
              disabled={isSaving}
              className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              title="Close editor"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {editorError && (
            <div className="p-3 rounded-xl bg-error-container/40 border border-error/30 text-on-error-container text-body-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-error">error</span>
              <span>{editorError}</span>
            </div>
          )}

          {/* Type Selector (Pills) */}
          <div>
            <label className="block text-label-sm font-semibold text-on-surface-variant mb-1.5">
              Item Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormType("product")}
                className={`flex-1 py-2 px-3 rounded-xl text-label-sm font-semibold transition-all border ${
                  formType === "product"
                    ? "bg-primary text-on-primary border-primary shadow-xs"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/40 hover:bg-surface-container-low"
                }`}
              >
                Product / Service
              </button>
              <button
                type="button"
                onClick={() => setFormType("portfolio")}
                className={`flex-1 py-2 px-3 rounded-xl text-label-sm font-semibold transition-all border ${
                  formType === "portfolio"
                    ? "bg-primary text-on-primary border-primary shadow-xs"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/40 hover:bg-surface-container-low"
                }`}
              >
                Portfolio Project
              </button>
              <button
                type="button"
                onClick={() => setFormType("external_link")}
                className={`flex-1 py-2 px-3 rounded-xl text-label-sm font-semibold transition-all border ${
                  formType === "external_link"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/40 hover:bg-surface-container-low"
                }`}
              >
                External Link
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
              {formType === "product"
                ? "Product / Service Name *"
                : formType === "external_link"
                ? "Link Title *"
                : "Project Title *"}
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder={
                formType === "product"
                  ? "e.g. NFC Smart Business Card"
                  : formType === "external_link"
                  ? "e.g. Behance UX Case Studies or GitHub Profile"
                  : "e.g. Modern Restaurant Branding"
              }
              className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Destination URL (External Link Mode Only) */}
          {formType === "external_link" && (
            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                Destination URL <span className="text-error">*</span>
              </label>
              <input
                type="url"
                required
                value={formExternalUrl}
                onChange={(e) => setFormExternalUrl(e.target.value)}
                placeholder="https://behance.net/gallery/... or https://github.com/..."
                className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-[11px] text-tertiary mt-1">
                Must be a valid HTTP or HTTPS link (e.g. Behance, Dribbble, GitHub, YouTube, portfolio site).
              </p>
            </div>
          )}

          {/* Image Upload Area (Product & Portfolio only; hidden in External Link mode) */}
          {formType !== "external_link" && (
            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                Images {formType === "portfolio" && <span className="text-[11px] font-normal text-tertiary">(Multiple supported)</span>}
              </label>

              {/* Existing & Pending Image Previews */}
              {(existingImages.length > 0 || pendingPreviews.length > 0) && (
                <div className="flex flex-wrap gap-2.5 mb-3">
                  {/* Existing uploaded images */}
                  {existingImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-outline-variant/40 bg-surface-container-lowest group"
                    >
                      <Image
                        src={img.image_url}
                        alt="Thumbnail"
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-error text-white flex items-center justify-center transition-colors"
                        title="Remove image"
                      >
                        <span className="material-symbols-outlined text-[13px]">close</span>
                      </button>
                    </div>
                  ))}

                  {/* Newly selected pending image files */}
                  {pendingPreviews.map((url, pIdx) => (
                    <div
                      key={pIdx}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/40 bg-surface-container-lowest group"
                    >
                      <img
                        src={url}
                        alt="Pending Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePendingFile(pIdx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-error text-white flex items-center justify-center transition-colors"
                        title="Remove image"
                      >
                        <span className="material-symbols-outlined text-[13px]">close</span>
                      </button>
                      <span className="absolute bottom-0 inset-x-0 bg-primary/80 text-[9px] text-white text-center font-bold py-0.5">
                        New
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple={formType === "portfolio"}
                onChange={handleFileSelect}
                className="hidden"
                id="gallery-item-image-upload"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container-low text-on-surface text-label-sm font-semibold transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                <span>
                  {existingImages.length === 0 && pendingPreviews.length === 0
                    ? "Upload Image"
                    : "Add More Images"}
                </span>
              </button>
              <p className="text-[11px] text-tertiary mt-1.5">
                Allowed: JPG, PNG, WebP. Maximum size: 5 MB per image.
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
              Short Description <span className="text-[11px] font-normal text-tertiary">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder={
                formType === "external_link"
                  ? "Brief summary or context for this portfolio showcase..."
                  : "Brief description of this item or project..."
              }
              className="w-full p-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Price (Product only) & Category (Product/Portfolio only; hidden in External Link mode) */}
          {formType !== "external_link" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Price: only shown for products, hidden for portfolio */}
              {formType === "product" && (
                <div>
                  <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                    Price <span className="text-[11px] font-normal text-tertiary">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. ₹499"
                    className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              <div>
                <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                  Category <span className="text-[11px] font-normal text-tertiary">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="e.g. NFC Cards or Web Design"
                  className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* Button Text (External Link mode) */}
          {formType === "external_link" && (
            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                Button Text <span className="text-[11px] font-normal text-tertiary">(Optional)</span>
              </label>
              <input
                type="text"
                value={formCtaText}
                onChange={(e) => setFormCtaText(e.target.value)}
                placeholder="e.g. View Portfolio or View Case Study"
                className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Project Link & Button Text (Product/Portfolio mode only; hidden in External Link mode) */}
          {formType !== "external_link" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                  {formType === "product" ? "Product Link" : "Project Link"}{" "}
                  <span className="text-[11px] font-normal text-tertiary">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={formExternalUrl}
                  onChange={(e) => setFormExternalUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-on-surface-variant mb-1">
                  Button Text <span className="text-[11px] font-normal text-tertiary">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formCtaText}
                  onChange={(e) => setFormCtaText(e.target.value)}
                  placeholder={formType === "product" ? "View Product" : "View Details"}
                  className="w-full h-11 px-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-on-surface text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {/* WhatsApp CTA Toggle (Product Only) */}
          {formType === "product" && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <div className="space-y-0.5 pr-2">
                <span className="text-label-sm font-semibold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#25D366]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                  <span>WhatsApp Order CTA</span>
                </span>
                <p className="text-[11.5px] text-on-surface-variant leading-snug">
                  {customerWhatsApp ? (
                    <>
                      Uses customer WhatsApp: <span className="font-mono text-primary font-semibold">{customerWhatsApp}</span>
                      <br />
                      Prefilled text: &ldquo;Hi, I am interested in {formTitle.trim() || "[Product Name]"}.&rdquo;
                    </>
                  ) : (
                    <span className="text-amber-700">
                      Enter a WhatsApp number in Contact Information to enable direct WhatsApp ordering.
                    </span>
                  )}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formWhatsappEnabled}
                  onChange={(e) => setFormWhatsappEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]" />
              </label>
            </div>
          )}

          {/* Active / Show on Profile Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
            <div>
              <span className="text-label-sm font-semibold text-on-surface">
                Individual Item Visibility
              </span>
              <p className="text-[11.5px] text-on-surface-variant">
                Controls whether this specific item appears on the card. Independent of customer account active status.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>

          {/* Editor Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={closeEditor}
              className="px-4 py-2 rounded-xl border border-outline-variant/40 text-on-surface text-label-sm font-semibold hover:bg-surface-container-lowest transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveItem}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-label-sm font-semibold shadow-btn-primary transition-all disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>
                  {editingIndex !== null
                    ? formType === "external_link"
                      ? "Update External Link"
                      : "Update Item"
                    : formType === "external_link"
                    ? "Save External Link"
                    : "Save Item"}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* PRODUCTS & PORTFOLIO PROJECTS LIST                                     */}
      {/* ---------------------------------------------------------------------- */}
      {mediaItems.length === 0 && !isEditorOpen ? (
        <div className="p-4 sm:p-5 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/20 text-center space-y-1.5">
          <span className="material-symbols-outlined text-[26px] text-outline">
            collections
          </span>
          <p className="text-body-sm font-medium text-on-surface">
            No products or portfolio projects yet
          </p>
          <p className="text-[11.5px] text-tertiary max-w-sm mx-auto">
            Add products, services, or portfolio projects to showcase work on this customer&apos;s digital business card.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {mediaItems.map((item, mIdx) => {
            const origIdx = safeItems.indexOf(item);
            const hasImages = item.images && item.images.length > 0;
            const hasPendingPreviews = item.pendingPreviews && item.pendingPreviews.length > 0;
            const thumbUrl = hasImages
              ? item.images[0].image_url
              : hasPendingPreviews
              ? item.pendingPreviews[0]
              : null;

            return (
              <div
                key={item.id || item.tempId || origIdx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-xs"
              >
                {/* Details & Thumbnail */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Thumbnail */}
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-surface-container-low shrink-0 flex items-center justify-center border border-outline-variant/20">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-[22px] text-outline">
                        {item.type === "product" ? "inventory_2" : "collections"}
                      </span>
                    )}
                    {/* Badge for multiple images */}
                    {((item.images?.length || 0) + (item.pendingPreviews?.length || 0) > 1) && (
                      <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[9px] px-1 rounded-tl font-bold">
                        {(item.images?.length || 0) + (item.pendingPreviews?.length || 0)}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          item.type === "product"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {item.type === "product" ? "Product" : "Portfolio"}
                      </span>
                      <h4 className="text-label-sm font-bold text-on-surface truncate">
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-on-surface-variant flex-wrap">
                      {item.type === "product" && item.price && (
                        <span className="font-semibold text-primary">{item.price}</span>
                      )}
                      {item.category && <span>{item.category}</span>}
                      {item.whatsapp_enabled && (
                        <span className="inline-flex items-center gap-0.5 text-emerald-700 font-medium">
                          <span className="material-symbols-outlined text-[12px]">chat</span>
                          <span>WhatsApp</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Pill & Action Controls */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20 shrink-0">
                  {/* Status Pill */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(origIdx)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors shrink-0 ${
                      item.is_active
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                    title="Click to toggle visibility"
                  >
                    {item.is_active ? "Active" : "Hidden"}
                  </button>

                  {/* Controls: Reorder, Edit, Delete */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={mIdx === 0}
                      onClick={() => handleMove(origIdx, "up")}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low disabled:opacity-30 disabled:pointer-events-none"
                      title="Move up"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                    </button>
                    <button
                      type="button"
                      disabled={mIdx === mediaItems.length - 1}
                      onClick={() => handleMove(origIdx, "down")}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low disabled:opacity-30 disabled:pointer-events-none"
                      title="Move down"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditItem(origIdx)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                      title="Edit item"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(origIdx)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30"
                      title="Delete item"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------------------------------------------------------------- */}
      {/* ── DEDICATED SECTION: EXTERNAL PORTFOLIO LINKS                         */}
      {/* ---------------------------------------------------------------------- */}
      <div className="pt-5 border-t border-outline-variant/30 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">link</span>
              <h3 className="text-label-sm font-bold uppercase tracking-wider text-primary">
                External Portfolio Links
              </h3>
              <span className="text-[11px] font-semibold text-tertiary lowercase bg-surface-container-low px-2 py-0.5 rounded-full">
                {externalLinkItems.length} {externalLinkItems.length === 1 ? "link" : "links"}
              </span>
            </div>
            <p className="text-[11.5px] text-on-surface-variant mt-0.5">
              Add external showcase links (Behance, Dribbble, GitHub, ArtStation, YouTube, or custom websites). Visitors can preview them via dedicated NFCISTA preview pages.
            </p>
          </div>

          {!isEditorOpen && (
            <button
              type="button"
              onClick={() => openAddItem("external_link")}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-label-sm font-semibold transition-colors active:scale-[0.98] self-start sm:self-auto shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">add_link</span>
              <span>Add External Link</span>
            </button>
          )}
        </div>

        {/* Links list or Empty State */}
        {externalLinkItems.length === 0 ? (
          <div className="p-5 rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/20 text-center space-y-1.5">
            <span className="material-symbols-outlined text-[26px] text-outline">link_off</span>
            <p className="text-body-sm font-medium text-on-surface">No external portfolio links yet</p>
            <p className="text-[11px] text-tertiary max-w-sm mx-auto">
              Add links to Behance, GitHub, Dribbble, YouTube, or your custom portfolio site.
            </p>
            {!isEditorOpen && (
              <button
                type="button"
                onClick={() => openAddItem("external_link")}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/40 text-primary text-label-sm font-semibold hover:bg-primary/5 transition-colors cursor-pointer mt-1"
              >
                <span className="material-symbols-outlined text-[14px]">add_link</span>
                <span>Add First Link</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {externalLinkItems.map((item, eIdx) => {
              const origIdx = safeItems.indexOf(item);
              const domain = item.domain || (item.external_url ? getDomainFromUrl(item.external_url) : null);
              const previewHref = profileSlug && item.id
                ? `/p/${encodeURIComponent(profileSlug)}/portfolio/${item.id}`
                : null;

              return (
                <div
                  key={item.id || item.tempId || origIdx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:border-outline-variant/60 transition-all shadow-xs"
                >
                  {/* Details */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">language</span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                          External Link
                        </span>
                        <h4 className="text-label-sm font-bold text-on-surface truncate">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-on-surface-variant flex-wrap">
                        {domain && (
                          <span className="font-mono text-primary font-semibold text-[10.5px] truncate max-w-xs">
                            {domain}
                          </span>
                        )}
                        {item.external_url && (
                          <span className="font-mono text-tertiary text-[10px] truncate max-w-xs select-all">
                            {item.external_url}
                          </span>
                        )}
                        {previewHref && (
                          <a
                            href={previewHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-primary text-[10.5px] font-medium hover:underline ml-1"
                            title="Open preview page"
                          >
                            <span>Preview</span>
                            <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(origIdx)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors shrink-0 ${
                        item.is_active
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                      title="Click to toggle visibility"
                    >
                      {item.is_active ? "Active" : "Hidden"}
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={eIdx === 0}
                        onClick={() => handleMove(origIdx, "up")}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low disabled:opacity-30 disabled:pointer-events-none"
                        title="Move up"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                      </button>
                      <button
                        type="button"
                        disabled={eIdx === externalLinkItems.length - 1}
                        onClick={() => handleMove(origIdx, "down")}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low disabled:opacity-30 disabled:pointer-events-none"
                        title="Move down"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditItem(origIdx)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                        title="Edit link"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(origIdx)}
                        className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30"
                        title="Delete link"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
