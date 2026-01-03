
/**
 * Test cases for parseMovesString function
 *
 * This function should handle various input formats:
 * 1. Normal format: "1.e4 e5 2.Nf3 Nc6"
 * 2. Missing spaces: "1.e4e5 2.Nf3Nc6"
 * 3. Extra spaces: "1. e4  e5   2. Nf3 Nc6"
 * 4. No move numbers: "e4 e5 Nf3 Nc6"
 */
import { parseMovesString } from '../chessUtils';
import { describe, it, expect } from 'vitest';

describe('parseMovesString', () => {
  it('should parse normal format', () => {
    const input = "1.e4 e5 2.Bc4 Bc5 3.Nf3 d6 4.c3 Qe7 5.d4";
    const result = parseMovesString(input);
    expect(result).toEqual(['e4', 'e5', 'Bc4', 'Bc5', 'Nf3', 'd6', 'c3', 'Qe7', 'd4']);
  });

  it('should parse format without spaces after move numbers', () => {
    const input = "1.e4e5 2.Bc4Bc5 3.Nf3d6";
    const result = parseMovesString(input);
    expect(result).toEqual(['e4e5', 'Bc4Bc5', 'Nf3d6']);
  });

  it('should handle extra spaces', () => {
    const input = "1. e4  e5   2. Nf3 Nc6";
    const result = parseMovesString(input);
    expect(result).toEqual(['e4', 'e5', 'Nf3', 'Nc6']);
  });

  it('should handle moves without numbers', () => {
    const input = "e4 e5 Nf3 Nc6";
    const result = parseMovesString(input);
    expect(result).toEqual(['e4', 'e5', 'Nf3', 'Nc6']);
  });

  it('should filter out standalone move numbers', () => {
    const input = "1. e4 e5 2. Nf3";
    const result = parseMovesString(input);
    expect(result).toEqual(['e4', 'e5', 'Nf3']);
  });

  it('should handle empty string', () => {
    const result = parseMovesString("");
    expect(result).toEqual([]);
  });
});
