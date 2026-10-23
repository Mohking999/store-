import { D1Database } from '@cloudflare/workers-types';
import { generateId } from '../utils/crypto';
import { AuthUser, RepairStatus, RepairabilityDecision } from '../types';

export class DiagnosticsService {
  constructor(private db: D1Database) {}

  async createOrUpdateDiagnosis(
    repairId: string,
    data: {
      reportedSymptoms: string;
      inspectionFindings: string;
      suspectedFault: string;
      confirmedFault: string;
      repairabilityDecision: RepairabilityDecision;
      decisionExplanation: string;
      recommendedSolution: string;
      laborEstimate?: number;
      partsEstimate?: number;
      additionalCosts?: number;
      estimatedRepairDurationHours?: number;
      estimatedCompletionDate?: string;
    },
    technician: AuthUser
  ) {
    const repair = await this.db
      .prepare('SELECT id, customer_id, current_status FROM repair_requests WHERE id = ?')
      .bind(repairId)
      .first<{ id: string; customer_id: string; current_status: RepairStatus }>();

    if (!repair) {
      throw new Error('Repair request not found.');
    }

    if (!data.decisionExplanation || data.decisionExplanation.trim().length < 5) {
      throw new Error('A detailed explanation is required for the repairability decision.');
    }

    const now = new Date().toISOString();
    const existing = await this.db
      .prepare('SELECT id FROM diagnostics WHERE repair_id = ?')
      .bind(repairId)
      .first<{ id: string }>();

    let diagnosisId: string;
    if (existing) {
      diagnosisId = existing.id;
      await this.db
        .prepare(
          `UPDATE diagnostics SET
            technician_id = ?,
            reported_symptoms = ?,
            inspection_findings = ?,
            suspected_fault = ?,
            confirmed_fault = ?,
            repairability_decision = ?,
            decision_explanation = ?,
            recommended_solution = ?,
            labor_estimate = ?,
            parts_estimate = ?,
            additional_costs = ?,
            estimated_repair_duration_hours = ?,
            estimated_completion_date = ?,
            updated_at = ?
          WHERE id = ?`
        )
        .bind(
          technician.id,
          data.reportedSymptoms,
          data.inspectionFindings,
          data.suspectedFault,
          data.confirmedFault,
          data.repairabilityDecision,
          data.decisionExplanation,
          data.recommendedSolution,
          data.laborEstimate || 0,
          data.partsEstimate || 0,
          data.additionalCosts || 0,
          data.estimatedRepairDurationHours || 24,
          data.estimatedCompletionDate || null,
          now,
          diagnosisId
        )
        .run();
    } else {
      diagnosisId = generateId('diag');
      await this.db
        .prepare(
          `INSERT INTO diagnostics (
            id, repair_id, technician_id, reported_symptoms, inspection_findings,
            suspected_fault, confirmed_fault, repairability_decision, decision_explanation,
            recommended_solution, labor_estimate, parts_estimate, additional_costs,
            estimated_repair_duration_hours, estimated_completion_date, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          diagnosisId,
          repairId,
          technician.id,
          data.reportedSymptoms,
          data.inspectionFindings,
          data.suspectedFault,
          data.confirmedFault,
          data.repairabilityDecision,
          data.decisionExplanation,
          data.recommendedSolution,
          data.laborEstimate || 0,
          data.partsEstimate || 0,
          data.additionalCosts || 0,
          data.estimatedRepairDurationHours || 24,
          data.estimatedCompletionDate || null,
          now,
          now
        )
        .run();
    }

    // Determine target status
    let targetStatus: RepairStatus;
    if (data.repairabilityDecision === 'REPAIRABLE') {
      targetStatus = 'REPAIRABLE';
    } else if (data.repairabilityDecision === 'UNREPAIRABLE') {
      targetStatus = 'UNREPAIRABLE';
    } else {
      targetStatus = 'REPAIR_NOT_ECONOMICAL';
    }

    // Transition repair status if still NEW or UNDER_DIAGNOSIS
    if (['NEW', 'UNDER_DIAGNOSIS'].includes(repair.current_status)) {
      await this.db
        .prepare('UPDATE repair_requests SET current_status = ?, assigned_technician_id = ?, updated_at = ? WHERE id = ?')
        .bind(targetStatus, technician.id, now, repairId)
        .run();

      // Log status history
      const histId = generateId('hist');
      await this.db
        .prepare(
          `INSERT INTO repair_status_history (id, repair_id, from_status, to_status, changed_by, notes, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          histId,
          repairId,
          repair.current_status,
          targetStatus,
          technician.id,
          `Diagnosis completed: ${data.repairabilityDecision}. ${data.decisionExplanation}`,
          now
        )
        .run();

      // Notify customer
      const notifId = generateId('notif');
      const title = data.repairabilityDecision === 'REPAIRABLE' 
        ? 'Device Diagnosed: Repairable' 
        : 'Device Diagnosed: Not Repairable';
      await this.db
        .prepare(
          `INSERT INTO notifications (id, user_id, repair_id, title, message, type, is_read, created_at)
           VALUES (?, ?, ?, ?, ?, 'DIAGNOSIS', 0, ?)`
        )
        .bind(
          notifId,
          repair.customer_id,
          repairId,
          title,
          `Technician findings: ${data.confirmedFault}. Decision: ${data.repairabilityDecision}`,
          now
        )
        .run();
    }

    return {
      diagnosisId,
      repairId,
      decision: data.repairabilityDecision,
      targetStatus,
    };
  }

  async getDiagnosis(repairId: string) {
    return this.db
      .prepare(
        `SELECT d.*, u.full_name as technician_name
         FROM diagnostics d
         JOIN users u ON d.technician_id = u.id
         WHERE d.repair_id = ?`
      )
      .bind(repairId)
      .first();
  }
}
