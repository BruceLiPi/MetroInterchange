import { describe, expect, it } from 'vitest';
import { validateMetroDataSet, wuhanMetroData } from '../src';

describe('wuhanMetroData', () => {
  it('uses the MVP data version and line ids', () => {
    expect(wuhanMetroData.version).toBe('wuhan-metro-core-2026-05');
    expect(wuhanMetroData.lines.map((line) => line.id)).toEqual([
      'wuhan-line-1',
      'wuhan-line-2',
      'wuhan-line-4',
      'wuhan-line-6',
      'wuhan-line-8'
    ]);
  });

  it('passes validation', () => {
    expect(validateMetroDataSet(wuhanMetroData)).toEqual([]);
  });
});
