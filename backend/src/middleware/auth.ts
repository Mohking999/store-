import { Context, Next } from 'hono';
import { Env, AuthUser } from '../types';

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: { user?: AuthUser; sessionToken?: string } }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    // Check cookie
    const cookieHeader = c.req.header('Cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(/session_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }
  }

  if (!token) {
    return next();
  }

  const db = c.env.DB;
  const now = new Date().toISOString();

  try {
    const sessionRes = await db
      .prepare(
        `SELECT s.id as session_id, s.token, s.expires_at,
                u.id as user_id, u.email, u.phone, u.role, u.full_name, u.is_active
         FROM sessions s
         JOIN users u ON s.user_id = u.id
         WHERE s.token = ? AND s.expires_at > ? AND u.is_active = 1`
      )
      .bind(token, now)
      .first<{
        session_id: string;
        token: string;
        expires_at: string;
        user_id: string;
        email: string;
        phone: string;
        role: string;
        full_name: string;
        is_active: number;
      }>();

    if (sessionRes) {
      c.set('user', {
        id: sessionRes.user_id,
        email: sessionRes.email,
        phone: sessionRes.phone,
        role: sessionRes.role as any,
        fullName: sessionRes.full_name,
      });
      c.set('sessionToken', token);
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
  }

  await next();
}

export function requireAuth(c: Context<{ Bindings: Env; Variables: { user?: AuthUser } }>, next: Next) {
  const user = c.get('user');
  if (!user) {
    return c.json({ error: 'Unauthorized: Authentication required' }, 401);
  }
  return next();
}
