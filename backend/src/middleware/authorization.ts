import { Context, Next } from 'hono';
import { Env, AuthUser, UserRole } from '../types';

export function requireRole(allowedRoles: UserRole[]) {
  return async (
    c: Context<{ Bindings: Env; Variables: { user?: AuthUser } }>,
    next: Next
  ) => {
    const user = c.get('user');
    if (!user) {
      return c.json({ error: 'Unauthorized: Authentication required' }, 401);
    }

    if (!allowedRoles.includes(user.role)) {
      return c.json(
        {
          error: 'Forbidden: Insufficient privileges',
          requiredRoles: allowedRoles,
          currentRole: user.role,
        },
        403
      );
    }

    await next();
  };
}

export const requireTechnicianOrAdmin = requireRole(['TECHNICIAN', 'ADMIN']);
export const requireAdmin = requireRole(['ADMIN']);
