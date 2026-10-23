// Frontend TypeScript Types

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

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  fullName: string;
}

export interface QuoteItem {
  id?: string;
  quote_id?: string;
  item_type: QuoteItemType;
  description: string;
  unit_price_dzd: number;
  quantity: number;
  total_price_dzd: number;
}

export interface Quote {
  id: string;
  repair_id: string;
  quotation_number: string;
  version: number;
  total_price_dzd: number;
  estimated_completion_date?: string | null;
  technician_notes?: string | null;
  expiration_date?: string | null;
  status: QuoteStatus;
  created_by?: string;
  created_at: string;
  items?: QuoteItem[];
}

export interface Diagnosis {
  id: string;
  repair_id: string;
  technician_id: string;
  technician_name?: string;
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

export interface Attachment {
  id: string;
  file_key: string;
  file_name: string;
  file_size: number;
  content_type: string;
  created_at: string;
}

export interface StatusHistory {
  id?: string;
  from_status?: string | null;
  to_status: RepairStatus;
  changed_by_name?: string | null;
  changed_by_role?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface RepairDetails {
  repair: {
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
    brand: string;
    model: string;
    color?: string | null;
    imei_serial?: string | null;
    is_powering_on: number;
    device_condition: string;
    warranty_status?: string | null;
    customer_name: string;
    customer_phone: string;
    customer_email?: string | null;
    preferred_communication?: string;
    wilaya?: string;
    customer_address?: string | null;
    technician_name?: string | null;
  };
  attachments: Attachment[];
  diagnosis?: Diagnosis | null;
  quotes: Quote[];
  approvals: any[];
  history: StatusHistory[];
}
