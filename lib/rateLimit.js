/**
 * In-Memory & Optional Distributed Rate Limiter for NFCISTA
 *
 * Designed specifically for public profile routes (/p/[slug]).
 * - Default: 100 requests per 60-second window per client IP.
 * - Suitable for Indian mobile networks (CGNAT/carrier IP sharing).
 * - Self-cleaning in-memory sliding window store.
 * - Optional Upstash REST integration if configured, with strict timeout
 *   and automatic fallback to memory.
 * - Resilient fail-open safety: never breaks profile viewing on internal failure.
 */

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 req/min per client IP

// In-memory sliding-window store: IP -> Array<timestamp>
const ipStore = new Map();
let lastCleanup = Date.now();

/**
 * Sweeps expired timestamps to prevent memory leaks over time.
 */
function cleanupStore(windowMs) {
  const now = Date.now();
  if (now - lastCleanup < 60 * 1000) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [ip, timestamps] of ipStore.entries()) {
    const valid = timestamps.filter((t) => t > cutoff);
    if (valid.length === 0) {
      ipStore.delete(ip);
    } else {
      ipStore.set(ip, valid);
    }
  }
}

/**
 * Extracts client IP from standard proxy/CDN headers.
 *
 * Trust order (most → least spoofable):
 * 1. x-real-ip  — set by Vercel's edge to the actual connecting IP; cannot be
 *                 overridden by the client.
 * 2. Last value of x-forwarded-for — appended by the CDN/proxy edge; earlier
 *                 values in the chain are client-supplied and must NOT be trusted.
 * 3. request.ip — Next.js runtime fallback.
 * 4. "127.0.0.1" — safe sentinel for test/local environments.
 *
 * SECURITY: Never read the FIRST x-forwarded-for value — it is fully controlled
 * by the client and trivially spoofed to bypass per-IP rate limiting.
 */
export function getClientIp(request) {
  try {
    // 1. x-real-ip is the most reliable source on Vercel (set by the edge, not the client)
    const xRealIp = request.headers.get("x-real-ip");
    if (xRealIp?.trim()) {
      return xRealIp.trim();
    }

    // 2. Last entry in x-forwarded-for is appended by the CDN and is trustworthy;
    //    the first entry is client-controlled and must be ignored.
    const xForwardedFor = request.headers.get("x-forwarded-for");
    if (xForwardedFor) {
      const parts = xForwardedFor.split(",");
      const lastIp = parts[parts.length - 1].trim();
      if (lastIp) return lastIp;
    }

    // 3. Next.js runtime IP (available in some deployment environments)
    if (request.ip) {
      return request.ip;
    }
  } catch {
    // Ignore header inspection errors; fall through to sentinel
  }

  // 4. Safe fallback for local/test environments
  return "127.0.0.1";
}

/**
 * Check rate limit for a client IP.
 *
 * @param {string} ip - The client IP address
 * @param {object} [options] - Custom limit/window overrides
 * @returns {Promise<{ success: boolean, limit: number, remaining: number, reset: number }>}
 */
export async function checkRateLimit(ip = "127.0.0.1", options = {}) {
  const limit = options.limit || MAX_REQUESTS;
  const windowMs = options.windowMs || WINDOW_MS;

  try {
    // 1. Check optional Upstash Redis REST service if env vars are present
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (upstashUrl && upstashToken) {
      try {
        const result = await checkUpstashRateLimit(ip, limit, windowMs, upstashUrl, upstashToken);
        if (result) return result;
      } catch (redisErr) {
        // Fall back to in-memory gracefully without breaking execution
        console.warn("External rate limiter unavailable; using in-memory store:", redisErr?.message || redisErr);
      }
    }

    // 2. In-memory sliding-window limiter
    cleanupStore(windowMs);

    const now = Date.now();
    const windowStart = now - windowMs;

    let timestamps = ipStore.get(ip) || [];
    timestamps = timestamps.filter((t) => t > windowStart);

    if (timestamps.length >= limit) {
      const oldest = timestamps[0];
      const reset = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      return {
        success: false,
        limit,
        remaining: 0,
        reset,
      };
    }

    timestamps.push(now);
    ipStore.set(ip, timestamps);

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - timestamps.length),
      reset: Math.ceil(windowMs / 1000),
    };
  } catch (err) {
    // 3. Fail-open safety guarantee: Never deny legitimate users on rate-limiter failure
    console.error("Rate limiter failure (failing open):", err);
    return {
      success: true,
      limit,
      remaining: limit,
      reset: Math.ceil(windowMs / 1000),
    };
  }
}

/**
 * Optional Upstash REST implementation with strict 500ms abort timeout.
 */
async function checkUpstashRateLimit(ip, limit, windowMs, url, token) {
  const key = `ratelimit:p:${ip}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 500);

  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["PEXPIRE", key, windowMs, "NX"],
        ["PTTL", key],
      ]),
      signal: controller.signal,
    });

    if (!res.ok) return null;

    const data = await res.json();
    const count = data[0]?.result;
    const ttlMs = data[2]?.result > 0 ? data[2].result : windowMs;
    const reset = Math.max(1, Math.ceil(ttlMs / 1000));

    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      reset,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
