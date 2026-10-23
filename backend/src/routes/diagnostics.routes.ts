import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { createDiagnosisSchema } from '../utils/validation';
import { DiagnosticsService } from '../services/diagnostics.service';
import { requireAuth } from '../middleware/auth';
import { requireTechnicianOrAdmin } from '../middleware/authorization';
import { Env, AuthUser } from '../types';

export const diagnosticsRoutes = new Hono<{ Bindings: Env; Variables: { user?: AuthUser } }>();

// Create or update diagnosis
diagnosticsRoutes.post(
  '/repairs/:repairId/diagnosis',
  requireAuth,
  requireTechnicianOrAdmin,
  zValidator('json', createDiagnosisSchema),
  async (c) => {
    const repairId = c.req.param('repairId');
    const user = c.get('user')!;
    const data = c.req.valid('json');

    const service = new DiagnosticsService(c.env.DB);
    try {
      const result = await service.createOrUpdateDiagnosis(repairId, data, user);
      return c.json(result);
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  }
);

// Get diagnosis for repair
diagnosticsRoutes.get('/repairs/:repairId/diagnosis', async (c) => {
  const repairId = c.req.param('repairId');
  const service = new DiagnosticsService(c.env.DB);
  try {
    const diagnosis = await service.getDiagnosis(repairId);
    if (!diagnosis) {
      return c.json({ error: 'Diagnosis not yet recorded for this repair' }, 404);
    }
    return c.json({ diagnosis });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
