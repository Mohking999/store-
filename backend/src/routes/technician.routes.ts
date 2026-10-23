import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireTechnicianOrAdmin } from '../middleware/authorization';
import { Env, AuthUser } from '../types';

export const technicianRoutes = new Hono<{ Bindings: Env; Variables: { user?: AuthUser } }>();

technicianRoutes.get('/dashboard', requireAuth, requireTechnicianOrAdmin, async (c) => {
  const db = c.env.DB;

  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_repairs,
        SUM(CASE WHEN current_status = 'NEW' THEN 1 ELSE 0 END) as count_new,
        SUM(CASE WHEN current_status = 'UNDER_DIAGNOSIS' THEN 1 ELSE 0 END) as count_under_diagnosis,
        SUM(CASE WHEN current_status = 'REPAIRABLE' THEN 1 ELSE 0 END) as count_repairable,
        SUM(CASE WHEN current_status IN ('UNREPAIRABLE', 'REPAIR_NOT_ECONOMICAL') THEN 1 ELSE 0 END) as count_unrepairable,
        SUM(CASE WHEN current_status = 'WAITING_FOR_PARTS' THEN 1 ELSE 0 END) as count_waiting_parts,
        SUM(CASE WHEN current_status = 'QUOTE_PENDING' THEN 1 ELSE 0 END) as count_quote_pending,
        SUM(CASE WHEN current_status = 'QUOTE_ACCEPTED' THEN 1 ELSE 0 END) as count_quote_accepted,
        SUM(CASE WHEN current_status = 'IN_REPAIR' THEN 1 ELSE 0 END) as count_in_repair,
        SUM(CASE WHEN current_status = 'REPAIR_COMPLETED' THEN 1 ELSE 0 END) as count_completed,
        SUM(CASE WHEN current_status = 'READY_FOR_PICKUP' THEN 1 ELSE 0 END) as count_ready_pickup,
        SUM(CASE WHEN current_status = 'DELIVERED' THEN 1 ELSE 0 END) as count_delivered
      FROM repair_requests
    `;

    const stats = await db.prepare(statsQuery).first<any>();

    // Recent 5 repairs needing immediate attention
    const urgentRepairs = await db
      .prepare(
        `SELECT r.id, r.reference_number, r.current_status, r.main_issue_category, r.created_at,
                d.brand, d.model, u.full_name as customer_name, u.phone as customer_phone
         FROM repair_requests r
         JOIN devices d ON r.device_id = d.id
         JOIN users u ON r.customer_id = u.id
         WHERE r.current_status IN ('NEW', 'UNDER_DIAGNOSIS', 'QUOTE_ACCEPTED')
         ORDER BY r.created_at ASC
         LIMIT 5`
      )
      .all();

    return c.json({
      metrics: {
        total: stats?.total_repairs || 0,
        new: stats?.count_new || 0,
        underDiagnosis: stats?.count_under_diagnosis || 0,
        repairable: stats?.count_repairable || 0,
        unrepairable: stats?.count_unrepairable || 0,
        waitingParts: stats?.count_waiting_parts || 0,
        quotePending: stats?.count_quote_pending || 0,
        quoteAccepted: stats?.count_quote_accepted || 0,
        inRepair: stats?.count_in_repair || 0,
        completed: stats?.count_completed || 0,
        readyPickup: stats?.count_ready_pickup || 0,
        delivered: stats?.count_delivered || 0,
      },
      urgentQueue: urgentRepairs.results || [],
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
