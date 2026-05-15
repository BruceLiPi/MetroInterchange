import type { Trip } from '../types';

export function advanceTrip(trip: Trip, now: number): Trip {
  let elapsedSeconds = Math.max(0, Math.floor((now - trip.startedAt) / 1000));
  let currentStepIndex = trip.currentStepIndex;
  let currentStationId = trip.currentStationId;
  let stepStartedAt = trip.startedAt;

  for (let index = trip.currentStepIndex; index < trip.steps.length; index += 1) {
    const step = trip.steps[index]!;
    if (elapsedSeconds < step.estimatedSeconds) {
      currentStepIndex = index;
      currentStationId = step.fromStationId;
      break;
    }

    elapsedSeconds -= step.estimatedSeconds;
    stepStartedAt += step.estimatedSeconds * 1000;
    currentStepIndex = index + 1;
    currentStationId = step.toStationId;
  }

  const nextStationId = trip.steps[currentStepIndex]?.toStationId;

  return {
    ...trip,
    startedAt: stepStartedAt,
    currentStepIndex,
    currentStationId,
    ...(nextStationId ? { nextStationId } : {})
  };
}
