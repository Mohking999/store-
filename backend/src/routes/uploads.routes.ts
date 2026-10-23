import { Hono } from 'hono';
import { Env, AuthUser } from '../types';
import { generateId } from '../utils/crypto';
import { rateLimiter } from '../middleware/rateLimit';

export const uploadsRoutes = new Hono<{ Bindings: Env; Variables: { user?: AuthUser } }>();

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Verify magic bytes for real content validation
function verifyMagicBytes(buffer: Uint8Array, mime: string): boolean {
  if (buffer.length < 4) return false;
  if (mime === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mime === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  if (mime === 'image/webp') {
    return (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46
    );
  }
  if (mime === 'application/pdf') {
    return (
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46
    );
  }
  return true;
}

// Upload endpoint
uploadsRoutes.post(
  '/',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 30, message: 'Upload rate limit reached' }),
  async (c) => {
    try {
      const formData = await c.req.formData();
      const file = formData.get('file') as unknown;

      if (!file || typeof file !== 'object' || !('arrayBuffer' in file) || !('size' in file) || !('type' in file)) {
        return c.json({ error: 'No file provided' }, 400);
      }

      const uploadFile = file as { name: string; size: number; type: string; arrayBuffer: () => Promise<ArrayBuffer> };

      if (uploadFile.size > MAX_FILE_SIZE) {
        return c.json({ error: 'File size exceeds maximum allowed 10MB limit' }, 400);
      }

      const mimeType = uploadFile.type.toLowerCase();
      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        return c.json(
          {
            error: 'Invalid file format. Allowed formats: JPG, PNG, WEBP, PDF',
            receivedType: mimeType,
          },
          400
        );
      }

      const arrayBuffer = await uploadFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      if (!verifyMagicBytes(bytes, mimeType)) {
        return c.json({ error: 'File content does not match reported MIME type' }, 400);
      }

      // Extension extraction
      const ext = mimeType === 'image/jpeg' ? 'jpg' : mimeType.split('/')[1];
      const randomKey = `repairs/${generateId()}.${ext}`;

      if (c.env.BUCKET) {
        await c.env.BUCKET.put(randomKey, arrayBuffer, {
          httpMetadata: { contentType: mimeType },
          customMetadata: {
            originalName: encodeURIComponent(uploadFile.name),
            uploadedAt: new Date().toISOString(),
          },
        });
      } else {
        console.warn('R2 bucket binding not available in environment; simulated upload.');
      }

      return c.json({
        fileKey: randomKey,
        fileName: uploadFile.name,
        fileSize: uploadFile.size,
        contentType: mimeType,
      }, 201);
    } catch (err: any) {
      console.error('File upload error:', err);
      return c.json({ error: err.message || 'Failed to upload file' }, 500);
    }
  }
);

// Stream private attachment through Worker with validation
uploadsRoutes.get('/:key{.+}', async (c) => {
  const key = c.req.param('key');

  // Prevent path traversal
  if (key.includes('..') || key.startsWith('/')) {
    return c.json({ error: 'Invalid object key' }, 400);
  }

  if (!c.env.BUCKET) {
    return c.json({ error: 'Storage bucket not configured' }, 503);
  }

  try {
    const object = await c.env.BUCKET.get(key);
    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'private, max-age=3600');
    headers.set('X-Content-Type-Options', 'nosniff');

    return new Response(object.body, { headers });
  } catch (err: any) {
    console.error('Attachment streaming error:', err);
    return c.json({ error: 'Error streaming attachment' }, 500);
  }
});
