import type { CorrectionEvent, StationId, Trip } from '../types';

export function correctTripToStation(trip: Trip, stationId: StationId, source: CorrectionEvent['source'], at: number): Trip {
  const matchingStepIndex = trip.steps.findIndex((step) => step.toStationId === stationId);
  const currentStepIndex = matchingStepIndex === -1 ? trip.currentStepIndex : matchingStepIndex + 1;
  const nextStationId = trip.steps[currentStepIndex]?.toStationId;

  return {
    ...trip,
    startedAt: at,
    currentStationId: stationId,
    ...(nextStationId ? { nextStationId } : {}),
    currentStepIndex,
    previousCorrectionCount: source === 'previous' ? trip.previousCorrectionCount + 1 : 0,
    correctionEvents: [
      ...trip.correctionEvents,
      { at, stationId, source }
    ]
  };
}
