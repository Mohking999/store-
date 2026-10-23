import { describe, it, expect } from 'vitest';
import { WorkflowService } from '../src/services/workflow.service';

describe('Repair Workflow & State Machine', () => {
  it('allows valid initial transitions from NEW', () => {
    expect(WorkflowService.canTransition('NEW', 'UNDER_DIAGNOSIS')).toBe(true);
    expect(WorkflowService.canTransition('NEW', 'CANCELLED')).toBe(true);
    // Cannot jump straight from NEW to IN_REPAIR or DELIVERED
    expect(WorkflowService.canTransition('NEW', 'IN_REPAIR')).toBe(false);
    expect(WorkflowService.canTransition('NEW', 'DELIVERED')).toBe(false);
  });

  it('enforces technician diagnosis before repairability decision', () => {
    // Missing diagnosis
    const withoutDiagnosis = WorkflowService.validateTransition('UNDER_DIAGNOSIS', 'REPAIRABLE', {
      hasDiagnosis: false,
    });
    expect(withoutDiagnosis.allowed).toBe(false);
    expect(withoutDiagnosis.reason).toContain('technician diagnosis must be submitted');

    // With diagnosis
    const withDiagnosis = WorkflowService.validateTransition('UNDER_DIAGNOSIS', 'REPAIRABLE', {
      hasDiagnosis: true,
      diagnosisDecision: 'REPAIRABLE',
    });
    expect(withDiagnosis.allowed).toBe(true);
  });

  it('mandates a detailed explanation when declaring device UNREPAIRABLE', () => {
    const invalidUnrepairable = WorkflowService.validateTransition('UNDER_DIAGNOSIS', 'UNREPAIRABLE', {
      hasDiagnosis: true,
      decisionExplanation: '',
    });
    expect(invalidUnrepairable.allowed).toBe(false);
    expect(invalidUnrepairable.reason).toContain('detailed reason is mandatory');

    const validUnrepairable = WorkflowService.validateTransition('UNDER_DIAGNOSIS', 'UNREPAIRABLE', {
      hasDiagnosis: true,
      decisionExplanation: 'Motherboard multi-layer burn through CPU line',
    });
    expect(validUnrepairable.allowed).toBe(true);
  });

  it('prevents repair from starting before explicit quotation approval', () => {
    // No active quote
    const noQuote = WorkflowService.validateTransition('QUOTE_PENDING', 'IN_REPAIR', {
      hasActiveQuote: false,
      isQuoteApproved: false,
    });
    expect(noQuote.allowed).toBe(false);

    // Active quote but pending (not approved yet)
    const quoteNotApproved = WorkflowService.validateTransition('QUOTE_ACCEPTED', 'IN_REPAIR', {
      hasActiveQuote: true,
      isQuoteApproved: false,
    });
    expect(quoteNotApproved.allowed).toBe(false);
    expect(quoteNotApproved.reason).toContain('The repair cannot start before explicit customer approval');

    // Approved quote
    const approved = WorkflowService.validateTransition('QUOTE_ACCEPTED', 'IN_REPAIR', {
      hasActiveQuote: true,
      isQuoteApproved: true,
    });
    expect(approved.allowed).toBe(true);
  });

  it('enforces terminal states correctly', () => {
    expect(WorkflowService.canTransition('DELIVERED', 'IN_REPAIR')).toBe(false);
    expect(WorkflowService.canTransition('CANCELLED', 'UNDER_DIAGNOSIS')).toBe(false);
  });
});
