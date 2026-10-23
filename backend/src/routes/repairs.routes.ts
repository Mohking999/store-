import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createRepairRequestSchema, updateStatusSchema } from '../utils/validation';
import { RepairsService } from '../services/repairs.service';
import { requireAuth } from '../middleware/auth';
import { requireTechnicianOrAdmin } from '../middleware/authorization';
import { rateLimiter } from '../middleware/rateLimit';
import { Env, AuthUser } from '../types';

export const repairsRoutes = new Hono<{ Bindings: Env; Variables: { user?: AuthUser } }>();

// Public tracking endpoint (accessible to all, protected by reference + phone verification)
repairsRoutes.get('/track', async (c) => {
  const reference = c.req.query('reference');
  const verify = c.req.query('verify') || c.req.query('phone') || c.req.query('token');

  if (!reference || !verify) {
    return c.json(
      { error: 'Both reference number and verification phone or tracking token are required.' },
      400
    );
  }

  const service = new RepairsService(c.env.DB);
  try {
    const trackingInfo = await service.trackPublicRepair(reference, verify);
    if (!trackingInfo) {
      return c.json({ error: 'Repair request not found with provided reference.' }, 404);
    }
    return c.json({ tracking: trackingInfo });
  } catch (err: any) {
    return c.json({ error: err.message }, 403);
  }
});

// Submit repair request (public or customer)
repairsRoutes.post(
  '/',
  rateLimiter({ windowMs: 10 * 60 * 1000, max: 20, message: 'Too many submissions. Please wait a moment.' }),
  zValidator('json', createRepairRequestSchema),
  async (c) => {
    const data = c.req.valid('json');
    const user = c.get('user');

    // Verify Turnstile if token is provided and secret is configured
    if (c.env.TURNSTILE_SECRET_KEY && data.turnstileToken && c.env.ENVIRONMENT === 'production') {
      try {
        const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: c.env.TURNSTILE_SECRET_KEY,
            response: data.turnstileToken,
          }),
        });
        const turnstileOutcome = await turnstileRes.json<any>();
        if (!turnstileOutcome.success) {
          return c.json({ error: 'Turnstile verification failed. Please refresh and try again.' }, 400);
        }
      } catch (err) {
        console.error('Turnstile verification error:', err);
      }
    }

    const service = new RepairsService(c.env.DB);
    try {
      const result = await service.createRepair(data, user);
      return c.json({ success: true, ...result }, 201);
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  }
);

// List repairs (filtered by customer ownership or staff permissions)
repairsRoutes.get('/', requireAuth, async (c) => {
  const user = c.get('user')!;
  const status = c.req.query('status') as any;
  const brand = c.req.query('brand');
  const search = c.req.query('search');
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = parseInt(c.req.query('limit') || '20', 10);

  const service = new RepairsService(c.env.DB);
  try {
    const data = await service.listRepairs(user, { status, brand, search, page, limit });
    return c.json(data);
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Get repair request details by ID or reference
repairsRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const service = new RepairsService(c.env.DB);

  try {
    const details = await service.getRepairById(id, user);
    if (!details) {
      return c.json({ error: 'Repair request not found' }, 404);
    }
    return c.json(details);
  } catch (err: any) {
    return c.json({ error: err.message }, err.message.startsWith('Forbidden') ? 403 : 500);
  }
});

// Update repair status (technician or admin)
repairsRoutes.patch(
  '/:id/status',
  requireAuth,
  requireTechnicianOrAdmin,
  zValidator('json', updateStatusSchema),
  async (c) => {
    const id = c.req.param('id');
    const user = c.get('user')!;
    const { toStatus, notes } = c.req.valid('json');

    const service = new RepairsService(c.env.DB);
    try {
      const result = await service.updateRepairStatus(id, toStatus, user, notes);
      return c.json(result);
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  }
);
