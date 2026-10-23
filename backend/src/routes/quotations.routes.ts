import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createQuoteSchema, approvalSchema } from '../utils/validation';
import { QuotationsService } from '../services/quotations.service';
import { requireAuth } from '../middleware/auth';
import { requireTechnicianOrAdmin } from '../middleware/authorization';
import { Env, AuthUser } from '../types';

export const quotationsRoutes = new Hono<{ Bindings: Env; Variables: { user?: AuthUser } }>();

// Create or revise quotation (technician/admin)
quotationsRoutes.post(
  '/repairs/:repairId/quotes',
  requireAuth,
  requireTechnicianOrAdmin,
  zValidator('json', createQuoteSchema),
  async (c) => {
    const repairId = c.req.param('repairId');
    const user = c.get('user')!;
    const data = c.req.valid('json');

    const service = new QuotationsService(c.env.DB);
    try {
      const result = await service.createQuotation(repairId, data, user);
      return c.json(result, 201);
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  }
);

// Customer approve quotation
quotationsRoutes.post(
  '/quotes/:quoteId/approve',
  requireAuth,
  async (c) => {
    const quoteId = c.req.param('quoteId');
    if (!quoteId) return c.json({ error: 'Quote ID required' }, 400);
    const user = c.get('user')!;
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    const userAgent = c.req.header('user-agent') || 'unknown';

    const service = new QuotationsService(c.env.DB);
    try {
      const result = await service.processCustomerDecision(quoteId, 'APPROVED', user, { ip, userAgent });
      return c.json({ success: true, ...result });
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  }
);

// Customer reject quotation
quotationsRoutes.post(
  '/quotes/:quoteId/reject',
  requireAuth,
  zValidator('json', approvalSchema),
  async (c) => {
    const quoteId = c.req.param('quoteId');
    if (!quoteId) return c.json({ error: 'Quote ID required' }, 400);
    const user = c.get('user')!;
    const { rejectionReason } = c.req.valid('json');
    const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown';
    const userAgent = c.req.header('user-agent') || 'unknown';

    const service = new QuotationsService(c.env.DB);
    try {
      const result = await service.processCustomerDecision(quoteId, 'REJECTED', user, {
        ip,
        userAgent,
        rejectionReason,
      });
      return c.json({ success: true, ...result });
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  }
);
