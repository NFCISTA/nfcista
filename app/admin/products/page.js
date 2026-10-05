"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { STOCK_STATUS_CONFIG, formatPrice } from "@/lib/products";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | hidden
  const [stockFilter, setStockFilter] = useState("all"); // all | in_stock | out_of_stock | coming_soon

  // Form State (Add / Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    short_description: "",
    description: "",
    category: "",
    price: "",
    original_price: "",
    image_url: "",
    gallery_images: [],
    featuresText: "", // newline separated for editing
    whatsapp_url: "",
    stock_status: "in_stock",
    is_active: true,
    is_featured: false,
    display_order: 0,
  });

  // Delete confirmation modal state
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load products.");
      }
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message || "Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenAddForm() {
    setEditingProduct(null);
    setFormError("");
    setFormData({
      name: "",
      slug: "",
      short_description: "",
      description: "",
      category: "",
      price: "",
      original_price: "",
      image_url: "",
      gallery_images: [],
      featuresText: "",
      whatsapp_url: "",
      stock_status: "in_stock",
      is_active: true,
      is_featured: false,
      display_order: products.length,
    });
    setIsFormOpen(true);
  }

  function handleOpenEditForm(product) {
    setEditingProduct(product);
    setFormError("");
    setFormData({
      name: product.name || "",
      slug: product.slug || "",
      short_description: product.short_description || "",
      description: product.description || "",
      category: product.category || "",
      price: product.price !== null && product.price !== undefined ? String(product.price) : "",
      original_price:
        product.original_price !== null && product.original_price !== undefined
          ? String(product.original_price)
          : "",
      image_url: product.image_url || "",
      gallery_images: Array.isArray(product.gallery_images) ? product.gallery_images : [],
      featuresText: Array.isArray(product.features) ? product.features.join("\n") : "",
      whatsapp_url: product.whatsapp_url || "",
      stock_status: product.stock_status || "in_stock",
      is_active: product.is_active ?? true,
      is_featured: Boolean(product.is_featured),
      display_order: product.display_order ?? 0,
    });
    setIsFormOpen(true);
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setFormError("");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/admin/products/upload", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload image.");
      }

      setFormData((prev) => ({ ...prev, image_url: data.url }));
    } catch (err) {
      setFormError(err.message || "Image upload failed.");
    } finally {
      setUploadLoading(false);
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    const featuresArray = formData.featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name,
      slug: formData.slug || undefined,
      short_description: formData.short_description || null,
      description: formData.description || null,
      category: formData.category || null,
      price: formData.price !== "" ? Number(formData.price) : null,
      original_price: formData.original_price !== "" ? Number(formData.original_price) : null,
      image_url: formData.image_url || null,
      gallery_images: formData.gallery_images,
      features: featuresArray,
      whatsapp_url: formData.whatsapp_url || null,
      stock_status: formData.stock_status,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
      display_order: Number(formData.display_order) || 0,
    };

    try {
      if (editingProduct) {
        payload.id = editingProduct.id;
        const res = await fetch("/api/admin/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to update product.");

        setSuccessMsg(`Product "${payload.name}" updated successfully.`);
      } else {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create product.");

        setSuccessMsg(`Product "${payload.name}" created successfully.`);
      }

      setIsFormOpen(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (err) {
      setFormError(err.message || "An error occurred.");
    } finally {
      setFormLoading(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  }

  async function handleToggleActive(product) {
    try {
      const nextActive = !product.is_active;
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, is_active: nextActive }),
      });
      if (!res.ok) throw new Error("Failed to update status.");
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: nextActive } : p))
      );
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function handleToggleFeatured(product) {
    try {
      const nextFeatured = !product.is_featured;
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, is_featured: nextFeatured }),
      });
      if (!res.ok) throw new Error("Failed to update featured flag.");
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_featured: nextFeatured } : p))
      );
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function confirmDeleteProduct() {
    if (!deletingProduct) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(deletingProduct.id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete product.");

      setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
      setSuccessMsg(`Product "${deletingProduct.name}" deleted.`);
      setDeletingProduct(null);
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setDeleteLoading(false);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  }

  // Filter products
  const filteredProducts = products.filter((p) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchCode = p.product_code?.toLowerCase().includes(q);
      const matchCat = p.category?.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchCat) return false;
    }

    // Active status filter
    if (statusFilter === "active" && !p.is_active) return false;
    if (statusFilter === "hidden" && p.is_active) return false;

    // Stock status filter
    if (stockFilter !== "all" && p.stock_status !== stockFilter) return false;

    return true;
  });

  const totalCount = products.length;
  const activeCount = products.filter((p) => p.is_active).length;
  const featuredCount = products.filter((p) => p.is_featured).length;

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-surface-container-low text-primary border border-outline-variant/30">
              NFCISTA Direct
            </span>
            <span className="text-body-sm text-on-surface-variant font-medium">
              Product Catalog
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Products Management
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Manage physical NFC cards, accessories, and products sold directly on NFCISTA.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/products"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-label-md font-semibold transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            <span className="hidden sm:inline">View Public Store</span>
          </Link>

          <button
            onClick={handleOpenAddForm}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-label-md hover:bg-primary-hover shadow-btn-primary transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* ── Notification alerts ───────────────────────────── */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-body-sm flex items-center gap-2.5 animate-fadeIn">
          <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0">
            check_circle
          </span>
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 text-error text-body-sm flex items-center gap-2.5 animate-fadeIn">
          <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* ── Stats Summary Row ─────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-3.5 sm:p-4 shadow-card">
          <div className="text-xs text-on-surface-variant font-medium">Total Products</div>
          <div className="text-xl sm:text-2xl font-bold text-on-surface mt-1">{totalCount}</div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-3.5 sm:p-4 shadow-card">
          <div className="text-xs text-on-surface-variant font-medium">Active (Public)</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">{activeCount}</div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-3.5 sm:p-4 shadow-card">
          <div className="text-xs text-on-surface-variant font-medium">Featured</div>
          <div className="text-xl sm:text-2xl font-bold text-primary mt-1">{featuredCount}</div>
        </div>
      </div>

      {/* ── Filters & Search ──────────────────────────────── */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-3.5 sm:p-4 shadow-card flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name, code (NFC-001), category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Visibility</option>
            <option value="active">Active Only</option>
            <option value="hidden">Hidden Only</option>
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-lowest text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="coming_soon">Coming Soon</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* ── Add / Edit Form Modal ─────────────────────────── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-7 shadow-float space-y-5 animate-fadeIn my-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div>
                <h2 className="text-xl font-bold text-on-surface">
                  {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product"}
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {editingProduct
                    ? `Code: ${editingProduct.product_code}`
                    : "Product code and slug will be auto-generated."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Product Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google Review NFC Smart Stand"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* Slug & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Custom Slug <span className="text-xs text-on-surface-variant font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. google-review-smart-stand"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/30 text-sm font-mono focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Google Reviews, PVC Card, Stand"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 799"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Original Price (₹) <span className="text-xs text-on-surface-variant font-normal">(for strikethrough)</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 1299"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Stock Status & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">Stock Status</label>
                  <select
                    value={formData.stock_status}
                    onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    Display Order <span className="text-xs text-on-surface-variant font-normal">(lower = shown first)</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Short Description <span className="text-xs text-on-surface-variant font-normal">(card preview)</span>
                </label>
                <textarea
                  rows="2"
                  maxLength={300}
                  placeholder="One or two crisp sentences explaining the card's benefit..."
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* Full Description */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Full Description <span className="text-xs text-on-surface-variant font-normal">(detail page)</span>
                </label>
                <textarea
                  rows="4"
                  placeholder="Detailed product information, specifications, how it works, what's in the box..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* Product Image (Upload or URL) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface">Product Image</label>
                <div className="flex flex-col sm:flex-row gap-3 items-start">
                  {formData.image_url ? (
                    <div className="relative w-24 h-24 rounded-xl border border-outline-variant/30 overflow-hidden bg-white shrink-0">
                      <Image
                        src={formData.image_url}
                        alt="Product preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-xl border border-dashed border-outline-variant/60 flex flex-col items-center justify-center text-on-surface-variant shrink-0 bg-surface-container-low/30">
                      <span className="material-symbols-outlined text-[24px]">image</span>
                      <span className="text-[10px]">No image</span>
                    </div>
                  )}

                  <div className="flex-1 space-y-2 w-full">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/50 bg-surface-container-low hover:bg-surface-container text-xs font-semibold cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">upload</span>
                      <span>{uploadLoading ? "Uploading..." : "Upload New File (JPEG/PNG/WebP)"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageUpload}
                        disabled={uploadLoading}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="url"
                      placeholder="Or paste direct image URL (https://...)"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-low/30 text-xs font-mono focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Features (One per line) */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Product Features <span className="text-xs text-on-surface-variant font-normal">(enter one feature per line)</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Tap to open Google review&#10;Works without any app&#10;Includes backup dynamic QR code&#10;Waterproof durable matte finish"
                  value={formData.featuresText}
                  onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/30 text-sm focus:outline-none focus:border-primary font-mono"
                />
              </div>

              {/* WhatsApp Link */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  WhatsApp Direct Order URL <span className="text-xs text-on-surface-variant font-normal">(optional override)</span>
                </label>
                <input
                  type="url"
                  placeholder="e.g. https://wa.me/919000000000?text=Hi%20NFCISTA%2C%20I%20want%20to%20order..."
                  value={formData.whatsapp_url}
                  onChange={(e) => setFormData({ ...formData, whatsapp_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/30 text-sm font-mono focus:outline-none focus:border-primary"
                />
              </div>

              {/* Checkboxes: Active & Featured */}
              <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-outline-variant/20">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant"
                  />
                  <span className="text-xs font-bold text-on-surface">Active (Visible Publicly)</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant"
                  />
                  <span className="text-xs font-bold text-on-surface">Mark as Featured</span>
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  disabled={formLoading}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant/50 hover:bg-surface-container-low text-xs font-semibold text-on-surface transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary text-xs font-bold shadow-btn-primary transition-all disabled:opacity-60 cursor-pointer"
                >
                  {formLoading ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ─────────────────────── */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl w-full max-w-md p-6 shadow-float space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">delete</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-on-surface">Delete Product?</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Are you sure you want to permanently delete{" "}
                <strong className="text-on-surface">{deletingProduct.name}</strong> (
                {deletingProduct.product_code})? This will also remove it from the public catalog.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl border border-outline-variant/50 hover:bg-surface-container-low text-xs font-semibold text-on-surface cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl bg-error hover:bg-red-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
              >
                {deleteLoading ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Products List ─────────────────────────────────── */}
      {loading ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 text-center space-y-3 shadow-card">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-body-sm text-on-surface-variant font-medium">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 text-center space-y-4 shadow-card">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center text-on-surface-variant mx-auto">
            <span className="material-symbols-outlined text-[32px]">inventory_2</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-on-surface">No Products Found</h3>
            <p className="text-body-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== "all" || stockFilter !== "all"
                ? "No products match the selected filters. Try resetting search."
                : "You haven't added any products yet. Click 'Add Product' to get started."}
            </p>
          </div>
          {!searchQuery && statusFilter === "all" && stockFilter === "all" && (
            <button
              onClick={handleOpenAddForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-btn-primary hover:bg-primary-hover transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Create First Product</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const stockConfig = STOCK_STATUS_CONFIG[product.stock_status] || STOCK_STATUS_CONFIG.in_stock;

            return (
              <div
                key={product.id}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-card flex flex-col justify-between space-y-4 hover:border-outline-variant/60 transition-all"
              >
                {/* Header & Badges */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface-container-low text-primary border border-outline-variant/30">
                        {product.product_code}
                      </span>
                      {product.category && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-surface-container-low text-on-surface-variant">
                          {product.category}
                        </span>
                      )}
                      {product.is_featured && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">star</span>
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Active toggle button */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(product)}
                        title={product.is_active ? "Product is active (click to hide)" : "Product is hidden (click to show)"}
                        className={`text-xs px-2 py-0.5 rounded-full font-bold transition-all cursor-pointer ${
                          product.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-surface-container-high text-on-surface-variant border border-outline-variant/40"
                        }`}
                      >
                        {product.is_active ? "Active" : "Hidden"}
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail & Title */}
                  <div className="flex gap-3 items-start">
                    <div className="relative w-16 h-16 rounded-xl border border-outline-variant/30 bg-surface-container-low shrink-0 overflow-hidden">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
                          <span className="material-symbols-outlined text-[24px]">contactless</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-on-surface text-sm sm:text-base leading-snug truncate">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-bold text-on-surface">
                          {formatPrice(product.price) || "Price not set"}
                        </span>
                        {product.original_price && (
                          <span className="text-xs text-on-surface-variant line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${stockConfig.dotClass}`} />
                        <span className="text-[11px] font-semibold text-on-surface-variant">
                          {stockConfig.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Short Description */}
                  {product.short_description && (
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                      {product.short_description}
                    </p>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(product)}
                      title={product.is_featured ? "Remove featured" : "Mark as featured"}
                      className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                        product.is_featured
                          ? "bg-amber-50 border-amber-200 text-amber-600"
                          : "border-outline-variant/40 hover:bg-surface-container-low text-on-surface-variant"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {product.is_featured ? "star" : "star_border"}
                      </span>
                    </button>

                    <Link
                      href={`/products/${product.slug}`}
                      target="_blank"
                      title="View public page"
                      className="p-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container-low text-on-surface-variant text-xs"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                    </Link>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditForm(product)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingProduct(product)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-error-container/20 hover:bg-error-container/40 text-error text-xs font-semibold cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
