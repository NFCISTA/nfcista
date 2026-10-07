import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateCustomer } from "@/lib/customerAuth";
import { isValidHttpUrl } from "@/lib/customers";
import { revalidateCustomerProfile } from "@/lib/revalidateProfile";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BUCKET = "gallery-images";

function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

/**
 * GET /api/customer/gallery
 * Returns all gallery items (both products and portfolio) and images
 * belonging to the authenticated customer.
 */
export async function GET(request) {
  const { errorResponse, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  try {
    // 1. Fetch customer's gallery items
    const { data: items, error: itemsErr } = await authClient
      .from("gallery_items")
      .select("*")
      .eq("customer_id", customer.id)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (itemsErr) {
      console.error("[customer/gallery] Error fetching items:", itemsErr.message);
      return NextResponse.json({ error: "Failed to load items." }, { status: 500 });
    }

    const itemIds = (items || []).map((i) => i.id);
    let imagesByItem = {};

    // 2. Fetch images for these items
    if (itemIds.length > 0) {
      const { data: images, error: imgErr } = await authClient
        .from("gallery_item_images")
        .select("*")
        .in("gallery_item_id", itemIds)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (imgErr) {
        console.error("[customer/gallery] Error fetching images:", imgErr.message);
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

    return NextResponse.json({ items: itemsWithImages });
  } catch (err) {
    console.error("[customer/gallery] Unexpected error in GET:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/**
 * POST /api/customer/gallery
 * Creates a new product or portfolio item for the authenticated customer.
 */
export async function POST(request) {
  const { errorResponse, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const {
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
    } = body || {};

    // 1. Validation
    if (!type || !["portfolio", "product"].includes(type)) {
      return NextResponse.json({ error: "Type must be 'portfolio' or 'product'." }, { status: 400 });
    }

    const cleanTitle = (title || "").trim();
    if (!cleanTitle || cleanTitle.length > 150) {
      return NextResponse.json(
        { error: "Title is required and must be 150 characters or less." },
        { status: 400 }
      );
    }

    const cleanDesc = description ? description.trim() : null;
    if (cleanDesc && cleanDesc.length > 2000) {
      return NextResponse.json(
        { error: "Description must be 2000 characters or less." },
        { status: 400 }
      );
    }

    const cleanPrice = price ? price.trim() : null;
    if (cleanPrice && cleanPrice.length > 50) {
      return NextResponse.json(
        { error: "Price must be 50 characters or less." },
        { status: 400 }
      );
    }

    const cleanCategory = category ? category.trim() : null;
    if (cleanCategory && cleanCategory.length > 50) {
      return NextResponse.json(
        { error: "Category must be 50 characters or less." },
        { status: 400 }
      );
    }

    let cleanUrl = null;
    if (external_url && external_url.trim()) {
      if (!isValidHttpUrl(external_url.trim())) {
        return NextResponse.json(
          { error: "External URL must be a valid HTTP or HTTPS URL." },
          { status: 400 }
        );
      }
      cleanUrl = external_url.trim();
    }

    const cleanCta = cta_text ? cta_text.trim() : null;
    if (cleanCta && cleanCta.length > 50) {
      return NextResponse.json(
        { error: "CTA text must be 50 characters or less." },
        { status: 400 }
      );
    }

    // Determine display order
    let orderVal = Number.isInteger(display_order) ? display_order : 0;
    if (!Number.isInteger(display_order)) {
      const { data: maxRows } = await authClient
        .from("gallery_items")
        .select("display_order")
        .eq("customer_id", customer.id)
        .order("display_order", { ascending: false })
        .limit(1);

      if (maxRows && maxRows.length > 0) {
        orderVal = (maxRows[0].display_order || 0) + 1;
      }
    }

    // 2. Insert item into gallery_items
    const { data: newItem, error: insertErr } = await authClient
      .from("gallery_items")
      .insert({
        customer_id: customer.id,
        type,
        title: cleanTitle,
        description: cleanDesc,
        price: type === "product" ? cleanPrice : null,
        category: cleanCategory,
        external_url: cleanUrl,
        cta_text: cleanCta,
        whatsapp_enabled: Boolean(whatsapp_enabled),
        is_active: is_active !== undefined ? Boolean(is_active) : true,
        display_order: orderVal,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("[customer/gallery] Error creating item:", insertErr.message);
      return NextResponse.json({ error: "Failed to create item: " + insertErr.message }, { status: 500 });
    }

    // 3. Insert optional initial image URLs
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

    // Revalidate public profile cache
    if (customer.profile_slug) {
      revalidateCustomerProfile(customer.profile_slug);
    }

    return NextResponse.json(
      {
        item: {
          ...newItem,
          images: insertedImages,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[customer/gallery] Unexpected error in POST:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/**
 * PUT /api/customer/gallery
 * Updates an existing gallery item belonging to the customer.
 */
export async function PUT(request) {
  const { errorResponse, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const {
      itemId,
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
    } = body || {};

    if (!isValidUuid(itemId)) {
      return NextResponse.json({ error: "Invalid item ID." }, { status: 400 });
    }

    // Verify item belongs to this customer
    const { data: existing, error: findErr } = await authClient
      .from("gallery_items")
      .select("id, customer_id")
      .eq("id", itemId)
      .eq("customer_id", customer.id)
      .maybeSingle();

    if (findErr || !existing) {
      return NextResponse.json({ error: "Item not found or access denied." }, { status: 404 });
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
      .eq("customer_id", customer.id)
      .select()
      .single();

    if (updateErr) {
      console.error("[customer/gallery] Error updating item:", updateErr.message);
      return NextResponse.json({ error: "Failed to update item: " + updateErr.message }, { status: 500 });
    }

    // Revalidate public profile cache
    if (customer.profile_slug) {
      revalidateCustomerProfile(customer.profile_slug);
    }

    return NextResponse.json({ item: updated });
  } catch (err) {
    console.error("[customer/gallery] Unexpected error in PUT:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/**
 * DELETE /api/customer/gallery?itemId=...
 * Deletes a gallery item and cleans up its associated storage files.
 */
export async function DELETE(request) {
  const { errorResponse, customer, authClient } = await authenticateCustomer(request);
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId") || searchParams.get("id");

  if (!isValidUuid(itemId)) {
    return NextResponse.json({ error: "Invalid item ID." }, { status: 400 });
  }

  try {
    // 1. Verify item exists and belongs to this customer
    const { data: item, error: findErr } = await authClient
      .from("gallery_items")
      .select("id, customer_id")
      .eq("id", itemId)
      .eq("customer_id", customer.id)
      .maybeSingle();

    if (findErr || !item) {
      return NextResponse.json({ error: "Item not found or access denied." }, { status: 404 });
    }

    // 2. Query associated images for storage cleanup
    const { data: images } = await authClient
      .from("gallery_item_images")
      .select("image_url")
      .eq("gallery_item_id", itemId);

    // 3. Delete from gallery_items (cascades to gallery_item_images in DB)
    const { error: delErr } = await authClient
      .from("gallery_items")
      .delete()
      .eq("id", itemId)
      .eq("customer_id", customer.id);

    if (delErr) {
      console.error("[customer/gallery] Error deleting item:", delErr.message);
      return NextResponse.json({ error: "Failed to delete item: " + delErr.message }, { status: 500 });
    }

    // 4. Clean up storage files asynchronously using service-role client if configured
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (serviceRoleKey && images && images.length > 0) {
      const marker = `/${BUCKET}/`;
      const filePaths = images
        .map((img) => {
          const idx = (img.image_url || "").indexOf(marker);
          return idx !== -1 ? img.image_url.substring(idx + marker.length) : null;
        })
        .filter(Boolean);

      if (filePaths.length > 0) {
        const serviceClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          serviceRoleKey,
          { auth: { persistSession: false, autoRefreshToken: false } }
        );
        serviceClient.storage.from(BUCKET).remove(filePaths).catch((e) => {
          console.warn("[customer/gallery] Storage cleanup notice:", e?.message);
        });
      }
    }

    // Revalidate public profile cache
    if (customer.profile_slug) {
      revalidateCustomerProfile(customer.profile_slug);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[customer/gallery] Unexpected error in DELETE:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
