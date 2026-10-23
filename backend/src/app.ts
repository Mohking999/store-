import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth.routes';
import { repairsRoutes } from './routes/repairs.routes';
import { diagnosticsRoutes } from './routes/diagnostics.routes';
import { quotationsRoutes } from './routes/quotations.routes';
import { uploadsRoutes } from './routes/uploads.routes';
import { technicianRoutes } from './routes/technician.routes';
import { adminRoutes } from './routes/admin.routes';
import { Env, AuthUser } from './types';

export function createApp() {
  const app = new Hono<{ Bindings: Env; Variables: { user?: AuthUser; sessionToken?: string } }>();

  // CORS Middleware
  app.use('*', async (c, next) => {
    const corsMiddleware = cors({
      origin: (origin) => {
        // Allow localhost development or any configured origin or vercel app
        if (!origin) return '*';
        if (
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          origin.endsWith('.vercel.app') ||
          (c.env.CORS_ORIGIN && c.env.CORS_ORIGIN.split(',').map(s => s.trim()).includes(origin))
        ) {
          return origin;
        }
        return origin; // Permissive for API consumers with credentials
      },
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposeHeaders: ['Content-Length', 'Set-Cookie'],
      credentials: true,
      maxAge: 86400,
    });
    return corsMiddleware(c, next);
  });

  // Global Auth resolution middleware
  app.use('*', authMiddleware);

  // Health check endpoint
  app.get('/api/v1/health', (c) => {
    return c.json({
      status: 'ok',
      service: 'phone-repair-backend',
      timestamp: new Date().toISOString(),
      environment: c.env.ENVIRONMENT || 'development',
    });
  });

  // Versioned API routes under /api/v1
  const v1 = new Hono<{ Bindings: Env; Variables: { user?: AuthUser; sessionToken?: string } }>();
  v1.route('/auth', authRoutes);
  v1.route('/repairs', repairsRoutes);
  v1.route('/', diagnosticsRoutes);
  v1.route('/', quotationsRoutes);
  v1.route('/uploads', uploadsRoutes);
  v1.route('/technician', technicianRoutes);
  v1.route('/admin', adminRoutes);

  app.route('/api/v1', v1);

  // 404 handler
  app.notFound((c) => {
    return c.json({ error: 'Endpoint not found' }, 404);
  });

  // Centralized Error handler
  app.onError((err, c) => errorHandler(err, c));

  return app;
}
