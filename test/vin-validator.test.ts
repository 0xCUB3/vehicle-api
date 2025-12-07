import { describe, test, expect } from 'bun:test';
import { validateVin, normalizeVin } from '../src/utils/vin-validator.js';

describe('VIN Validator', () => {
  describe('valid VINs', () => {
    test('accepts valid North American VIN with correct check digit', () => {
      const result = validateVin('1HGBH41JXMN109186');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('accepts valid European VIN (no check digit validation)', () => {
      const result = validateVin('WVWZZZ3CZWE123456');
      expect(result.valid).toBe(true);
    });

    test('is case-insensitive', () => {
      const result = validateVin('1hgbh41jxmn109186');
      expect(result.valid).toBe(true);
    });

    test('accepts another valid North American VIN', () => {
      // Using same valid VIN format pattern
      const result = validateVin('11111111111111111');
      expect(result.valid).toBe(true);
    });

    test('accepts VIN starting with non-NA prefix (Japan)', () => {
      // Japanese VINs start with J - no check digit validation
      const result = validateVin('JN1TBNT30Z0000001');
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid VINs', () => {
    test('rejects VIN with wrong length (16 chars)', () => {
      const result = validateVin('1HGBH41JXMN10918');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('VIN must be exactly 17 characters');
    });

    test('rejects VIN with wrong length (18 chars)', () => {
      const result = validateVin('1HGBH41JXMN1091861');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('VIN must be exactly 17 characters');
    });

    test('rejects VIN containing letter I', () => {
      const result = validateVin('1HGBH41IXMN109186');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('VIN cannot contain I, O, or Q');
    });

    test('rejects VIN containing letter O', () => {
      const result = validateVin('1HGBH41OXMN109186');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('VIN cannot contain I, O, or Q');
    });

    test('rejects VIN containing letter Q', () => {
      const result = validateVin('1HGBH41QXMN109186');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('VIN cannot contain I, O, or Q');
    });

    test('rejects North American VIN with invalid check digit', () => {
      const result = validateVin('1HGBH41J0MN109186');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid VIN check digit');
    });

    test('rejects empty VIN', () => {
      const result = validateVin('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('VIN is required');
    });

    test('rejects null VIN', () => {
      const result = validateVin(null as any);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('VIN is required');
    });

    test('rejects VIN with special characters', () => {
      const result = validateVin('1HGBH41J-MN109186');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('VIN contains invalid characters');
    });
  });

  describe('normalizeVin', () => {
    test('converts lowercase to uppercase', () => {
      expect(normalizeVin('1hgbh41jxmn109186')).toBe('1HGBH41JXMN109186');
    });

    test('keeps uppercase as is', () => {
      expect(normalizeVin('1HGBH41JXMN109186')).toBe('1HGBH41JXMN109186');
    });

    test('handles mixed case', () => {
      expect(normalizeVin('1HgBh41JxMn109186')).toBe('1HGBH41JXMN109186');
    });
  });
});
