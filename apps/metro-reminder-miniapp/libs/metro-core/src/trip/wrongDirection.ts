import type { Trip } from '../types';

export function getWrongDirectionWarning(trip: Trip): string | undefined {
  return trip.previousCorrectionCount >= 2 ? '可能坐反或方向不一致，请确认下一站。' : undefined;
}
