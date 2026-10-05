import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminAuth";
import { generateSlug } from "@/lib/products";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

/**
 * GET /api/admin/products
 * Returns all products for admin management (active and hidden).
 */
export async function GET(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const { data: products, error } = await authClient
      .from("products")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching admin products:", error.message);
      return NextResponse.json({ error: "Failed to load products." }, { status: 500 });
    }

    return NextResponse.json({ products: products || [] });
  } catch (err) {
    console.error("Unexpected error in GET /api/admin/products:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/**
 * POST /api/admin/products
 * Creates a new product.
 */
export async function POST(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const {
      name,
      slug: customSlug,
      short_description,
      description,
      category,
      price,
      original_price,
      image_url,
      gallery_images,
      features,
      whatsapp_url,
      stock_status,
      is_active,
      is_featured,
      display_order,
    } = body;

    // 1. Validation
    const cleanName = (name || "").trim();
    if (!cleanName || cleanName.length > 150) {
      return NextResponse.json(
        { error: "Product name is required and must be 150 characters or less." },
        { status: 400 }
      );
    }

    // 2. Generate and ensure unique slug
    let baseSlug = generateSlug(customSlug || cleanName);
    if (!baseSlug) {
      baseSlug = `product-${Date.now()}`;
    }

    let finalSlug = baseSlug;
    let suffix = 1;
    while (true) {
      const { data: existing } = await authClient
        .from("products")
        .select("id")
        .eq("slug", finalSlug)
        .maybeSingle();

      if (!existing) break;
      suffix += 1;
      finalSlug = `${baseSlug}-${suffix}`;
    }

    // 3. Clean numeric prices
    const parsedPrice = price !== undefined && price !== "" && price !== null ? Number(price) : null;
    const parsedOriginalPrice =
      original_price !== undefined && original_price !== "" && original_price !== null
        ? Number(original_price)
        : null;

    if (parsedPrice !== null && (isNaN(parsedPrice) || parsedPrice < 0)) {
      return NextResponse.json({ error: "Price must be a valid positive number." }, { status: 400 });
    }

    if (parsedOriginalPrice !== null && (isNaN(parsedOriginalPrice) || parsedOriginalPrice < 0)) {
      return NextResponse.json(
        { error: "Original price must be a valid positive number." },
        { status: 400 }
      );
    }

    // 4. Validate stock_status
    const allowedStock = ["in_stock", "out_of_stock", "coming_soon"];
    const finalStockStatus = allowedStock.includes(stock_status) ? stock_status : "in_stock";

    // 5. Determine display_order if not provided
    let finalOrder = Number.isInteger(display_order) ? display_order : 0;
    if (!Number.isInteger(display_order)) {
      const { data: maxRows } = await authClient
        .from("products")
        .select("display_order")
        .order("display_order", { ascending: false })
        .limit(1);

      if (maxRows && maxRows.length > 0) {
        finalOrder = (maxRows[0].display_order || 0) + 1;
      }
    }

    // 6. Clean features array
    const cleanFeatures = Array.isArray(features)
      ? features.map((f) => String(f).trim()).filter(Boolean)
      : [];

    // 7. Clean gallery images array
    const cleanGallery = Array.isArray(gallery_images)
      ? gallery_images.map((img) => String(img).trim()).filter(Boolean)
      : [];

    // 8. Insert product
    const { data: newProduct, error: insertErr } = await authClient
      .from("products")
      .insert({
        name: cleanName,
        slug: finalSlug,
        short_description: short_description ? String(short_description).trim().slice(0, 300) : null,
        description: description ? String(description).trim() : null,
        category: category ? String(category).trim().slice(0, 50) : null,
        price: parsedPrice,
        original_price: parsedOriginalPrice,
        image_url: image_url ? String(image_url).trim() : null,
        gallery_images: cleanGallery,
        features: cleanFeatures,
        whatsapp_url: whatsapp_url ? String(whatsapp_url).trim() : null,
        stock_status: finalStockStatus,
        is_active: is_active !== undefined ? Boolean(is_active) : true,
        is_featured: Boolean(is_featured),
        display_order: finalOrder,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Error creating product:", insertErr.message);
      return NextResponse.json({ error: "Failed to create product: " + insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error in POST /api/admin/products:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/**
 * PUT /api/admin/products
 * Updates an existing product.
 */
export async function PUT(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const {
      id,
      name,
      slug: customSlug,
      short_description,
      description,
      category,
      price,
      original_price,
      image_url,
      gallery_images,
      features,
      whatsapp_url,
      stock_status,
      is_active,
      is_featured,
      display_order,
    } = body;

    if (!isValidUuid(id)) {
      return NextResponse.json({ error: "Valid product ID is required." }, { status: 400 });
    }

    // Verify product exists
    const { data: existing, error: findErr } = await authClient
      .from("products")
      .select("id, slug")
      .eq("id", id)
      .maybeSingle();

    if (findErr || !existing) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const updates = {};

    if (name !== undefined) {
      const cleanName = (name || "").trim();
      if (!cleanName || cleanName.length > 150) {
        return NextResponse.json(
          { error: "Product name must be between 1 and 150 characters." },
          { status: 400 }
        );
      }
      updates.name = cleanName;
    }

    if (customSlug !== undefined) {
      let candidateSlug = generateSlug(customSlug);
      if (!candidateSlug) {
        candidateSlug = existing.slug;
      }

      if (candidateSlug !== existing.slug) {
        // Check uniqueness if slug changed
        const { data: slugOwner } = await authClient
          .from("products")
          .select("id")
          .eq("slug", candidateSlug)
          .neq("id", id)
          .maybeSingle();

        if (slugOwner) {
          candidateSlug = `${candidateSlug}-${Date.now().toString().slice(-4)}`;
        }
        updates.slug = candidateSlug;
      }
    }

    if (short_description !== undefined) {
      updates.short_description = short_description ? String(short_description).trim().slice(0, 300) : null;
    }

    if (description !== undefined) {
      updates.description = description ? String(description).trim() : null;
    }

    if (category !== undefined) {
      updates.category = category ? String(category).trim().slice(0, 50) : null;
    }

    if (price !== undefined) {
      updates.price = price !== "" && price !== null ? Number(price) : null;
    }

    if (original_price !== undefined) {
      updates.original_price = original_price !== "" && original_price !== null ? Number(original_price) : null;
    }

    if (image_url !== undefined) {
      updates.image_url = image_url ? String(image_url).trim() : null;
    }

    if (gallery_images !== undefined) {
      updates.gallery_images = Array.isArray(gallery_images)
        ? gallery_images.map((g) => String(g).trim()).filter(Boolean)
        : [];
    }

    if (features !== undefined) {
      updates.features = Array.isArray(features)
        ? features.map((f) => String(f).trim()).filter(Boolean)
        : [];
    }

    if (whatsapp_url !== undefined) {
      updates.whatsapp_url = whatsapp_url ? String(whatsapp_url).trim() : null;
    }

    if (stock_status !== undefined) {
      const allowedStock = ["in_stock", "out_of_stock", "coming_soon"];
      updates.stock_status = allowedStock.includes(stock_status) ? stock_status : "in_stock";
    }

    if (is_active !== undefined) {
      updates.is_active = Boolean(is_active);
    }

    if (is_featured !== undefined) {
      updates.is_featured = Boolean(is_featured);
    }

    if (display_order !== undefined && Number.isInteger(display_order)) {
      updates.display_order = display_order;
    }

    const { data: updatedProduct, error: updateErr } = await authClient
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      console.error("Error updating product:", updateErr.message);
      return NextResponse.json({ error: "Failed to update product: " + updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ product: updatedProduct });
  } catch (err) {
    console.error("Unexpected error in PUT /api/admin/products:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products?id=...
 * Deletes a product.
 */
export async function DELETE(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!isValidUuid(id)) {
    return NextResponse.json({ error: "Invalid product ID." }, { status: 400 });
  }

  try {
    const { data: product, error: findErr } = await authClient
      .from("products")
      .select("id, image_url, gallery_images")
      .eq("id", id)
      .maybeSingle();

    if (findErr || !product) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    // Delete record from products table
    const { error: delErr } = await authClient
      .from("products")
      .delete()
      .eq("id", id);

    if (delErr) {
      console.error("Error deleting product:", delErr.message);
      return NextResponse.json({ error: "Failed to delete product." }, { status: 500 });
    }

    // Clean up uploaded product images if in 'product-images' bucket
    const marker = "/product-images/";
    const allImages = [product.image_url, ...(product.gallery_images || [])].filter(Boolean);
    const filePaths = allImages
      .map((url) => {
        const idx = url.indexOf(marker);
        return idx !== -1 ? url.substring(idx + marker.length) : null;
      })
      .filter(Boolean);

    if (filePaths.length > 0) {
      authClient.storage.from("product-images").remove(filePaths).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in DELETE /api/admin/products:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
