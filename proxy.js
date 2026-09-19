import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "./lib/rateLimit";

/**
 * Next.js Proxy / Middleware (Next.js 16 convention)
 *
 * Scope:
 * - ONLY rate-limits public customer profile routes (/p/[slug]).
 * - Strictly excludes /admin, authentication, Supabase operations, and static assets.
 * - Protects customer profiles against automated scraping & dictionary enumeration.
 */
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Defensive path check: Only process /p/* routes
  if (!pathname.startsWith("/p/")) {
    return NextResponse.next();
  }

  try {
    const ip = getClientIp(request);
    const result = await checkRateLimit(ip);

    // Limit exceeded -> Return HTTP 429
    if (!result.success) {
      const resetSeconds = String(result.reset || 60);
      const isHtmlRequest = request.headers.get("accept")?.includes("text/html");

      const headers = {
        "Retry-After": resetSeconds,
        "X-RateLimit-Limit": String(result.limit || 100),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": resetSeconds,
      };

      if (isHtmlRequest) {
        return new Response(
          `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Too Many Requests | NFCISTA</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #eff4ff; color: #1e293b; padding: 1rem; }
    .card { background: #fff; padding: 2.25rem; border-radius: 1.5rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08); max-width: 420px; width: 100%; border: 1px solid #e2e8f0; text-align: center; }
    .badge { display: inline-block; padding: 0.3rem 0.85rem; background: #fee2e2; color: #dc2626; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 1.25rem; }
    h1 { font-size: 1.35rem; font-weight: 700; margin: 0 0 0.5rem; color: #004ac6; }
    p { font-size: 0.9rem; color: #64748b; line-height: 1.6; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">429 Too Many Requests</div>
    <h1>Please Slow Down</h1>
    <p>You have made too many requests to this profile. Please wait a minute and refresh the page.</p>
  </div>
</body>
</html>`,
          {
            status: 429,
            headers: {
              ...headers,
              "Content-Type": "text/html; charset=utf-8",
            },
          }
        );
      }

      return Response.json(
        {
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please wait a moment and try again.",
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Normal allowed request: Attach rate limit headers
    const response = NextResponse.next();
    if (result.limit) {
      response.headers.set("X-RateLimit-Limit", String(result.limit));
      response.headers.set("X-RateLimit-Remaining", String(Math.max(0, result.remaining)));
      response.headers.set("X-RateLimit-Reset", String(result.reset));
    }

    return response;
  } catch (error) {
    // Fail-open: Never block customer profiles on rate limiter exceptions
    console.error("Rate limit proxy error (failing open):", error);
    return NextResponse.next();
  }
}

// Strictly match only /p/* routes; /admin, auth, and static assets bypass completely
export const config = {
  matcher: ["/p/:path*"],
};
