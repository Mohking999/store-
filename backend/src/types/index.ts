// Backend Types for Phone Repair Platform (Algeria)

export type UserRole = 'CUSTOMER' | 'TECHNICIAN' | 'ADMIN';

export type RepairStatus =
  | 'NEW'
  | 'UNDER_DIAGNOSIS'
  | 'REPAIRABLE'
  | 'UNREPAIRABLE'
  | 'REPAIR_NOT_ECONOMICAL'
  | 'WAITING_FOR_PARTS'
  | 'QUOTE_PENDING'
  | 'QUOTE_ACCEPTED'
  | 'QUOTE_REJECTED'
  | 'IN_REPAIR'
  | 'REPAIR_COMPLETED'
  | 'READY_FOR_PICKUP'
  | 'DELIVERED'
  | 'CANCELLED';

export type RepairabilityDecision = 'REPAIRABLE' | 'UNREPAIRABLE' | 'REPAIR_NOT_ECONOMICAL';

export type QuoteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SUPERSEDED';

export type QuoteItemType = 'PART' | 'LABOR' | 'OTHER';

export type ApprovalDecision = 'APPROVED' | 'REJECTED';

export type PreferredCommunication = 'PHONE' | 'SMS' | 'WHATSAPP' | 'EMAIL';

export interface Env {
  DB: D1Database;
  BUCKET?: R2Bucket;
  JWT_SECRET: string;
  ENVIRONMENT?: string;
  CORS_ORIGIN?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  fullName: string;
}

export interface UserRow {
  id: string;
  email: string;
  phone: string;
  password_hash: string;
  role: UserRole;
  full_name: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface SessionRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface DeviceRow {
  id: string;
  brand: string;
  model: string;
  color?: string | null;
  imei_serial?: string | null;
  is_powering_on: number;
  device_condition: string;
  warranty_status?: string | null;
  created_at: string;
}

export interface RepairRequestRow {
  id: string;
  reference_number: string;
  public_tracking_token: string;
  customer_id: string;
  device_id: string;
  assigned_technician_id?: string | null;
  main_issue_category: string;
  symptom_description: string;
  problem_started?: string | null;
  was_dropped: number;
  liquid_exposure: number;
  previous_repair_history?: string | null;
  is_intermittent: number;
  current_status: RepairStatus;
  created_at: string;
  updated_at: string;
}

export interface DiagnosticRow {
  id: string;
  repair_id: string;
  technician_id: string;
  reported_symptoms: string;
  inspection_findings: string;
  suspected_fault: string;
  confirmed_fault: string;
  repairability_decision: RepairabilityDecision;
  decision_explanation: string;
  recommended_solution: string;
  labor_estimate: number;
  parts_estimate: number;
  additional_costs: number;
  estimated_repair_duration_hours: number;
  estimated_completion_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RepairQuoteRow {
  id: string;
  repair_id: string;
  quotation_number: string;
  version: number;
  total_price_dzd: number;
  estimated_completion_date?: string | null;
  technician_notes?: string | null;
  expiration_date?: string | null;
  status: QuoteStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteItemRow {
  id: string;
  quote_id: string;
  item_type: QuoteItemType;
  description: string;
  unit_price_dzd: number;
  quantity: number;
  total_price_dzd: number;
}

export interface CustomerApprovalRow {
  id: string;
  quote_id: string;
  repair_id: string;
  customer_id: string;
  decision: ApprovalDecision;
  rejection_reason?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  decision_timestamp: string;
}

export interface StatusHistoryRow {
  id: string;
  repair_id: string;
  from_status?: string | null;
  to_status: string;
  changed_by?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  repair_id?: string | null;
  title: string;
  message: string;
  type: string;
  is_read: number;
  created_at: string;
}
