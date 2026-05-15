import type { ReminderSettings, StationId, Trip } from '../types';

export interface ReminderEvent {
  targetStationId: StationId;
  kind: 'light' | 'strong';
}

export function evaluateReminder(trip: Trip, settings: ReminderSettings, now: number): ReminderEvent | undefined {
  const target = trip.targets.find((item) => item.reminderStage !== 'strong-sent');
  if (!target) {
    return undefined;
  }

  const remainingSteps = trip.steps.slice(trip.currentStepIndex);
  const targetStepIndex = remainingSteps.findIndex((step) => step.toStationId === target.stationId);
  if (targetStepIndex === -1) {
    return undefined;
  }

  const elapsedSeconds = Math.max(0, Math.floor((now - trip.startedAt) / 1000));
  const elapsedBeforeCurrentStep = trip.steps
    .slice(0, trip.currentStepIndex)
    .reduce((sum, step) => sum + step.estimatedSeconds, 0);
  const currentStepElapsed = Math.max(0, elapsedSeconds - elapsedBeforeCurrentStep);
  const secondsUntilTarget = remainingSteps
    .slice(0, targetStepIndex + 1)
    .reduce((sum, step) => sum + step.estimatedSeconds, 0) - currentStepElapsed;

  if (secondsUntilTarget <= settings.strongReminderSecondsBefore) {
    return { targetStationId: target.stationId, kind: 'strong' };
  }

  if (targetStepIndex + 1 <= settings.lightReminderStationsBefore && target.reminderStage === 'not-reminded') {
    return { targetStationId: target.stationId, kind: 'light' };
  }

  return undefined;
}

export function markReminderSent(trip: Trip, targetStationId: StationId, kind: ReminderEvent['kind']): Trip {
  return {
    ...trip,
    targets: trip.targets.map((target) => {
      if (target.stationId !== targetStationId) {
        return target;
      }

      return {
        ...target,
        reminderStage: kind === 'light' ? 'light-sent' : 'strong-sent'
      };
    })
  };
}
