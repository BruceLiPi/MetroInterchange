import type { StationId, TimingProfile } from '../types';

function segmentKey(fromStationId: StationId, toStationId: StationId): string {
  return `${fromStationId}->${toStationId}`;
}

export function updateTimingProfile(
  profile: TimingProfile,
  fromStationId: StationId,
  toStationId: StationId,
  observedSeconds: number,
  updatedAt: number
): TimingProfile {
  const key = segmentKey(fromStationId, toStationId);
  const previousSeconds = profile.segmentOverrides[key] ?? observedSeconds;

  return {
    ...profile,
    segmentOverrides: {
      ...profile.segmentOverrides,
      [key]: Math.round(previousSeconds * 0.8 + observedSeconds * 0.2)
    },
    updatedAt
  };
}
