import { RepairStatus, RepairabilityDecision } from '../types';

export interface TransitionValidationResult {
  allowed: boolean;
  reason?: string;
}

export const VALID_TRANSITIONS: Record<RepairStatus, RepairStatus[]> = {
  NEW: ['UNDER_DIAGNOSIS', 'CANCELLED'],
  UNDER_DIAGNOSIS: [
    'REPAIRABLE',
    'UNREPAIRABLE',
    'REPAIR_NOT_ECONOMICAL',
    'WAITING_FOR_PARTS',
    'CANCELLED',
  ],
  WAITING_FOR_PARTS: [
    'UNDER_DIAGNOSIS',
    'REPAIRABLE',
    'UNREPAIRABLE',
    'IN_REPAIR',
    'CANCELLED',
  ],
  REPAIRABLE: ['QUOTE_PENDING', 'UNDER_DIAGNOSIS', 'CANCELLED'],
  UNREPAIRABLE: ['UNDER_DIAGNOSIS', 'READY_FOR_PICKUP', 'CANCELLED'],
  REPAIR_NOT_ECONOMICAL: ['UNDER_DIAGNOSIS', 'READY_FOR_PICKUP', 'CANCELLED'],
  QUOTE_PENDING: ['QUOTE_ACCEPTED', 'QUOTE_REJECTED', 'CANCELLED', 'UNDER_DIAGNOSIS'],
  QUOTE_ACCEPTED: ['IN_REPAIR', 'WAITING_FOR_PARTS', 'QUOTE_PENDING', 'CANCELLED'],
  QUOTE_REJECTED: ['QUOTE_PENDING', 'READY_FOR_PICKUP', 'CANCELLED'],
  IN_REPAIR: [
    'REPAIR_COMPLETED',
    'WAITING_FOR_PARTS',
    'QUOTE_PENDING', // If additional discovered faults require revised quote
    'UNREPAIRABLE',
    'CANCELLED',
  ],
  REPAIR_COMPLETED: ['READY_FOR_PICKUP'],
  READY_FOR_PICKUP: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export class WorkflowService {
  /**
   * Check whether a transition between two statuses is syntactically and logically allowed.
   */
  static canTransition(from: RepairStatus, to: RepairStatus): boolean {
    if (from === to) return true;
    const allowed = VALID_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
  }

  /**
   * Validate business prerequisites for a repair transition.
   */
  static validateTransition(
    from: RepairStatus,
    to: RepairStatus,
    context: {
      hasDiagnosis?: boolean;
      diagnosisDecision?: RepairabilityDecision;
      hasActiveQuote?: boolean;
      isQuoteApproved?: boolean;
      decisionExplanation?: string;
    }
  ): TransitionValidationResult {
    if (!this.canTransition(from, to)) {
      return {
        allowed: false,
        reason: `Cannot transition from '${from}' to '${to}'. Allowed next states are: ${VALID_TRANSITIONS[from].join(', ') || 'None (Terminal state)'}.`,
      };
    }

    // A technician must inspect and record diagnosis before marking REPAIRABLE, UNREPAIRABLE, or REPAIR_NOT_ECONOMICAL
    if (['REPAIRABLE', 'UNREPAIRABLE', 'REPAIR_NOT_ECONOMICAL'].includes(to)) {
      if (!context.hasDiagnosis) {
        return {
          allowed: false,
          reason: 'A technician diagnosis must be submitted before setting repairability status.',
        };
      }
    }

    // Unrepairable requires an explanation
    if (to === 'UNREPAIRABLE' || to === 'REPAIR_NOT_ECONOMICAL') {
      if (!context.decisionExplanation || context.decisionExplanation.trim().length < 5) {
        return {
          allowed: false,
          reason: 'A detailed reason is mandatory when declaring a device unrepairable or not economical to repair.',
        };
      }
    }

    // Repair cannot start before explicit approval of the current quotation
    if (to === 'IN_REPAIR') {
      if (!context.hasActiveQuote) {
        return {
          allowed: false,
          reason: 'Cannot start repair without an active quotation.',
        };
      }
      if (!context.isQuoteApproved) {
        return {
          allowed: false,
          reason: 'The repair cannot start before explicit customer approval of the current quotation.',
        };
      }
    }

    return { allowed: true };
  }
}
