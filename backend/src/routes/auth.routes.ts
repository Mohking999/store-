import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { registerSchema, loginSchema } from '../utils/validation';
import { AuthService } from '../services/auth.service';
import { requireAuth } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimit';
import { Env, AuthUser } from '../types';

export const authRoutes = new Hono<{ Bindings: Env; Variables: { user?: AuthUser; sessionToken?: string } }>();

// Register new customer
authRoutes.post(
  '/register',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many registration attempts. Please try again later.' }),
  zValidator('json', registerSchema),
  async (c) => {
    const data = c.req.valid('json');
    const authService = new AuthService(c.env.DB);
    try {
      const result = await authService.registerCustomer(data);
      // Set secure cookie
      c.header(
        'Set-Cookie',
        `session_token=${result.token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`
      );
      return c.json({
        user: result.user,
        token: result.token,
        expiresAt: result.expiresAt,
      }, 201);
    } catch (err: any) {
      return c.json({ error: err.message }, 400);
    }
  }
);

// Login
authRoutes.post(
  '/login',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 15, message: 'Too many login attempts. Please try again later.' }),
  zValidator('json', loginSchema),
  async (c) => {
    const data = c.req.valid('json');
    const authService = new AuthService(c.env.DB);
    try {
      const result = await authService.login(data.emailOrPhone, data.password);
      // Set secure cookie
      c.header(
        'Set-Cookie',
        `session_token=${result.token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`
      );
      return c.json({
        user: result.user,
        token: result.token,
        expiresAt: result.expiresAt,
      });
    } catch (err: any) {
      return c.json({ error: err.message }, 401);
    }
  }
);

// Logout
authRoutes.post('/logout', async (c) => {
  const token = c.get('sessionToken');
  if (token) {
    const authService = new AuthService(c.env.DB);
    await authService.revokeSession(token);
  }
  c.header(
    'Set-Cookie',
    'session_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0'
  );
  return c.json({ success: true, message: 'Logged out successfully' });
});

// Get current user
authRoutes.get('/me', requireAuth, async (c) => {
  const user = c.get('user')!;
  return c.json({ user });
});
