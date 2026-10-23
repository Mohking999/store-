import { D1Database } from '@cloudflare/workers-types';
import { generateId } from '../utils/crypto';
import { AuthUser, QuoteStatus, QuoteItemType } from '../types';

export class QuotationsService {
  constructor(private db: D1Database) {}

  async createQuotation(
    repairId: string,
    data: {
      items: Array<{
        itemType: QuoteItemType;
        description: string;
        unitPriceDzd: number;
        quantity: number;
      }>;
      technicianNotes?: string;
      estimatedCompletionDate?: string;
      expirationDays?: number;
    },
    technician: AuthUser
  ) {
    const repair = await this.db
      .prepare('SELECT id, customer_id, current_status FROM repair_requests WHERE id = ?')
      .bind(repairId)
      .first<{ id: string; customer_id: string; current_status: string }>();

    if (!repair) {
      throw new Error('Repair request not found.');
    }

    if (data.items.length === 0) {
      throw new Error('Quotation must contain at least one item.');
    }

    // Calculate total exact integer DZD
    let totalPriceDzd = 0;
    for (const item of data.items) {
      if (item.unitPriceDzd < 0 || item.quantity <= 0) {
        throw new Error('Item prices and quantities must be positive integers.');
      }
      totalPriceDzd += Math.round(item.unitPriceDzd * item.quantity);
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const expirationDays = data.expirationDays || 14;
    const expirationDate = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000).toISOString();

    // Get current version number
    const maxVersionRow = await this.db
      .prepare('SELECT MAX(version) as max_v FROM repair_quotes WHERE repair_id = ?')
      .bind(repairId)
      .first<{ max_v: number | null }>();
    const nextVersion = (maxVersionRow?.max_v || 0) + 1;

    // Check if previous quotation was accepted:
    // "Changing a quotation after approval invalidates the previous approval and requires new approval."
    const existingQuotes = await this.db
      .prepare('SELECT id, status FROM repair_quotes WHERE repair_id = ? AND status IN (\'PENDING\', \'ACCEPTED\')')
      .bind(repairId)
      .all<{ id: string; status: QuoteStatus }>();

    let wasPreviouslyAccepted = false;
    if (existingQuotes.results) {
      for (const eq of existingQuotes.results) {
        if (eq.status === 'ACCEPTED') {
          wasPreviouslyAccepted = true;
        }
        // Supersede active or accepted quote
        await this.db
          .prepare('UPDATE repair_quotes SET status = \'SUPERSEDED\', updated_at = ? WHERE id = ?')
          .bind(nowIso, eq.id)
          .run();
      }
    }

    const quoteId = generateId('qte');
    const quotationNumber = `Q-${repairId.substring(4, 10).toUpperCase()}-V${nextVersion}`;

    // Insert new quote
    await this.db
      .prepare(
        `INSERT INTO repair_quotes (
          id, repair_id, quotation_number, version, total_price_dzd,
          estimated_completion_date, technician_notes, expiration_date,
          status, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?)`
      )
      .bind(
        quoteId,
        repairId,
        quotationNumber,
        nextVersion,
        totalPriceDzd,
        data.estimatedCompletionDate || null,
        data.technicianNotes || null,
        expirationDate,
        technician.id,
        nowIso,
        nowIso
      )
      .run();

    // Insert quote items
    for (const item of data.items) {
      const itemId = generateId('qitem');
      const itemTotal = Math.round(item.unitPriceDzd * item.quantity);
      await this.db
        .prepare(
          `INSERT INTO quote_items (id, quote_id, item_type, description, unit_price_dzd, quantity, total_price_dzd)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(itemId, quoteId, itemTypeToDb(item.itemType), item.description, item.unitPriceDzd, item.quantity, itemTotal)
        .run();
    }

    // Update repair status to QUOTE_PENDING
    const oldStatus = repair.current_status;
    await this.db
      .prepare('UPDATE repair_requests SET current_status = \'QUOTE_PENDING\', updated_at = ? WHERE id = ?')
      .bind(nowIso, repairId)
      .run();

    // Log status history
    const histId = generateId('hist');
    const historyNote = wasPreviouslyAccepted
      ? `Revised quotation #${quotationNumber} issued (${totalPriceDzd} DZD). Previous approval invalidated. Waiting for customer approval.`
      : `Quotation #${quotationNumber} issued for ${totalPriceDzd} DZD. Waiting for customer approval.`;

    await this.db
      .prepare(
        `INSERT INTO repair_status_history (id, repair_id, from_status, to_status, changed_by, notes, created_at)
         VALUES (?, ?, ?, 'QUOTE_PENDING', ?, ?, ?)`
      )
      .bind(histId, repairId, oldStatus, technician.id, historyNote, nowIso)
      .run();

    // Notify customer
    const notifId = generateId('notif');
    await this.db
      .prepare(
        `INSERT INTO notifications (id, user_id, repair_id, title, message, type, is_read, created_at)
         VALUES (?, ?, ?, 'New Repair Quotation Ready', ?, 'QUOTE', 0, ?)`
      )
      .bind(
        notifId,
        repair.customer_id,
        repairId,
        `A repair quotation of ${totalPriceDzd.toLocaleString()} DZD is ready for your review and approval.`,
        nowIso
      )
      .run();

    return {
      quoteId,
      quotationNumber,
      version: nextVersion,
      totalPriceDzd,
      status: 'PENDING',
    };
  }

  async processCustomerDecision(
    quoteId: string,
    decision: 'APPROVED' | 'REJECTED',
    currentUser: AuthUser,
    clientMeta: { ip?: string; userAgent?: string; rejectionReason?: string }
  ) {
    const quote = await this.db
      .prepare('SELECT * FROM repair_quotes WHERE id = ?')
      .bind(quoteId)
      .first<any>();

    if (!quote) {
      throw new Error('Quotation not found.');
    }

    if (quote.status !== 'PENDING') {
      throw new Error(`Cannot respond to a quotation with status '${quote.status}'. Only PENDING quotations can be approved or rejected.`);
    }

    const repair = await this.db
      .prepare('SELECT id, customer_id, current_status FROM repair_requests WHERE id = ?')
      .bind(quote.repair_id)
      .first<{ id: string; customer_id: string; current_status: string }>();

    if (!repair) {
      throw new Error('Associated repair request not found.');
    }

    // Security check: "Only the customer authorized for that request can approve or reject the quotation."
    if (currentUser.role === 'CUSTOMER' && currentUser.id !== repair.customer_id) {
      throw new Error('Forbidden: You are not authorized to respond to this quotation.');
    }

    const now = new Date().toISOString();
    const newQuoteStatus = decision === 'APPROVED' ? 'ACCEPTED' : 'REJECTED';
    const newRepairStatus = decision === 'APPROVED' ? 'QUOTE_ACCEPTED' : 'QUOTE_REJECTED';

    // Update quote status
    await this.db
      .prepare('UPDATE repair_quotes SET status = ?, updated_at = ? WHERE id = ?')
      .bind(newQuoteStatus, now, quoteId)
      .run();

    // Record approval audit record
    const approvalId = generateId('appr');
    await this.db
      .prepare(
        `INSERT INTO customer_approvals (
          id, quote_id, repair_id, customer_id, decision, rejection_reason, ip_address, user_agent, decision_timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        approvalId,
        quoteId,
        repair.id,
        currentUser.id,
        decision,
        clientMeta.rejectionReason || null,
        clientMeta.ip || null,
        clientMeta.userAgent || null,
        now
      )
      .run();

    // Update repair status
    await this.db
      .prepare('UPDATE repair_requests SET current_status = ?, updated_at = ? WHERE id = ?')
      .bind(newRepairStatus, now, repair.id)
      .run();

    // Record status history
    const histId = generateId('hist');
    const note = decision === 'APPROVED'
      ? `Customer approved quotation #${quote.quotation_number} (${quote.total_price_dzd} DZD). Ready for repair.`
      : `Customer rejected quotation #${quote.quotation_number}. Reason: ${clientMeta.rejectionReason || 'No reason provided'}`;

    await this.db
      .prepare(
        `INSERT INTO repair_status_history (id, repair_id, from_status, to_status, changed_by, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(histId, repair.id, repair.current_status, newRepairStatus, currentUser.id, note, now)
      .run();

    return {
      quoteId,
      decision,
      repairStatus: newRepairStatus,
      timestamp: now,
    };
  }
}

function itemTypeToDb(type: QuoteItemType): string {
  if (['PART', 'LABOR', 'OTHER'].includes(type)) return type;
  return 'PART';
}
