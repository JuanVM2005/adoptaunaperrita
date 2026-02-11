// src/lib/rateLimit.ts

export type RateLimitResult =
  | { ok: true; remaining: number; retryAfterMs: 0 }
  | { ok: false; remaining: 0; retryAfterMs: number };

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit({
  key,
  windowMs = 30_000,
  max = 4,
}: {
  key: string;
  windowMs?: number;
  max?: number;
}): RateLimitResult {
  const now = Date.now();
  const item = buckets.get(key);

  if (!item || now > item.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, retryAfterMs: 0 };
  }

  if (item.count >= max) {
    return { ok: false, remaining: 0, retryAfterMs: item.resetAt - now };
  }

  item.count += 1;
  buckets.set(key, item);

  return { ok: true, remaining: max - item.count, retryAfterMs: 0 };
}

export function getIPFromHeaders(headers: Headers) {
  const xf = headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
