import { Context } from 'hono';
import { ZodError } from 'zod';

export function errorHandler(err: Error, c: Context) {
  console.error('Unhandled API Error:', err);

  if (err instanceof ZodError) {
    return c.json(
      {
        error: 'Validation failed',
        issues: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      400
    );
  }

  const message = err.message || 'Internal server error';
  return c.json(
    {
      error: message,
    },
    500
  );
}
