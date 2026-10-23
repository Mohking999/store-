import { z } from 'zod';

// Algerian phone number regex: +213 followed by 5/6/7/2/3/4 + 8 digits, or 05/06/07/02/03/04 + 8 digits
export const algerianPhoneRegex = /^(?:(?:\+|00)213|0)[567]\d{8}$/;

export function normalizeAlgerianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('0')) {
    return '+213' + cleaned.substring(1);
  }
  if (cleaned.startsWith('00213')) {
    return '+' + cleaned.substring(2);
  }
  if (!cleaned.startsWith('+')) {
    return '+' + cleaned;
  }
  return cleaned;
}

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(algerianPhoneRegex, 'Invalid Algerian phone number (e.g., 0550123456 or +213550123456)'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['CUSTOMER', 'TECHNICIAN', 'ADMIN']).default('CUSTOMER'),
  wilaya: z.string().optional().default('Algiers'),
  address: z.string().optional(),
  preferredCommunication: z.enum(['PHONE', 'SMS', 'WHATSAPP', 'EMAIL']).default('PHONE'),
});

export const loginSchema = z.object({
  emailOrPhone: z.string().min(3, 'Email or phone required'),
  password: z.string().min(1, 'Password required'),
});

export const phoneBrandEnum = z.enum([
  'Samsung',
  'Apple',
  'Xiaomi',
  'Redmi',
  'Oppo',
  'Huawei',
  'Realme',
  'Tecno',
  'Infinix',
  'Other',
]);

export const problemCategoryEnum = z.enum([
  'Broken screen',
  'Touchscreen malfunction',
  'Battery problems',
  'Charging port',
  'Phone does not turn on',
  'Software or operating system',
  'Camera',
  'Speaker or microphone',
  'Wi-Fi, SIM, or network',
  'Water damage',
  'Motherboard or electrical issue',
  'Other',
]);

export const createRepairRequestSchema = z.object({
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerPhone: z.string().regex(algerianPhoneRegex, 'Invalid Algerian phone number (e.g. 0550123456)'),
  customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  preferredCommunication: z.enum(['PHONE', 'SMS', 'WHATSAPP', 'EMAIL']).default('PHONE'),
  wilaya: z.string().default('Algiers'),
  address: z.string().optional(),

  // Device details
  brand: phoneBrandEnum,
  model: z.string().min(1, 'Device model is required'),
  color: z.string().optional(),
  imeiOrSerial: z.string().max(40).optional(),
  warrantyStatus: z.string().optional(),
  isPoweringOn: z.boolean().default(true),
  deviceCondition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).default('FAIR'),

  // Problem details
  mainIssueCategory: problemCategoryEnum,
  symptomDescription: z.string().min(10, 'Please describe the symptoms in detail (at least 10 characters)'),
  problemStarted: z.string().optional(),
  wasDropped: z.boolean().default(false),
  liquidExposure: z.boolean().default(false),
  previousRepairHistory: z.string().optional(),
  isIntermittent: z.boolean().default(false),

  // File keys (already uploaded to R2)
  attachmentKeys: z.array(z.string()).optional().default([]),
  turnstileToken: z.string().optional(),
});

export const createDiagnosisSchema = z.object({
  reportedSymptoms: z.string().min(3),
  inspectionFindings: z.string().min(5, 'Inspection findings required'),
  suspectedFault: z.string().min(3, 'Suspected fault required'),
  confirmedFault: z.string().min(3, 'Confirmed technical fault required'),
  repairabilityDecision: z.enum(['REPAIRABLE', 'UNREPAIRABLE', 'REPAIR_NOT_ECONOMICAL']),
  decisionExplanation: z.string().min(5, 'Detailed explanation is required'),
  recommendedSolution: z.string().min(3, 'Recommended solution required'),
  laborEstimate: z.number().int().nonnegative().default(0),
  partsEstimate: z.number().int().nonnegative().default(0),
  additionalCosts: z.number().int().nonnegative().default(0),
  estimatedRepairDurationHours: z.number().int().positive().default(24),
  estimatedCompletionDate: z.string().optional(),
});

export const quoteItemSchema = z.object({
  itemType: z.enum(['PART', 'LABOR', 'OTHER']),
  description: z.string().min(2),
  unitPriceDzd: z.number().int().nonnegative(),
  quantity: z.number().int().positive().default(1),
});

export const createQuoteSchema = z.object({
  items: z.array(quoteItemSchema).min(1, 'At least one itemized part or labor line is required'),
  technicianNotes: z.string().optional(),
  estimatedCompletionDate: z.string().optional(),
  expirationDays: z.number().int().positive().default(14),
});

export const approvalSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().optional(),
});

export const updateStatusSchema = z.object({
  toStatus: z.enum([
    'NEW',
    'UNDER_DIAGNOSIS',
    'REPAIRABLE',
    'UNREPAIRABLE',
    'REPAIR_NOT_ECONOMICAL',
    'WAITING_FOR_PARTS',
    'QUOTE_PENDING',
    'QUOTE_ACCEPTED',
    'QUOTE_REJECTED',
    'IN_REPAIR',
    'REPAIR_COMPLETED',
    'READY_FOR_PICKUP',
    'DELIVERED',
    'CANCELLED',
  ]),
  notes: z.string().optional(),
});
