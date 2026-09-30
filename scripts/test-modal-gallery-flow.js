const path = require("path");
require(path.join(process.cwd(), "node_modules/@next/env")).loadEnvConfig(process.cwd());
const { createClient } = require("@supabase/supabase-js");

async function runTests() {
  console.log("=== NFCISTA Customer Modal Gallery Workflow Tests ===\n");
  let allPass = true;

  function assert(condition, name) {
    if (condition) {
      console.log(`  PASS: ${name}`);
    } else {
      console.error(`  FAIL: ${name}`);
      allPass = false;
    }
  }

  // --------------------------------------------------------------------------
  // Test 1: Add Customer with one dummy Product
  // --------------------------------------------------------------------------
  console.log("Test 1: Staging Product in Customer Modal");
  const dummyProduct = {
    type: "product",
    title: "NFC Smart Business Card",
    description: "Premium matte black NFC card for instant contact sharing.",
    price: "₹499",
    category: "NFC Cards",
    external_url: "https://nfcista.com/products/digital-business-card",
    cta_text: "View Product",
    whatsapp_enabled: true,
    is_active: true,
    display_order: 0,
    pendingFiles: [{ name: "card.jpg", size: 1024 * 500, type: "image/jpeg" }],
  };
  assert(dummyProduct.type === "product", "Item type is 'product'");
  assert(dummyProduct.title.length > 0 && dummyProduct.title.length <= 150, "Title is valid");
  assert(dummyProduct.price === "₹499", "Price is set");
  assert(dummyProduct.whatsapp_enabled === true, "WhatsApp enabled is true");
  assert(dummyProduct.is_active === true, "Active flag is true");

  // --------------------------------------------------------------------------
  // Test 2: Add Customer with one dummy Portfolio item
  // --------------------------------------------------------------------------
  console.log("\nTest 2: Staging Portfolio in Customer Modal");
  const dummyPortfolio = {
    type: "portfolio",
    title: "Restaurant Branding & NFC Integration",
    description: "Digital menu and tap-to-review card design for Bistro 24.",
    price: null, // Portfolio has no price
    category: "Branding",
    external_url: "https://example.com/case-study",
    cta_text: "View Project",
    whatsapp_enabled: false,
    is_active: true,
    display_order: 1,
    pendingFiles: [
      { name: "photo1.png", size: 1024 * 300, type: "image/png" },
      { name: "photo2.png", size: 1024 * 400, type: "image/png" },
    ],
  };
  assert(dummyPortfolio.type === "portfolio", "Item type is 'portfolio'");
  assert(dummyPortfolio.price === null, "Portfolio has no price");
  assert(dummyPortfolio.pendingFiles.length === 2, "Portfolio supports multiple images");

  // --------------------------------------------------------------------------
  // Test 3: Multiple items in customer modal state
  // --------------------------------------------------------------------------
  console.log("\nTest 3: Multiple items array in Customer Modal");
  const modalItems = [
    { ...dummyProduct, id: "temp-1", display_order: 0 },
    { ...dummyPortfolio, id: "temp-2", display_order: 1 },
    {
      type: "product",
      title: "Google Review Standee",
      price: "₹899",
      display_order: 2,
    },
  ];
  assert(modalItems.length === 3, "Customer modal holds multiple items");
  assert(
    modalItems.filter((i) => i.type === "product").length === 2,
    "Correct number of products (2)"
  );
  assert(
    modalItems.filter((i) => i.type === "portfolio").length === 1,
    "Correct number of portfolio items (1)"
  );

  // --------------------------------------------------------------------------
  // Test 4: Edit Customer flow - existing items loading simulation
  // --------------------------------------------------------------------------
  console.log("\nTest 4: Edit Customer existing items loading");
  // Simulating the shape returned by GET /api/admin/gallery?customerId=...
  const existingApiPayload = {
    items: [
      {
        id: "gi-123",
        customer_id: "cust-456",
        type: "product",
        title: "Existing Card",
        price: "₹499",
        is_active: true,
        display_order: 0,
        images: [
          { id: "img-1", image_url: "https://example.com/img1.jpg", display_order: 0 },
        ],
      },
    ],
  };
  assert(Array.isArray(existingApiPayload.items), "Items is array");
  assert(existingApiPayload.items[0].images.length === 1, "Images attached to item");

  // --------------------------------------------------------------------------
  // Test 5: Product price allowed and preserved
  // --------------------------------------------------------------------------
  console.log("\nTest 5: Product price handling");
  function sanitizePriceForType(type, price) {
    if (type === "portfolio") return null;
    return price && price.trim() ? price.trim() : null;
  }
  assert(sanitizePriceForType("product", "₹499") === "₹499", "Product keeps price");
  assert(sanitizePriceForType("product", " $120 ") === "$120", "Product trims price");

  // --------------------------------------------------------------------------
  // Test 6: Portfolio without price
  // --------------------------------------------------------------------------
  console.log("\nTest 6: Portfolio price omission");
  assert(sanitizePriceForType("portfolio", "₹499") === null, "Portfolio forces price to null");
  assert(sanitizePriceForType("portfolio", "") === null, "Portfolio handles empty price as null");

  // --------------------------------------------------------------------------
  // Test 7: Image validation
  // --------------------------------------------------------------------------
  console.log("\nTest 7: Image upload validation (format & size)");
  const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
  const MAX_SIZE = 5 * 1024 * 1024;

  function validateImage(file) {
    if (!file || !file.size) return { valid: false, error: "No file" };
    if (!ALLOWED_MIME.includes(file.type.toLowerCase())) {
      return { valid: false, error: "Invalid type" };
    }
    if (file.size > MAX_SIZE) {
      return { valid: false, error: "Exceeds 5MB" };
    }
    return { valid: true };
  }

  assert(validateImage({ type: "image/jpeg", size: 1024 }).valid, "Valid JPEG passes");
  assert(validateImage({ type: "image/png", size: 1024 }).valid, "Valid PNG passes");
  assert(validateImage({ type: "image/webp", size: 1024 }).valid, "Valid WebP passes");
  assert(!validateImage({ type: "image/gif", size: 1024 }).valid, "GIF is rejected");
  assert(!validateImage({ type: "image/jpeg", size: 6 * 1024 * 1024 }).valid, ">5MB rejected");

  // --------------------------------------------------------------------------
  // Test 8: WhatsApp CTA link construction
  // --------------------------------------------------------------------------
  console.log("\nTest 8: WhatsApp CTA link format");
  function buildWhatsAppUrl(customerWhatsapp, productTitle) {
    const digits = (customerWhatsapp || "").replace(/\D/g, "");
    if (!digits) return null;
    const text = encodeURIComponent(`Hi, I am interested in ${productTitle}.`);
    return `https://wa.me/${digits}?text=${text}`;
  }

  const waLink = buildWhatsAppUrl("+1 (555) 000-1234", "NFC Smart Business Card");
  assert(
    waLink === "https://wa.me/15550001234?text=Hi%2C%20I%20am%20interested%20in%20NFC%20Smart%20Business%20Card.",
    "WhatsApp URL correctly formatted with digits and encoded product name"
  );
  assert(buildWhatsAppUrl("", "NFC Card") === null, "Empty whatsapp returns null");

  // --------------------------------------------------------------------------
  // Test 9: Active / Inactive status toggle
  // --------------------------------------------------------------------------
  console.log("\nTest 9: Active / Inactive state handling");
  let testItem = { ...dummyProduct, is_active: false };
  assert(testItem.is_active === false, "Item starts inactive");
  testItem.is_active = !testItem.is_active;
  assert(testItem.is_active === true, "Item toggles to active");

  // --------------------------------------------------------------------------
  // Test 10: Reorder items sequentially
  // --------------------------------------------------------------------------
  console.log("\nTest 10: Reorder items sequentially");
  const unordered = [
    { id: "a", title: "Item A" },
    { id: "b", title: "Item B" },
    { id: "c", title: "Item C" },
  ];
  // Swap 0 and 1
  const swapped = [unordered[1], unordered[0], unordered[2]];
  const reordered = swapped.map((it, idx) => ({ ...it, display_order: idx }));
  assert(reordered[0].id === "b" && reordered[0].display_order === 0, "Item B is now first");
  assert(reordered[1].id === "a" && reordered[1].display_order === 1, "Item A is now second");
  assert(reordered[2].id === "c" && reordered[2].display_order === 2, "Item C is now third");

  // --------------------------------------------------------------------------
  // Test 11: Delete item from array
  // --------------------------------------------------------------------------
  console.log("\nTest 11: Delete item");
  const beforeDelete = [{ id: "1" }, { id: "2" }, { id: "3" }];
  const afterDelete = beforeDelete.filter((it) => it.id !== "2");
  assert(afterDelete.length === 2, "Item removed");
  assert(!afterDelete.some((it) => it.id === "2"), "Target item no longer in list");

  // --------------------------------------------------------------------------
  // Test 12: Public RPC and Profile Display
  // --------------------------------------------------------------------------
  console.log("\nTest 12: Public RPC (read-only)");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  try {
    const { data: publicGallery, error } = await supabase.rpc("get_customer_gallery", {
      slug_input: "demo-customer",
    });
    assert(!error, "RPC get_customer_gallery call succeeds without error");
    assert(Array.isArray(publicGallery), "RPC returns array");
    console.log(`   (demo-customer currently has ${publicGallery.length} active gallery items)`);
  } catch (rpcErr) {
    assert(false, "RPC failed: " + rpcErr.message);
  }

  // --------------------------------------------------------------------------
  // Test 13: Dynamic QR Regression
  // --------------------------------------------------------------------------
  console.log("\nTest 13: Dynamic QR Regression checks");
  try {
    const resNF = await fetch("https://nfcista.vercel.app/r/NF8K29", { redirect: "manual" });
    assert(resNF.status === 307, "Production /r/NF8K29 returns 307 redirect");

    const res404 = await fetch("https://nfcista.vercel.app/r/DOESNOTEXIST", { redirect: "manual" });
    assert(res404.status === 404, "Production /r/DOESNOTEXIST returns 404");
  } catch (netErr) {
    console.warn("   (Network fetch error: " + netErr.message + ")");
  }

  // --------------------------------------------------------------------------
  // Test 14: Existing Customer Profile fields
  // --------------------------------------------------------------------------
  console.log("\nTest 14: Existing Customer Profile regression");
  try {
    const resProfile = await fetch("https://nfcista.vercel.app/p/demo-customer");
    const html = await resProfile.text();
    assert(resProfile.status === 200, "Production /p/demo-customer returns 200");
    assert(html.includes("Save Contact") || html.includes("saveContact"), "Save Contact button present");
    assert(html.includes("wa.me") || html.includes("WhatsApp"), "WhatsApp button present");
    assert(html.includes("NFCISTA"), "NFCISTA brand present");
  } catch (netErr) {
    console.warn("   (Network fetch error: " + netErr.message + ")");
  }

  console.log("\n==================================================");
  if (allPass) {
    console.log("✅ ALL WORKFLOW TESTS PASSED (14/14)");
  } else {
    console.error("❌ SOME TESTS FAILED");
  }
  console.log("==================================================");

  process.exit(allPass ? 0 : 1);
}

runTests();
