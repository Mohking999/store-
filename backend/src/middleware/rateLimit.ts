import { Context, Next } from 'hono';

// In-memory rate limiter per worker instance for brute force protection
const ipRequests = new Map<string, { count: number; resetTime: number }>();

export function rateLimiter(options: { windowMs: number; max: number; message?: string }) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    const now = Date.now();

    const current = ipRequests.get(ip);
    if (!current || now > current.resetTime) {
      ipRequests.set(ip, { count: 1, resetTime: now + options.windowMs });
    } else {
      current.count += 1;
      if (current.count > options.max) {
        return c.json(
          {
            error: options.message || 'Too many requests, please try again later.',
            retryAfterMs: current.resetTime - now,
          },
          429
        );
      }
    }

    // Clean up old entries periodically
    if (ipRequests.size > 1000) {
      for (const [key, value] of ipRequests.entries()) {
        if (now > value.resetTime) {
          ipRequests.delete(key);
        }
      }
    }

    await next();
  };
}
