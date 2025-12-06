/**
 * VIN Validation following ISO 3779
 * - 17 characters
 * - No I, O, Q (to avoid confusion with 1, 0)
 * - North American VINs have check digit at position 9
 */

const TRANSLITERATIONS: Record<string, number> = {
  A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8,
  J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9,
  S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9,
};

const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

function getCharValue(char: string): number {
  if (/\d/.test(char)) return parseInt(char, 10);
  return TRANSLITERATIONS[char] ?? 0;
}

function calculateCheckDigit(vin: string): string {
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += getCharValue(vin[i]) * WEIGHTS[i];
  }
  const remainder = sum % 11;
  return remainder === 10 ? 'X' : remainder.toString();
}

export function validateVin(vin: string): { valid: boolean; error?: string } {
  if (!vin || typeof vin !== 'string') {
    return { valid: false, error: 'VIN is required' };
  }

  const normalizedVin = vin.toUpperCase();

  if (normalizedVin.length !== 17) {
    return { valid: false, error: 'VIN must be exactly 17 characters' };
  }

  if (/[IOQ]/.test(normalizedVin)) {
    return { valid: false, error: 'VIN cannot contain I, O, or Q' };
  }

  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(normalizedVin)) {
    return { valid: false, error: 'VIN contains invalid characters' };
  }

  // North American VINs (starting with 1, 4, 5) require check digit validation
  const firstChar = normalizedVin[0];
  if (['1', '4', '5'].includes(firstChar)) {
    const expectedCheckDigit = calculateCheckDigit(normalizedVin);
    const actualCheckDigit = normalizedVin[8];
    if (expectedCheckDigit !== actualCheckDigit) {
      return { valid: false, error: 'Invalid VIN check digit' };
    }
  }

  return { valid: true };
}

export function normalizeVin(vin: string): string {
  return vin.toUpperCase();
}
