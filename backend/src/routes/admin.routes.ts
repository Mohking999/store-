import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorization';
import { Env, AuthUser } from '../types';

export const adminRoutes = new Hono<{ Bindings: Env; Variables: { user?: AuthUser } }>();

adminRoutes.get('/dashboard', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;

  try {
    // Total Revenue in DZD from delivered / completed repairs
    const revenueRow = await db
      .prepare(
        `SELECT SUM(q.total_price_dzd) as total_revenue
         FROM repair_quotes q
         JOIN repair_requests r ON q.repair_id = r.id
         WHERE q.status = 'ACCEPTED' AND r.current_status IN ('REPAIR_COMPLETED', 'READY_FOR_PICKUP', 'DELIVERED')`
      )
      .first<{ total_revenue: number | null }>();

    // Popular brands breakdown
    const brandsRes = await db
      .prepare(
        `SELECT d.brand, COUNT(*) as count
         FROM devices d
         JOIN repair_requests r ON r.device_id = d.id
         GROUP BY d.brand
         ORDER BY count DESC`
      )
      .all<{ brand: string; count: number }>();

    // Status breakdown
    const statusRes = await db
      .prepare(
        `SELECT current_status, COUNT(*) as count
         FROM repair_requests
         GROUP BY current_status`
      )
      .all<{ current_status: string; count: number }>();

    // Active staff members
    const staffRes = await db
      .prepare(
        `SELECT id, full_name, email, phone, role, created_at
         FROM users
         WHERE role IN ('TECHNICIAN', 'ADMIN')
         ORDER BY created_at DESC`
      )
      .all();

    // Recent audit logs
    const auditRes = await db
      .prepare(
        `SELECT a.*, u.full_name as user_name
         FROM audit_logs a
         LEFT JOIN users u ON a.user_id = u.id
         ORDER BY a.created_at DESC
         LIMIT 20`
      )
      .all();

    return c.json({
      totalRevenueDzd: revenueRow?.total_revenue || 0,
      brandBreakdown: brandsRes.results || [],
      statusBreakdown: statusRes.results || [],
      staff: staffRes.results || [],
      recentAuditLogs: auditRes.results || [],
    });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});
