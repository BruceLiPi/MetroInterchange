import { buildRoutePlan } from '../routing/buildRoutePlan';
import type { Route, Trip } from '../types';

export function createTrip(route: Route, startedAt: number): Trip {
  const plan = buildRoutePlan(route);
  const firstStep = plan.steps[0];
  if (!firstStep) {
    throw new Error(`Route ${route.id} does not contain travel steps`);
  }

  return {
    id: `trip-${startedAt}`,
    routeId: route.id,
    startedAt,
    currentStationId: firstStep.fromStationId,
    nextStationId: firstStep.toStationId,
    currentStepIndex: 0,
    steps: plan.steps,
    targets: plan.targets,
    correctionEvents: [],
    previousCorrectionCount: 0
  };
}
