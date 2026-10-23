import { D1Database } from '@cloudflare/workers-types';
import {
  generateId,
  generateReferenceNumber,
  generateTrackingToken,
  hashPassword,
} from '../utils/crypto';
import { normalizeAlgerianPhone } from '../utils/validation';
import { WorkflowService } from './workflow.service';
import {
  AuthUser,
  RepairStatus,
  RepairRequestRow,
  DeviceRow,
  DiagnosticRow,
  RepairQuoteRow,
  QuoteItemRow,
} from '../types';

export class RepairsService {
  constructor(private db: D1Database) {}

  async createRepair(
    data: {
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      preferredCommunication?: 'PHONE' | 'SMS' | 'WHATSAPP' | 'EMAIL';
      wilaya?: string;
      address?: string;
      brand: string;
      model: string;
      color?: string;
      imeiOrSerial?: string;
      warrantyStatus?: string;
      isPoweringOn?: boolean;
      deviceCondition?: string;
      mainIssueCategory: string;
      symptomDescription: string;
      problemStarted?: string;
      wasDropped?: boolean;
      liquidExposure?: boolean;
      previousRepairHistory?: string;
      isIntermittent?: boolean;
      attachmentKeys?: string[];
    },
    currentUser?: AuthUser
  ): Promise<{
    repairId: string;
    referenceNumber: string;
    trackingToken: string;
    customerId: string;
    status: RepairStatus;
  }> {
    const normalizedPhone = normalizeAlgerianPhone(data.customerPhone);
    const now = new Date().toISOString();
    let customerId: string;

    if (currentUser && currentUser.role === 'CUSTOMER') {
      customerId = currentUser.id;
    } else {
      // Find or create customer by phone
      const existingUser = await this.db
        .prepare('SELECT id FROM users WHERE phone = ?')
        .bind(normalizedPhone)
        .first<{ id: string }>();

      if (existingUser) {
        customerId = existingUser.id;
      } else {
        // Create user
        customerId = generateId('usr');
        const defaultEmail = data.customerEmail
          ? data.customerEmail.toLowerCase().trim()
          : `guest_${normalizedPhone.replace(/\+/g, '')}@phonerepair.dz`;
        const tempPassword = await hashPassword(generateTrackingToken().substring(0, 12));

        await this.db
          .prepare(
            `INSERT INTO users (id, email, phone, password_hash, role, full_name, is_active, created_at, updated_at)
             VALUES (?, ?, ?, ?, 'CUSTOMER', ?, 1, ?, ?)`
          )
          .bind(customerId, defaultEmail, normalizedPhone, tempPassword, data.customerName, now, now)
          .run();

        // Create customer profile
        const profileId = generateId('cp');
        await this.db
          .prepare(
            `INSERT INTO customer_profiles (id, user_id, preferred_communication, wilaya, address, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            profileId,
            customerId,
            data.preferredCommunication || 'PHONE',
            data.wilaya || 'Algiers',
            data.address || null,
            now,
            now
          )
          .run();
      }
    }

    // Create Device
    const deviceId = generateId('dev');
    await this.db
      .prepare(
        `INSERT INTO devices (id, brand, model, color, imei_serial, is_powering_on, device_condition, warranty_status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        deviceId,
        data.brand,
        data.model,
        data.color || null,
        data.imeiOrSerial || null,
        data.isPoweringOn ? 1 : 0,
        data.deviceCondition || 'FAIR',
        data.warrantyStatus || null,
        now
      )
      .run();

    // Generate unique reference number and tracking token
    let referenceNumber = generateReferenceNumber();
    // Ensure uniqueness
    const existingRef = await this.db
      .prepare('SELECT id FROM repair_requests WHERE reference_number = ?')
      .bind(referenceNumber)
      .first();
    if (existingRef) {
      referenceNumber = `${generateReferenceNumber()}-${Math.floor(Math.random() * 90 + 10)}`;
    }
    const trackingToken = generateTrackingToken();
    const repairId = generateId('rep');

    // Create Repair Request
    await this.db
      .prepare(
        `INSERT INTO repair_requests (
          id, reference_number, public_tracking_token, customer_id, device_id,
          main_issue_category, symptom_description, problem_started, was_dropped,
          liquid_exposure, previous_repair_history, is_intermittent, current_status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?, ?)`
      )
      .bind(
        repairId,
        referenceNumber,
        trackingToken,
        customerId,
        deviceId,
        data.mainIssueCategory,
        data.symptomDescription,
        data.problemStarted || null,
        data.wasDropped ? 1 : 0,
        data.liquidExposure ? 1 : 0,
        data.previousRepairHistory || null,
        data.isIntermittent ? 1 : 0,
        now,
        now
      )
      .run();

    // Attach any uploaded R2 keys
    if (data.attachmentKeys && data.attachmentKeys.length > 0) {
      for (const key of data.attachmentKeys) {
        const attId = generateId('att');
        await this.db
          .prepare(
            `INSERT INTO repair_attachments (id, repair_id, file_key, file_name, file_size, content_type, uploaded_by, created_at)
             VALUES (?, ?, ?, ?, 0, 'image/jpeg', ?, ?)`
          )
          .bind(attId, repairId, key, key.split('/').pop() || 'photo.jpg', customerId, now)
          .run();
      }
    }

    // Insert initial status history
    const historyId = generateId('hist');
    await this.db
      .prepare(
        `INSERT INTO repair_status_history (id, repair_id, from_status, to_status, changed_by, notes, created_at)
         VALUES (?, ?, NULL, 'NEW', ?, 'Repair request submitted by customer', ?)`
      )
      .bind(historyId, repairId, customerId, now)
      .run();

    // Create initial notification
    const notifId = generateId('notif');
    await this.db
      .prepare(
        `INSERT INTO notifications (id, user_id, repair_id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, 'Repair Request Created', ?, 'INFO', 0, ?)`
      )
      .bind(
        notifId,
        customerId,
        repairId,
        `Your repair request ${referenceNumber} for ${data.brand} ${data.model} has been received.`,
        now
      )
      .run();

    return {
      repairId,
      referenceNumber,
      trackingToken,
      customerId,
      status: 'NEW',
    };
  }

  async listRepairs(
    user: AuthUser,
    filters: {
      status?: RepairStatus;
      brand?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const offset = (page - 1) * limit;

    let baseQuery = `
      FROM repair_requests r
      JOIN devices d ON r.device_id = d.id
      JOIN users u ON r.customer_id = u.id
      LEFT JOIN users tech ON r.assigned_technician_id = tech.id
      LEFT JOIN (
        SELECT repair_id, total_price_dzd, status as quote_status
        FROM repair_quotes
        WHERE status IN ('PENDING', 'ACCEPTED')
        ORDER BY version DESC LIMIT 1
      ) q ON r.id = q.repair_id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Authorization filter: Customers can ONLY see their own repairs
    if (user.role === 'CUSTOMER') {
      baseQuery += ` AND r.customer_id = ?`;
      params.push(user.id);
    }

    if (filters.status) {
      baseQuery += ` AND r.current_status = ?`;
      params.push(filters.status);
    }

    if (filters.brand) {
      baseQuery += ` AND d.brand = ?`;
      params.push(filters.brand);
    }

    if (filters.search) {
      baseQuery += ` AND (
        r.reference_number LIKE ? OR
        d.model LIKE ? OR
        u.full_name LIKE ? OR
        u.phone LIKE ?
      )`;
      const term = `%${filters.search}%`;
      params.push(term, term, term, term);
    }

    // Get total count
    const countSql = `SELECT COUNT(*) as total ${baseQuery}`;
    const countStmt = this.db.prepare(countSql);
    const countRes = await (params.length > 0 ? countStmt.bind(...params) : countStmt).first<{
      total: number;
    }>();
    const total = countRes?.total || 0;

    // Fetch page items
    const selectSql = `
      SELECT 
        r.id, r.reference_number, r.current_status, r.main_issue_category, r.symptom_description,
        r.created_at, r.updated_at,
        d.brand, d.model, d.color, d.device_condition, d.is_powering_on,
        u.id as customer_id, u.full_name as customer_name, u.phone as customer_phone, u.email as customer_email,
        tech.id as technician_id, tech.full_name as technician_name,
        q.total_price_dzd, q.quote_status
      ${baseQuery}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const selectParams = [...params, limit, offset];
    const itemsRes = await this.db.prepare(selectSql).bind(...selectParams).all<any>();

    return {
      items: itemsRes.results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRepairById(repairId: string, currentUser?: AuthUser) {
    const repair = await this.db
      .prepare(
        `SELECT 
          r.*,
          d.brand, d.model, d.color, d.imei_serial, d.is_powering_on, d.device_condition, d.warranty_status,
          u.full_name as customer_name, u.phone as customer_phone, u.email as customer_email,
          cp.preferred_communication, cp.wilaya, cp.address as customer_address,
          tech.full_name as technician_name
        FROM repair_requests r
        JOIN devices d ON r.device_id = d.id
        JOIN users u ON r.customer_id = u.id
        LEFT JOIN customer_profiles cp ON cp.user_id = u.id
        LEFT JOIN users tech ON r.assigned_technician_id = tech.id
        WHERE r.id = ? OR r.reference_number = ?`
      )
      .bind(repairId, repairId)
      .first<any>();

    if (!repair) {
      return null;
    }

    // Object-level authorization check: Customers can only access their own repair
    if (currentUser && currentUser.role === 'CUSTOMER' && currentUser.id !== repair.customer_id) {
      throw new Error('Forbidden: You are not authorized to view this repair request.');
    }

    // Attachments
    const attachments = await this.db
      .prepare('SELECT id, file_key, file_name, file_size, content_type, created_at FROM repair_attachments WHERE repair_id = ?')
      .bind(repair.id)
      .all();

    // Diagnostics
    const diagnosis = await this.db
      .prepare(
        `SELECT diag.*, u.full_name as technician_name
         FROM diagnostics diag
         JOIN users u ON diag.technician_id = u.id
         WHERE diag.repair_id = ?`
      )
      .bind(repair.id)
      .first();

    // Quotes
    const quotes = await this.db
      .prepare(
        `SELECT q.*, u.full_name as created_by_name
         FROM repair_quotes q
         JOIN users u ON q.created_by = u.id
         WHERE q.repair_id = ?
         ORDER BY q.version DESC`
      )
      .bind(repair.id)
      .all<RepairQuoteRow>();

    // For each quote, fetch items
    const quotesWithItems = [];
    if (quotes.results) {
      for (const q of quotes.results) {
        const items = await this.db
          .prepare('SELECT * FROM quote_items WHERE quote_id = ?')
          .bind(q.id)
          .all<QuoteItemRow>();
        quotesWithItems.push({
          ...q,
          items: items.results || [],
        });
      }
    }

    // Customer Approvals
    const approvals = await this.db
      .prepare(
        `SELECT a.*, u.full_name as customer_name
         FROM customer_approvals a
         JOIN users u ON a.customer_id = u.id
         WHERE a.repair_id = ?
         ORDER BY a.decision_timestamp DESC`
      )
      .bind(repair.id)
      .all();

    // Status History
    const history = await this.db
      .prepare(
        `SELECT h.*, u.full_name as changed_by_name, u.role as changed_by_role
         FROM repair_status_history h
         LEFT JOIN users u ON h.changed_by = u.id
         WHERE h.repair_id = ?
         ORDER BY h.created_at ASC`
      )
      .bind(repair.id)
      .all();

    return {
      repair,
      attachments: attachments.results || [],
      diagnosis,
      quotes: quotesWithItems,
      approvals: approvals.results || [],
      history: history.results || [],
    };
  }

  async trackPublicRepair(referenceNumber: string, phoneOrToken: string) {
    const normalizedInput = phoneOrToken.includes('+') || /^\d+$/.test(phoneOrToken)
      ? normalizeAlgerianPhone(phoneOrToken)
      : phoneOrToken;

    const repair = await this.db
      .prepare(
        `SELECT 
          r.id, r.reference_number, r.current_status, r.main_issue_category, r.symptom_description,
          r.created_at, r.updated_at,
          d.brand, d.model, d.color,
          u.phone as customer_phone,
          r.public_tracking_token
        FROM repair_requests r
        JOIN devices d ON r.device_id = d.id
        JOIN users u ON r.customer_id = u.id
        WHERE r.reference_number = ?`
      )
      .bind(referenceNumber.trim().toUpperCase())
      .first<any>();

    if (!repair) {
      return null;
    }

    // Security check: Match either public tracking token OR the customer's phone number
    const tokenMatch = repair.public_tracking_token === phoneOrToken.trim();
    const phoneMatch = repair.customer_phone === normalizedInput;

    if (!tokenMatch && !phoneMatch) {
      throw new Error('Verification failed: Reference number and verification key do not match.');
    }

    // Fetch public status timeline
    const history = await this.db
      .prepare(
        `SELECT to_status, notes, created_at
         FROM repair_status_history
         WHERE repair_id = ?
         ORDER BY created_at ASC`
      )
      .bind(repair.id)
      .all();

    // Check if there is an active quote
    const latestQuote = await this.db
      .prepare(
        `SELECT id, quotation_number, version, total_price_dzd, status, estimated_completion_date, technician_notes, expiration_date
         FROM repair_quotes
         WHERE repair_id = ?
         ORDER BY version DESC LIMIT 1`
      )
      .bind(repair.id)
      .first<any>();

    let quoteItems: any[] = [];
    if (latestQuote) {
      const items = await this.db
        .prepare('SELECT item_type, description, unit_price_dzd, quantity, total_price_dzd FROM quote_items WHERE quote_id = ?')
        .bind(latestQuote.id)
        .all();
      quoteItems = items.results || [];
    }

    // Return sanitized public tracking response (Zero personal PII leaked)
    return {
      referenceNumber: repair.reference_number,
      brand: repair.brand,
      model: repair.model,
      color: repair.color,
      category: repair.main_issue_category,
      currentStatus: repair.current_status,
      submittedAt: repair.created_at,
      lastUpdatedAt: repair.updated_at,
      history: history.results || [],
      activeQuote: latestQuote ? { ...latestQuote, items: quoteItems } : null,
      trackingToken: repair.public_tracking_token,
    };
  }

  async updateRepairStatus(
    repairId: string,
    toStatus: RepairStatus,
    currentUser: AuthUser,
    notes?: string
  ) {
    const repair = await this.db
      .prepare('SELECT * FROM repair_requests WHERE id = ?')
      .bind(repairId)
      .first<RepairRequestRow>();

    if (!repair) {
      throw new Error('Repair request not found.');
    }

    const currentStatus = repair.current_status;

    // Check diagnosis
    const diagnosis = await this.db
      .prepare('SELECT * FROM diagnostics WHERE repair_id = ?')
      .bind(repairId)
      .first<DiagnosticRow>();

    // Check quotes
    const activeQuote = await this.db
      .prepare(
        `SELECT * FROM repair_quotes
         WHERE repair_id = ? AND status IN ('PENDING', 'ACCEPTED')
         ORDER BY version DESC LIMIT 1`
      )
      .bind(repairId)
      .first<RepairQuoteRow>();

    // Enforce workflow validation
    const validation = WorkflowService.validateTransition(currentStatus, toStatus, {
      hasDiagnosis: !!diagnosis,
      diagnosisDecision: diagnosis?.repairability_decision,
      hasActiveQuote: !!activeQuote,
      isQuoteApproved: activeQuote?.status === 'ACCEPTED',
      decisionExplanation: diagnosis?.decision_explanation,
    });

    if (!validation.allowed) {
      throw new Error(validation.reason || `Transition to ${toStatus} is not permitted.`);
    }

    const now = new Date().toISOString();

    // Update status
    await this.db
      .prepare('UPDATE repair_requests SET current_status = ?, updated_at = ? WHERE id = ?')
      .bind(toStatus, now, repairId)
      .run();

    // Log status history
    const histId = generateId('hist');
    await this.db
      .prepare(
        `INSERT INTO repair_status_history (id, repair_id, from_status, to_status, changed_by, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(histId, repairId, currentStatus, toStatus, currentUser.id, notes || `Status changed to ${toStatus}`, now)
      .run();

    // Notify customer
    const notifId = generateId('notif');
    await this.db
      .prepare(
        `INSERT INTO notifications (id, user_id, repair_id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, 'Repair Status Updated', ?, 'STATUS_UPDATE', 0, ?)`
      )
      .bind(
        notifId,
        repair.customer_id,
        repairId,
        `Status updated to: ${toStatus.replace(/_/g, ' ')}. ${notes || ''}`,
        now
      )
      .run();

    return {
      repairId,
      fromStatus: currentStatus,
      toStatus,
      updatedAt: now,
    };
  }
}
