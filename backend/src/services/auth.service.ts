import { D1Database } from '@cloudflare/workers-types';
import { hashPassword, verifyPassword, generateId, generateSessionToken } from '../utils/crypto';
import { normalizeAlgerianPhone } from '../utils/validation';
import { AuthUser, UserRole } from '../types';

export class AuthService {
  constructor(private db: D1Database) {}

  async registerCustomer(data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
    wilaya?: string;
    address?: string;
    preferredCommunication?: 'PHONE' | 'SMS' | 'WHATSAPP' | 'EMAIL';
  }): Promise<{ user: AuthUser; token: string; expiresAt: string }> {
    const normalizedPhone = normalizeAlgerianPhone(data.phone);
    const normalizedEmail = data.email.toLowerCase().trim();

    // Check existing email
    const existingEmail = await this.db
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(normalizedEmail)
      .first();
    if (existingEmail) {
      throw new Error('An account with this email address already exists.');
    }

    // Check existing phone
    const existingPhone = await this.db
      .prepare('SELECT id FROM users WHERE phone = ?')
      .bind(normalizedPhone)
      .first();
    if (existingPhone) {
      throw new Error('An account with this phone number already exists.');
    }

    const userId = generateId('usr');
    const passwordHash = await hashPassword(data.password);
    const role: UserRole = data.role || 'CUSTOMER';
    const now = new Date().toISOString();

    // Insert user
    await this.db
      .prepare(
        `INSERT INTO users (id, email, phone, password_hash, role, full_name, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`
      )
      .bind(userId, normalizedEmail, normalizedPhone, passwordHash, role, data.fullName, now, now)
      .run();

    // Insert profile based on role
    if (role === 'CUSTOMER') {
      const profileId = generateId('cp');
      await this.db
        .prepare(
          `INSERT INTO customer_profiles (id, user_id, preferred_communication, wilaya, address, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          profileId,
          userId,
          data.preferredCommunication || 'PHONE',
          data.wilaya || 'Algiers',
          data.address || null,
          now,
          now
        )
        .run();
    } else if (role === 'TECHNICIAN') {
      const profileId = generateId('tp');
      await this.db
        .prepare(
          `INSERT INTO technician_profiles (id, user_id, specialization, is_active, created_at, updated_at)
           VALUES (?, ?, 'General Hardware & Software', 1, ?, ?)`
        )
        .bind(profileId, userId, now, now)
        .run();
    }

    // Create session
    const session = await this.createSession(userId);

    return {
      user: {
        id: userId,
        email: normalizedEmail,
        phone: normalizedPhone,
        role,
        fullName: data.fullName,
      },
      token: session.token,
      expiresAt: session.expiresAt,
    };
  }

  async login(
    emailOrPhone: string,
    passwordPlain: string
  ): Promise<{ user: AuthUser; token: string; expiresAt: string }> {
    const input = emailOrPhone.trim();
    const isEmail = input.includes('@');
    const query = isEmail
      ? 'SELECT * FROM users WHERE email = ? AND is_active = 1'
      : 'SELECT * FROM users WHERE phone = ? AND is_active = 1';
    const param = isEmail ? input.toLowerCase() : normalizeAlgerianPhone(input);

    const user = await this.db.prepare(query).bind(param).first<{
      id: string;
      email: string;
      phone: string;
      password_hash: string;
      role: UserRole;
      full_name: string;
      is_active: number;
    }>();

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await verifyPassword(passwordPlain, user.password_hash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const session = await this.createSession(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        fullName: user.full_name,
      },
      token: session.token,
      expiresAt: session.expiresAt,
    };
  }

  async createSession(userId: string): Promise<{ token: string; expiresAt: string }> {
    const sessionId = generateId('sess');
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    const now = new Date().toISOString();

    await this.db
      .prepare(
        `INSERT INTO sessions (id, user_id, token, expires_at, created_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(sessionId, userId, token, expiresAt, now)
      .run();

    return { token, expiresAt };
  }

  async revokeSession(token: string): Promise<void> {
    await this.db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }

  async getUserById(userId: string): Promise<AuthUser | null> {
    const row = await this.db
      .prepare('SELECT id, email, phone, role, full_name FROM users WHERE id = ? AND is_active = 1')
      .bind(userId)
      .first<{
        id: string;
        email: string;
        phone: string;
        role: UserRole;
        full_name: string;
      }>();

    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      phone: row.phone,
      role: row.role,
      fullName: row.full_name,
    };
  }
}
