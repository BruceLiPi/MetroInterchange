import type { Trip } from '../types';

export function advanceTrip(trip: Trip, now: number): Trip {
  let elapsedSeconds = Math.max(0, Math.floor((now - trip.startedAt) / 1000));
  let currentStepIndex = 0;
  let currentStationId = trip.currentStationId;

  for (let index = 0; index < trip.steps.length; index += 1) {
    const step = trip.steps[index]!;
    if (elapsedSeconds < step.estimatedSeconds) {
      currentStepIndex = index;
      currentStationId = step.fromStationId;
      break;
    }

    elapsedSeconds -= step.estimatedSeconds;
    currentStepIndex = index + 1;
    currentStationId = step.toStationId;
  }

  const nextStationId = trip.steps[currentStepIndex]?.toStationId;

  return {
    ...trip,
    currentStepIndex,
    currentStationId,
    ...(nextStationId ? { nextStationId } : {})
  };
}
