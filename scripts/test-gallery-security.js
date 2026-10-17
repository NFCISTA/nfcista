const path = require("path");
require(path.join(process.cwd(), "node_modules/@next/env")).loadEnvConfig(process.cwd());
const { createClient } = require("@supabase/supabase-js");
const http = require("http");

function httpGet(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () =>
        resolve({
          status: res.statusCode,
          location: res.headers["location"],
          body: data,
        })
      );
    }).on("error", (err) => resolve({ error: err.message }));
  });
}

function httpPost(url, payload = {}) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const req = http.request(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => resolve({ status: res.statusCode, body }));
      }
    );
    req.on("error", (err) => resolve({ error: err.message }));
    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log("=== NFCISTA Gallery Security & Route Protection Tests ===\n");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(url, anonKey);

  // 1. Direct anonymous table access blocks on gallery_items
  console.log("1. Testing Anonymous access to 'gallery_items' table...");
  const { data: giSel, error: giSelErr } = await supabase.from("gallery_items").select("*");
  if (giSelErr || (Array.isArray(giSel) && giSel.length === 0)) {
    console.log("   ✅ PASS: Anonymous SELECT blocked by RLS / 0 records returned.");
  } else {
    console.error("   ❌ FAIL: Anonymous SELECT returned rows from gallery_items:", giSel);
  }

  const { error: giInsErr } = await supabase.from("gallery_items").insert({
    customer_id: "00000000-0000-0000-0000-000000000000",
    type: "portfolio",
    title: "Unauthorized Insert",
  });
  if (giInsErr) {
    console.log("   ✅ PASS: Anonymous INSERT blocked by RLS.");
  } else {
    console.error("   ❌ FAIL: Anonymous INSERT succeeded on gallery_items!");
  }

  // 2. Direct anonymous table access blocks on gallery_item_images
  console.log("\n2. Testing Anonymous access to 'gallery_item_images' table...");
  const { data: giiSel, error: giiSelErr } = await supabase.from("gallery_item_images").select("*");
  if (giiSelErr || (Array.isArray(giiSel) && giiSel.length === 0)) {
    console.log("   ✅ PASS: Anonymous SELECT blocked by RLS / 0 records returned.");
  } else {
    console.error("   ❌ FAIL: Anonymous SELECT returned rows from gallery_item_images:", giiSel);
  }

  // 3. Public RPC test
  console.log("\n3. Testing Public RPC get_customer_gallery('demo-customer')...");
  const { data: rpcData, error: rpcErr } = await supabase.rpc("get_customer_gallery", {
    slug_input: "demo-customer",
  });
  if (rpcErr) {
    console.log("   ℹ️  RPC call error:", rpcErr.message);
  } else {
    console.log("   ✅ PASS: get_customer_gallery executed successfully, returned:", JSON.stringify(rpcData));
  }

  // 4. Test unauthenticated HTTP route protections
  console.log("\n4. Testing /admin/gallery route protection on local server...");
  const pageRes = await httpGet("http://localhost:3000/admin/gallery");
  console.log("   /admin/gallery -> status=" + pageRes.status + " | location=" + pageRes.location);
  if (pageRes.status === 307 && pageRes.location?.includes("/admin/login")) {
    console.log("   ✅ PASS: /admin/gallery correctly redirects unauthenticated visitors to /admin/login.");
  } else {
    console.error("   ❌ FAIL: /admin/gallery did not redirect to /admin/login:", pageRes);
  }

  // 5. Test API route protections
  console.log("\n5. Testing /api/admin/gallery endpoints authentication...");
  const apiGet = await httpGet("http://localhost:3000/api/admin/gallery");
  console.log("   GET /api/admin/gallery -> status=" + apiGet.status);
  const apiPost = await httpPost("http://localhost:3000/api/admin/gallery", { title: "Test" });
  console.log("   POST /api/admin/gallery -> status=" + apiPost.status);
  const apiReorder = await httpPost("http://localhost:3000/api/admin/gallery/reorder", {});
  console.log("   POST /api/admin/gallery/reorder -> status=" + apiReorder.status);
  const apiUpload = await httpPost("http://localhost:3000/api/admin/gallery/upload", {});
  console.log("   POST /api/admin/gallery/upload -> status=" + apiUpload.status);

  if ([apiGet.status, apiPost.status, apiReorder.status, apiUpload.status].every((s) => s === 401)) {
    console.log("   ✅ PASS: All admin gallery API endpoints enforce 401 Unauthorized for unauthenticated requests.");
  } else {
    console.error("   ❌ FAIL: One or more API routes failed to return 401.");
  }

  // 6. Test regressions
  console.log("\n6. Testing regressions on existing routes...");
  const qrRes = await httpGet("http://localhost:3000/r/NF8K29");
  console.log("   /r/NF8K29 -> status=" + qrRes.status + " | location=" + qrRes.location);
  const invalidQr = await httpGet("http://localhost:3000/r/DOESNOTEXIST");
  console.log("   /r/DOESNOTEXIST -> status=" + invalidQr.status);
  const adminRes = await httpGet("http://localhost:3000/admin");
  console.log("   /admin -> status=" + adminRes.status + " | location=" + adminRes.location);

  if (qrRes.status === 307 && invalidQr.status === 404 && adminRes.status === 307) {
    console.log("   ✅ PASS: All regression checks passed cleanly.");
  } else {
    console.error("   ❌ FAIL: Regression detected!");
  }
}

runTests().catch(console.error);
