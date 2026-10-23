import { z } from 'zod';
import { BRANDS, PROBLEM_CATEGORIES } from '../i18n';

export const algerianPhoneRegex = /^(?:(?:\+|00)213|0)[567]\d{8}$/;

export const repairFormSchema = z.object({
  customerName: z.string().min(2, 'Le nom doit comporter au moins 2 caractères'),
  customerPhone: z.string().regex(algerianPhoneRegex, 'Numéro algérien invalide (ex: 0550123456 ou +213550123456)'),
  customerEmail: z.string().email('Adresse email invalide').optional().or(z.literal('')),
  preferredCommunication: z.enum(['PHONE', 'SMS', 'WHATSAPP', 'EMAIL']).default('PHONE'),
  wilaya: z.string().default('16 - Alger (Algiers)'),
  address: z.string().optional(),

  // Device
  brand: z.string().min(1, 'Veuillez sélectionner la marque'),
  model: z.string().min(2, 'Veuillez préciser le modèle exact (ex: Galaxy S23 Ultra, iPhone 14 Pro)'),
  color: z.string().optional(),
  imeiOrSerial: z.string().optional(),
  warrantyStatus: z.string().optional(),
  isPoweringOn: z.boolean().default(true),
  deviceCondition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).default('FAIR'),

  // Problem
  mainIssueCategory: z.string().min(1, 'Veuillez choisir la catégorie de panne'),
  symptomDescription: z.string().min(10, 'Veuillez décrire le problème avec au moins 10 caractères'),
  problemStarted: z.string().optional(),
  wasDropped: z.boolean().default(false),
  liquidExposure: z.boolean().default(false),
  previousRepairHistory: z.string().optional(),
  isIntermittent: z.boolean().default(false),

  attachmentKeys: z.array(z.string()).default([]),
});

export type RepairFormData = z.infer<typeof repairFormSchema>;
