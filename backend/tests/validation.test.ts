import { describe, it, expect } from 'vitest';
import {
  algerianPhoneRegex,
  normalizeAlgerianPhone,
  createRepairRequestSchema,
  createQuoteSchema,
} from '../src/utils/validation';

describe('Validation Schemas & Algerian Formatting', () => {
  it('validates Algerian mobile phone numbers correctly', () => {
    // Valid formats
    expect(algerianPhoneRegex.test('0550123456')).toBe(true);
    expect(algerianPhoneRegex.test('0661234567')).toBe(true);
    expect(algerianPhoneRegex.test('0770123456')).toBe(true);
    expect(algerianPhoneRegex.test('+213550123456')).toBe(true);
    expect(algerianPhoneRegex.test('+213661234567')).toBe(true);
    expect(algerianPhoneRegex.test('+213770123456')).toBe(true);

    // Invalid numbers
    expect(algerianPhoneRegex.test('12345678')).toBe(false);
    expect(algerianPhoneRegex.test('0123456789')).toBe(false); // 01 is not a mobile prefix
    expect(algerianPhoneRegex.test('+33612345678')).toBe(false); // French prefix
  });

  it('normalizes Algerian phone numbers to +213 format', () => {
    expect(normalizeAlgerianPhone('0550 12 34 56')).toBe('+213550123456');
    expect(normalizeAlgerianPhone('0661-23-45-67')).toBe('+213661234567');
    expect(normalizeAlgerianPhone('+213 770 12 34 56')).toBe('+213770123456');
  });

  it('validates complete repair request schema', () => {
    const validData = {
      customerName: 'Samir Brahimi',
      customerPhone: '0550123456',
      customerEmail: 'samir@algerie.dz',
      preferredCommunication: 'WHATSAPP' as const,
      wilaya: 'Algiers',
      brand: 'Samsung' as const,
      model: 'Galaxy S23 Ultra',
      mainIssueCategory: 'Broken screen' as const,
      symptomDescription: 'Cracked screen display with black bleed marks',
      isPoweringOn: true,
      wasDropped: true,
      deviceCondition: 'FAIR' as const,
    };

    const parsed = createRepairRequestSchema.safeParse(validData);
    expect(parsed.success).toBe(true);

    // Short symptom description fails
    const invalidData = { ...validData, symptomDescription: 'broken' };
    const invalidParsed = createRepairRequestSchema.safeParse(invalidData);
    expect(invalidParsed.success).toBe(false);
  });

  it('validates quote schema with itemized parts and integer DZD amounts', () => {
    const validQuote = {
      items: [
        {
          itemType: 'PART' as const,
          description: 'Original AMOLED Screen',
          unitPriceDzd: 14000,
          quantity: 1,
        },
        {
          itemType: 'LABOR' as const,
          description: 'Screen replacement & calibration',
          unitPriceDzd: 2500,
          quantity: 1,
        },
      ],
      technicianNotes: '3 months warranty included',
      expirationDays: 14,
    };

    const result = createQuoteSchema.safeParse(validQuote);
    expect(result.success).toBe(true);

    // Negative amounts rejected
    const negativeQuote = {
      ...validQuote,
      items: [{ ...validQuote.items[0], unitPriceDzd: -500 }],
    };
    expect(createQuoteSchema.safeParse(negativeQuote).success).toBe(false);
  });
});
