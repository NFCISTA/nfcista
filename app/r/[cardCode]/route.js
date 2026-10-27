import { getDynamicQrDestination, isValidCardCode } from "@/lib/dynamicQr";

export const dynamic = "force-dynamic";

/**
 * Branded NFCISTA presentation for unassigned, inactive, or not-found NFC cards.
 * Returns clean, lightweight HTML with status 404 without leaking internal IDs or error traces.
 */
function renderCardNotActiveHtml(code) {
  const safeCode = String(code || "")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, 32)
    .toUpperCase();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Card Not Active — NFCISTA</title>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="icon" href="/icon.svg" type="image/svg+xml" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #FBFBFC;
      color: #0F172A;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      -webkit-font-smoothing: antialiased;
    }
    .card {
      width: 100%;
      max-width: 400px;
      background: #FFFFFF;
      border: 1px solid #E2E8F0;
      border-radius: 16px;
      padding: 32px 24px;
      box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.06);
      text-align: center;
    }
    .brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
    }
    .brand-icon {
      width: 28px;
      height: 28px;
      background: #1D4ED8;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
    }
    .brand-name {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #0F172A;
    }
    .hardware-chip {
      width: 56px;
      height: 56px;
      background: #F1F5F9;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #475569;
    }
    .title {
      font-size: 18px;
      font-weight: 700;
      color: #0F172A;
      margin-bottom: 8px;
      letter-spacing: -0.015em;
    }
    .desc {
      font-size: 13px;
      color: #475569;
      line-height: 1.55;
      margin-bottom: 20px;
    }
    .code-pill {
      display: inline-block;
      font-family: "JetBrains Mono", Menlo, Consolas, monospace;
      font-size: 11px;
      color: #64748B;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 4px 10px;
      letter-spacing: 0.05em;
      margin-bottom: 24px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 44px;
      padding: 10px 16px;
      background: #1D4ED8;
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
      transition: background-color 0.15s ease;
    }
    .btn:hover {
      background: #1E40AF;
    }
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #F1F5F9;
      font-size: 11px;
      color: #94A3B8;
    }
  </style>
</head>
<body>
  <main class="card">
    <div class="brand">
      <div class="brand-icon">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
          <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
          <circle cx="12" cy="12" r="2"/>
          <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
          <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>
        </svg>
      </div>
      <span class="brand-name">NFCISTA</span>
    </div>

    <div class="hardware-chip">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/>
        <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/>
        <circle cx="12" cy="12" r="2"/>
        <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/>
        <path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>
      </svg>
    </div>

    <h1 class="title">Card Not Active</h1>
    <p class="desc">This physical NFC card is not currently connected to an active profile or destination.</p>

    ${safeCode ? `<div class="code-pill">REF: ${safeCode}</div>` : ""}

    <a href="/" class="btn">Visit NFCISTA</a>

    <div class="footer">
      Physical Contactless Identity · NFCISTA
    </div>
  </main>
</body>
</html>`;
}

/**
 * Server-side Dynamic QR redirect handler: /r/[cardCode]
 *
 * Flow:
 * 1. Extracts cardCode param.
 * 2. Validates format (3-32 uppercase alphanumeric chars).
 * 3. Calls Supabase RPC get_dynamic_qr_destination (SECURITY DEFINER).
 * 4. Verifies destination is active, valid, and uses safe http/https scheme.
 * 5. Issues 307 temporary redirect to destination with short-lived edge caching
 *    (s-maxage=30, stale-while-revalidate=60) so repeated physical taps/scans
 *    resolve instantly from Vercel's edge network, while allowing destination
 *    updates to propagate within 60s.
 * 6. Returns branded 404 (uncached) if card is missing, invalid, or inactive.
 */
export async function GET(request, { params }) {
  const { cardCode } = await params;

  if (!isValidCardCode(cardCode)) {
    return new Response(renderCardNotActiveHtml(cardCode), {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  const destination = await getDynamicQrDestination(cardCode);

  if (!destination) {
    return new Response(renderCardNotActiveHtml(cardCode), {
      status: 404,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return new Response(null, {
    status: 307,
    headers: {
      Location: destination,
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
