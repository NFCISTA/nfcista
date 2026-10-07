"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function CustomerGalleryManager({ customer }) {
  const [activeTab, setActiveTab] = useState("product"); // "product" | "portfolio"
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Editor modal/drawer state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null); // null = adding new, object = editing existing
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState("");

  // Editor form inputs
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    external_url: "",
    cta_text: "",
    whatsapp_enabled: false,
    is_active: true,
  });

  // Images state during editing
  const [itemImages, setItemImages] = useState([]); // existing images [{ id, image_url, display_order }]
  const [pendingUploads, setPendingUploads] = useState([]); // new files waiting to upload
  const [pendingPreviews, setPendingPreviews] = useState([]); // preview URLs for new files
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Load customer gallery items on mount
  useEffect(() => {
    loadGalleryItems();
  }, []);

  async function loadGalleryItems() {
    try {
      setLoading(true);
      setErrorMsg("");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch("/api/customer/gallery", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Unable to load items.");
      } else {
        setItems(data.items || []);
      }
    } catch {
      setErrorMsg("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  // Filter items by current tab
  const productItems = items.filter((i) => i.type === "product");
  const portfolioItems = items.filter((i) => i.type === "portfolio");
  const displayedItems = activeTab === "product" ? productItems : portfolioItems;

  // Open editor for adding
  function openAddModal(type) {
    setEditingItem(null);
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "",
      external_url: "",
      cta_text: "",
      whatsapp_enabled: false,
      is_active: true,
    });
    setItemImages([]);
    setPendingUploads([]);
    setPendingPreviews([]);
    setEditorError("");
    setIsEditorOpen(true);
  }

  // Open editor for editing
  function openEditModal(item) {
    setEditingItem(item);
    setFormData({
      title: item.title || "",
      description: item.description || "",
      price: item.price || "",
      category: item.category || "",
      external_url: item.external_url || "",
      cta_text: item.cta_text || "",
      whatsapp_enabled: Boolean(item.whatsapp_enabled),
      is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
    });
    setItemImages(item.images || []);
    setPendingUploads([]);
    setPendingPreviews([]);
    setEditorError("");
    setIsEditorOpen(true);
  }

  function closeEditor() {
    if (saving || uploadingImage) return;
    setIsEditorOpen(false);
    setEditingItem(null);
    setEditorError("");
    setPendingUploads([]);
    setPendingPreviews([]);
  }

  // Handle file selection from local device
  function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = [];
    const previews = [];

    for (const file of files) {
      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        setEditorError("Only JPG, PNG, and WebP images are allowed.");
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setEditorError("Each image must be 5 MB or less.");
        continue;
      }
      validFiles.push(file);
      previews.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      setPendingUploads((prev) => [...prev, ...validFiles]);
      setPendingPreviews((prev) => [...prev, ...previews]);
      setEditorError("");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removePendingUpload(index) {
    setPendingUploads((prev) => prev.filter((_, i) => i !== index));
    setPendingPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  // Delete an existing uploaded image
  async function handleDeleteImage(imageId) {
    if (!editingItem) return;
    try {
      setUploadingImage(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch(`/api/customer/gallery/image?itemId=${editingItem.id}&imageId=${imageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setEditorError(data.error || "Failed to delete image.");
        return;
      }

      setItemImages((prev) => prev.filter((img) => img.id !== imageId));
      // Also update in parent items list
      setItems((prev) =>
        prev.map((it) =>
          it.id === editingItem.id
            ? { ...it, images: (it.images || []).filter((im) => im.id !== imageId) }
            : it
        )
      );
    } catch {
      setEditorError("Network error deleting image.");
    } finally {
      setUploadingImage(false);
    }
  }

  // Save (Create or Update) Item
  async function handleSaveItem(e) {
    e.preventDefault();
    setSaving(true);
    setEditorError("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Session expired. Please log in again.");

      const isEditing = Boolean(editingItem);
      const url = "/api/customer/gallery";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        type: activeTab,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: activeTab === "product" ? formData.price.trim() || null : null,
        category: formData.category.trim() || null,
        external_url: formData.external_url.trim() || null,
        cta_text: formData.cta_text.trim() || null,
        whatsapp_enabled: activeTab === "product" ? formData.whatsapp_enabled : false,
        is_active: formData.is_active,
      };

      if (isEditing) {
        payload.itemId = editingItem.id;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to save item.");
      }

      const savedItem = resData.item;
      let finalItem = savedItem;

      // Upload any pending images
      if (pendingUploads.length > 0) {
        setUploadingImage(true);
        for (const file of pendingUploads) {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("galleryItemId", savedItem.id);

          const upRes = await fetch("/api/customer/gallery/upload", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
            body: fd,
          });

          if (!upRes.ok) {
            const upData = await upRes.json().catch(() => ({}));
            console.error("Image upload failed:", upData.error);
          }
        }
      }

      // Refresh list to ensure accurate sync
      await loadGalleryItems();

      setSuccessMsg(
        isEditing
          ? `${activeTab === "product" ? "Product" : "Portfolio item"} updated successfully!`
          : `${activeTab === "product" ? "Product" : "Portfolio item"} created successfully!`
      );
      setTimeout(() => setSuccessMsg(""), 5000);
      closeEditor();
    } catch (err) {
      setEditorError(err.message || "An error occurred.");
    } finally {
      setSaving(false);
      setUploadingImage(false);
    }
  }

  // Delete an entire item
  async function handleDeleteItem(item) {
    const itemLabel = item.type === "product" ? "product" : "portfolio item";
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const res = await fetch(`/api/customer/gallery?itemId=${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error || "Failed to delete item.");
        return;
      }

      setItems((prev) => prev.filter((it) => it.id !== item.id));
      setSuccessMsg(`Deleted ${itemLabel} successfully.`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch {
      setErrorMsg("Network error deleting item.");
    }
  }

  // Reorder items: Move up or down
  async function handleMove(index, direction) {
    const list = [...displayedItems];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    // Swap in displayed list
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    // Build complete updated items array
    const otherItems = items.filter((i) => i.type !== activeTab);
    const updatedFullList = [...otherItems, ...list];
    setItems(updatedFullList);

    // Persist new order for displayed list to API
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const itemIds = list.map((i) => i.id);
      await fetch("/api/customer/gallery/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ itemIds }),
      });
    } catch (err) {
      console.error("Reorder failed:", err);
    }
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 sm:p-7 shadow-card space-y-6">
      {/* ── Section Header & Tab Controls ─────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">
              {activeTab === "product" ? "inventory_2" : "photo_library"}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-on-surface">
              Showcase &amp; Offerings
            </h2>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Display your products, services, and creative portfolio directly on your public digital card.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-surface-container-low p-1 rounded-2xl border border-outline-variant/30 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("product")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "product"
                ? "bg-surface-container-lowest text-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
            <span>Products &amp; Services</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary">
              {productItems.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("portfolio")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "portfolio"
                ? "bg-surface-container-lowest text-primary shadow-xs"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">collections</span>
            <span>Portfolio / Gallery</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/10 text-primary">
              {portfolioItems.length}
            </span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Action Bar: Add Item ──────────────────────────── */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
          {activeTab === "product" ? "Your Products & Services" : "Your Portfolio Items"}
        </span>

        <button
          type="button"
          onClick={() => openAddModal(activeTab)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-sm hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>{activeTab === "product" ? "Add Product / Service" : "Add Portfolio Item"}</span>
        </button>
      </div>

      {/* ── List of Items ─────────────────────────────────── */}
      {loading ? (
        <div className="p-8 text-center text-on-surface-variant text-xs space-y-2">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p>Loading items...</p>
        </div>
      ) : displayedItems.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-outline-variant/50 text-center space-y-3 bg-surface-container-low/20">
          <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center mx-auto text-on-surface-variant/60">
            <span className="material-symbols-outlined text-[28px]">
              {activeTab === "product" ? "inventory_2" : "collections"}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">
              {activeTab === "product" ? "No Products or Services Added Yet" : "No Portfolio Items Added Yet"}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
              {activeTab === "product"
                ? "Showcase your menu, catalog, or services with prices and WhatsApp ordering buttons."
                : "Add visual highlights, project photos, or case studies to impress visitors."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openAddModal(activeTab)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-primary/30 text-primary text-xs font-bold hover:bg-primary/5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            <span>Add First {activeTab === "product" ? "Product" : "Item"}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedItems.map((item, index) => {
            const hasImages = item.images && item.images.length > 0;
            const thumbUrl = hasImages ? item.images[0].image_url : null;

            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-outline-variant/30 bg-surface-container-low/30 hover:bg-surface-container-low/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-container-low border border-outline-variant/30 shrink-0 flex items-center justify-center">
                    {thumbUrl ? (
                      <Image src={thumbUrl} alt={item.title} fill className="object-cover" unoptimized />
                    ) : (
                      <span className="material-symbols-outlined text-[24px] text-on-surface-variant/40">
                        {item.type === "product" ? "shopping_bag" : "image"}
                      </span>
                    )}
                    {item.images?.length > 1 && (
                      <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1 rounded-sm">
                        +{item.images.length - 1}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-on-surface truncate">
                        {item.title}
                      </h4>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          item.is_active
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-surface-container text-on-surface-variant"
                        }`}
                      >
                        {item.is_active ? "Live" : "Hidden"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-xs text-on-surface-variant">
                      {item.type === "product" && item.price && (
                        <span className="font-semibold text-primary">{item.price}</span>
                      )}
                      {item.category && (
                        <span className="truncate max-w-[120px]">{item.category}</span>
                      )}
                      {item.whatsapp_enabled && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold">
                          <span className="material-symbols-outlined text-[12px]">chat</span>
                          WhatsApp Order
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Reorder & Edit/Delete */}
                <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                  {/* Reorder Up */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, -1)}
                    className="p-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container text-on-surface-variant disabled:opacity-30 cursor-pointer"
                    title="Move up"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                  </button>

                  {/* Reorder Down */}
                  <button
                    type="button"
                    disabled={index === displayedItems.length - 1}
                    onClick={() => handleMove(index, 1)}
                    className="p-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container text-on-surface-variant disabled:opacity-30 cursor-pointer"
                    title="Move down"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container text-primary cursor-pointer"
                    title="Edit item"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item)}
                    className="p-1.5 rounded-lg border border-error/30 hover:bg-error/5 text-error cursor-pointer"
                    title="Delete item"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal / Editor Drawer ─────────────────────────── */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl p-5 sm:p-7 shadow-2xl max-w-xl w-full my-auto space-y-5 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div>
                <h3 className="text-base font-bold text-on-surface">
                  {editingItem
                    ? `Edit ${activeTab === "product" ? "Product / Service" : "Portfolio Item"}`
                    : `Add ${activeTab === "product" ? "Product / Service" : "Portfolio Item"}`}
                </h3>
                <p className="text-[11px] text-on-surface-variant">
                  Fill in the details below. Images will upload directly to your public showcase.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditor}
                className="p-1.5 rounded-xl hover:bg-surface-container text-on-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Error */}
            {editorError && (
              <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{editorError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Title / Name */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  {activeTab === "product" ? "Product / Service Name" : "Item Title"}{" "}
                  <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={activeTab === "product" ? "e.g. Executive NFC Metal Card" : "e.g. Modern Villa Interior Design"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Price & Category in 2-column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeTab === "product" && (
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      Price <span className="text-[10px] text-on-surface-variant font-normal">(Optional, e.g. ₹999 or $49)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. ₹1,499"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-xs sm:text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Category <span className="text-[10px] text-on-surface-variant font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Hardware, Branding, Interior"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Description <span className="text-[10px] text-on-surface-variant font-normal">(Optional)</span>
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A concise summary of features, materials, or project scope..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>

              {/* External Link & CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Web Link URL <span className="text-[10px] text-on-surface-variant font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.external_url}
                    onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                    placeholder="https://example.com/item"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-xs sm:text-sm font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Button Label <span className="text-[10px] text-on-surface-variant font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder={activeTab === "product" ? "e.g. Order Online" : "e.g. View Case Study"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/50 bg-surface-container-low/30 text-xs sm:text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="p-3 rounded-2xl bg-surface-container-low/30 border border-outline-variant/20 space-y-2 text-xs">
                {activeTab === "product" && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.whatsapp_enabled}
                      onChange={(e) => setFormData({ ...formData, whatsapp_enabled: e.target.checked })}
                      className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-on-surface">
                      Enable "Order on WhatsApp" direct button
                    </span>
                  </label>
                )}

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                  />
                  <span className="font-semibold text-on-surface">
                    Visible on live card
                  </span>
                </label>
              </div>

              {/* ── Image Upload Section ──────────────────────── */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">
                  Showcase Images <span className="text-[10px] text-on-surface-variant font-normal">(JPG, PNG, WebP · Max 5 MB)</span>
                </label>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={uploadingImage || saving}
                />

                {/* Thumbnails list */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {/* Existing images */}
                  {itemImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-outline-variant/40 bg-surface-container-low group shrink-0"
                    >
                      <Image src={img.image_url} alt="" fill className="object-cover" unoptimized />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        disabled={uploadingImage}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Delete image"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}

                  {/* Pending new images */}
                  {pendingPreviews.map((prevUrl, pIdx) => (
                    <div
                      key={pIdx}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-primary/40 bg-surface-container-low group shrink-0"
                    >
                      <Image src={prevUrl} alt="New upload preview" fill className="object-cover" unoptimized />
                      <button
                        type="button"
                        onClick={() => removePendingUpload(pIdx)}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove before saving"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                      <span className="absolute bottom-0 inset-x-0 bg-primary text-white text-[8px] font-bold text-center">
                        New
                      </span>
                    </div>
                  ))}

                  {/* Upload button box */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage || saving}
                    className="w-16 h-16 rounded-xl border-2 border-dashed border-outline-variant/60 hover:border-primary text-on-surface-variant hover:text-primary flex flex-col items-center justify-center gap-0.5 text-[10px] font-bold transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                    <span>Upload</span>
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving || uploadingImage}
                  className="px-4 py-2 rounded-xl border border-outline-variant/40 text-xs font-semibold hover:bg-surface-container text-on-surface transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-btn-primary hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
                >
                  {saving || uploadingImage ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">check</span>
                      <span>Save {activeTab === "product" ? "Product" : "Item"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
