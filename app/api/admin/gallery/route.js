import { NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/adminAuth";
import { isValidHttpUrl, getSafeExternalUrl } from "@/lib/customers";
import { revalidateCustomerById } from "@/lib/revalidateProfile";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

/**
 * GET /api/admin/gallery
 * - If searchParams has customerId: returns gallery items and images for that customer.
 * - If no customerId: returns safe list of customers for the admin selector.
 */
export async function GET(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");

  try {
    // Case 1: Return safe customer list for dropdown
    if (!customerId) {
      const { data: customers, error } = await authClient
        .from("customers")
        .select("id, full_name, company_name, profile_slug, is_active")
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error fetching customers for gallery:", error.message);
        return NextResponse.json({ error: "Failed to load customers." }, { status: 500 });
      }

      return NextResponse.json({ customers: customers || [] });
    }

    // Case 2: Return gallery items for a specific customer
    if (!isValidUuid(customerId)) {
      return NextResponse.json({ error: "Invalid customer ID." }, { status: 400 });
    }

    // Verify customer exists
    const { data: customer, error: custErr } = await authClient
      .from("customers")
      .select("id, full_name, company_name, profile_slug, is_active")
      .eq("id", customerId)
      .maybeSingle();

    if (custErr || !customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    // Fetch items
    const { data: items, error: itemsErr } = await authClient
      .from("gallery_items")
      .select("*")
      .eq("customer_id", customerId)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (itemsErr) {
      console.error("Error fetching gallery items:", itemsErr.message);
      return NextResponse.json({ error: "Failed to load gallery items." }, { status: 500 });
    }

    const itemIds = (items || []).map((i) => i.id);
    let imagesByItem = {};

    if (itemIds.length > 0) {
      const { data: images, error: imgErr } = await authClient
        .from("gallery_item_images")
        .select("*")
        .in("gallery_item_id", itemIds)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (imgErr) {
        console.error("Error fetching gallery images:", imgErr.message);
      } else if (images) {
        images.forEach((img) => {
          if (!imagesByItem[img.gallery_item_id]) {
            imagesByItem[img.gallery_item_id] = [];
          }
          imagesByItem[img.gallery_item_id].push(img);
        });
      }
    }

    const itemsWithImages = (items || []).map((item) => ({
      ...item,
      images: imagesByItem[item.id] || [],
    }));

    return NextResponse.json({
      customer,
      items: itemsWithImages,
    });
  } catch (err) {
    console.error("Unexpected error in GET /api/admin/gallery:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/**
 * POST /api/admin/gallery
 * Creates a new gallery item for the specified customer.
 */
export async function POST(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const {
      customerId,
      type,
      title,
      description,
      price,
      category,
      external_url,
      cta_text,
      whatsapp_enabled,
      is_active,
      display_order,
      image_urls,
    } = body;

    // 1. Validation
    if (!isValidUuid(customerId)) {
      return NextResponse.json({ error: "Invalid customer ID." }, { status: 400 });
    }

    if (!type || !["portfolio", "product"].includes(type)) {
      return NextResponse.json({ error: "Type must be 'portfolio' or 'product'." }, { status: 400 });
    }

    const cleanTitle = (title || "").trim();
    if (!cleanTitle || cleanTitle.length > 150) {
      return NextResponse.json({ error: "Title is required and must be 150 characters or less." }, { status: 400 });
    }

    const cleanDesc = description ? description.trim() : null;
    if (cleanDesc && cleanDesc.length > 2000) {
      return NextResponse.json({ error: "Description must be 2000 characters or less." }, { status: 400 });
    }

    const cleanPrice = price ? price.trim() : null;
    if (cleanPrice && cleanPrice.length > 50) {
      return NextResponse.json({ error: "Price must be 50 characters or less." }, { status: 400 });
    }

    const cleanCategory = category ? category.trim() : null;
    if (cleanCategory && cleanCategory.length > 50) {
      return NextResponse.json({ error: "Category must be 50 characters or less." }, { status: 400 });
    }

    let cleanUrl = null;
    if (external_url && external_url.trim()) {
      if (!isValidHttpUrl(external_url.trim())) {
        return NextResponse.json({ error: "External URL must be a valid HTTP or HTTPS URL." }, { status: 400 });
      }
      cleanUrl = external_url.trim();
    }

    const cleanCta = cta_text ? cta_text.trim() : null;
    if (cleanCta && cleanCta.length > 50) {
      return NextResponse.json({ error: "CTA text must be 50 characters or less." }, { status: 400 });
    }

    // Verify customer exists
    const { data: customer, error: custErr } = await authClient
      .from("customers")
      .select("id")
      .eq("id", customerId)
      .maybeSingle();

    if (custErr || !customer) {
      return NextResponse.json({ error: "Customer does not exist." }, { status: 404 });
    }

    // Determine display order if not specified
    let orderVal = Number.isInteger(display_order) ? display_order : 0;
    if (!Number.isInteger(display_order)) {
      const { data: maxRows } = await authClient
        .from("gallery_items")
        .select("display_order")
        .eq("customer_id", customerId)
        .order("display_order", { ascending: false })
        .limit(1);

      if (maxRows && maxRows.length > 0) {
        orderVal = (maxRows[0].display_order || 0) + 1;
      }
    }

    // Insert item
    const { data: newItem, error: insertErr } = await authClient
      .from("gallery_items")
      .insert({
        customer_id: customerId,
        type,
        title: cleanTitle,
        description: cleanDesc,
        price: cleanPrice,
        category: cleanCategory,
        external_url: cleanUrl,
        cta_text: cleanCta,
        whatsapp_enabled: Boolean(whatsapp_enabled),
        is_active: Boolean(is_active), // defaults to false unless specified
        display_order: orderVal,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Error creating gallery item:", insertErr.message);
      return NextResponse.json({ error: "Failed to create gallery item." }, { status: 500 });
    }

    // If initial image URLs were supplied, insert them
    let insertedImages = [];
    if (Array.isArray(image_urls) && image_urls.length > 0) {
      const validImages = image_urls
        .filter((u) => typeof u === "string" && (isValidHttpUrl(u) || u.startsWith("/")))
        .map((url, idx) => ({
          gallery_item_id: newItem.id,
          image_url: url.trim(),
          display_order: idx,
        }));

      if (validImages.length > 0) {
        const { data: imgData, error: imgErr } = await authClient
          .from("gallery_item_images")
          .insert(validImages)
          .select();

        if (!imgErr && imgData) {
          insertedImages = imgData;
        }
      }
    }

    // Invalidate public profile cache on-demand after successful creation
    await revalidateCustomerById(customerId, authClient);

    return NextResponse.json({
      item: {
        ...newItem,
        images: insertedImages,
      },
    }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error in POST /api/admin/gallery:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/**
 * PUT /api/admin/gallery
 * Updates an existing gallery item.
 */
export async function PUT(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const {
      itemId,
      customerId,
      type,
      title,
      description,
      price,
      category,
      external_url,
      cta_text,
      whatsapp_enabled,
      is_active,
      display_order,
    } = body;

    if (!isValidUuid(itemId) || !isValidUuid(customerId)) {
      return NextResponse.json({ error: "Invalid item or customer ID." }, { status: 400 });
    }

    // Verify item exists and belongs to the customer
    const { data: existing, error: findErr } = await authClient
      .from("gallery_items")
      .select("id, customer_id")
      .eq("id", itemId)
      .maybeSingle();

    if (findErr || !existing) {
      return NextResponse.json({ error: "Gallery item not found." }, { status: 404 });
    }

    if (existing.customer_id !== customerId) {
      return NextResponse.json({ error: "Item does not belong to the specified customer." }, { status: 403 });
    }

    const updates = {};

    if (type !== undefined) {
      if (!["portfolio", "product"].includes(type)) {
        return NextResponse.json({ error: "Invalid type." }, { status: 400 });
      }
      updates.type = type;
    }

    if (title !== undefined) {
      const cleanTitle = (title || "").trim();
      if (!cleanTitle || cleanTitle.length > 150) {
        return NextResponse.json({ error: "Title must be between 1 and 150 characters." }, { status: 400 });
      }
      updates.title = cleanTitle;
    }

    if (description !== undefined) {
      const cleanDesc = description ? description.trim() : null;
      if (cleanDesc && cleanDesc.length > 2000) {
        return NextResponse.json({ error: "Description must be 2000 characters or less." }, { status: 400 });
      }
      updates.description = cleanDesc;
    }

    if (price !== undefined) {
      const cleanPrice = price ? price.trim() : null;
      if (cleanPrice && cleanPrice.length > 50) {
        return NextResponse.json({ error: "Price must be 50 characters or less." }, { status: 400 });
      }
      updates.price = cleanPrice;
    }

    if (category !== undefined) {
      const cleanCategory = category ? category.trim() : null;
      if (cleanCategory && cleanCategory.length > 50) {
        return NextResponse.json({ error: "Category must be 50 characters or less." }, { status: 400 });
      }
      updates.category = cleanCategory;
    }

    if (external_url !== undefined) {
      if (external_url && external_url.trim()) {
        if (!isValidHttpUrl(external_url.trim())) {
          return NextResponse.json({ error: "External URL must be a valid HTTP or HTTPS URL." }, { status: 400 });
        }
        updates.external_url = external_url.trim();
      } else {
        updates.external_url = null;
      }
    }

    if (cta_text !== undefined) {
      const cleanCta = cta_text ? cta_text.trim() : null;
      if (cleanCta && cleanCta.length > 50) {
        return NextResponse.json({ error: "CTA text must be 50 characters or less." }, { status: 400 });
      }
      updates.cta_text = cleanCta;
    }

    if (whatsapp_enabled !== undefined) {
      updates.whatsapp_enabled = Boolean(whatsapp_enabled);
    }

    if (is_active !== undefined) {
      updates.is_active = Boolean(is_active);
    }

    if (Number.isInteger(display_order)) {
      updates.display_order = display_order;
    }

    const { data: updated, error: updateErr } = await authClient
      .from("gallery_items")
      .update(updates)
      .eq("id", itemId)
      .select()
      .single();

    if (updateErr) {
      console.error("Error updating gallery item:", updateErr.message);
      return NextResponse.json({ error: "Failed to update gallery item." }, { status: 500 });
    }

    // Invalidate public profile cache on-demand after successful update
    await revalidateCustomerById(customerId, authClient);

    return NextResponse.json({ item: updated });
  } catch (err) {
    console.error("Unexpected error in PUT /api/admin/gallery:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/gallery?customerId=...&itemId=...
 * Safely deletes a gallery item and cleans up storage files.
 */
export async function DELETE(request) {
  const { errorResponse, authClient } = await authenticateAdmin(request);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const itemId = searchParams.get("itemId") || searchParams.get("id");

  if (!isValidUuid(customerId) || !isValidUuid(itemId)) {
    return NextResponse.json({ error: "Invalid customer or item ID." }, { status: 400 });
  }

  try {
    // 1. Verify item exists and belongs to this customer
    const { data: item, error: findErr } = await authClient
      .from("gallery_items")
      .select("id, customer_id")
      .eq("id", itemId)
      .maybeSingle();

    if (findErr || !item) {
      return NextResponse.json({ error: "Gallery item not found." }, { status: 404 });
    }

    if (item.customer_id !== customerId) {
      return NextResponse.json({ error: "Item does not belong to this customer." }, { status: 403 });
    }

    // 2. Query associated images so we can remove stored files
    const { data: images } = await authClient
      .from("gallery_item_images")
      .select("image_url")
      .eq("gallery_item_id", itemId);

    // 3. Delete from gallery_items (cascades to gallery_item_images in DB)
    const { error: delErr } = await authClient
      .from("gallery_items")
      .delete()
      .eq("id", itemId);

    if (delErr) {
      console.error("Error deleting gallery item:", delErr.message);
      return NextResponse.json({ error: "Failed to delete gallery item." }, { status: 500 });
    }

    // 4. Clean up storage files asynchronously (non-blocking)
    if (images && images.length > 0) {
      const marker = "/gallery-images/";
      const filePaths = images
        .map((img) => {
          const idx = (img.image_url || "").indexOf(marker);
          return idx !== -1 ? img.image_url.substring(idx + marker.length) : null;
        })
        .filter(Boolean);

      if (filePaths.length > 0) {
        authClient.storage.from("gallery-images").remove(filePaths).catch((e) => {
          console.warn("Storage cleanup notice:", e.message);
        });
      }
    }

    // Invalidate public profile cache on-demand after successful deletion
    await revalidateCustomerById(customerId, authClient);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error in DELETE /api/admin/gallery:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
