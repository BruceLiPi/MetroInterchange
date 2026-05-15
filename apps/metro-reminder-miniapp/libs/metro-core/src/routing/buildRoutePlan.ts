import { wuhanMetroData } from '../data/wuhan';
import type { Route, TripStep, TripTarget } from '../types';

export interface RoutePlan {
  steps: TripStep[];
  targets: TripTarget[];
}

export function buildRoutePlan(route: Route): RoutePlan {
  const steps: TripStep[] = [];
  const targets: TripTarget[] = [];

  route.segments.forEach((segment, segmentIndex) => {
    const line = wuhanMetroData.lines.find((item) => item.id === segment.lineId);
    if (!line) {
      throw new Error(`Unknown line: ${segment.lineId}`);
    }

    const direction = line.directions.find((item) => item.terminalStationId === segment.directionTerminalStationId);
    if (!direction) {
      throw new Error(`Unknown direction: ${segment.directionTerminalStationId}`);
    }

    const fromIndex = direction.stationIds.indexOf(segment.fromStationId);
    const toIndex = direction.stationIds.indexOf(segment.toStationId);
    if (fromIndex < 0 || toIndex <= fromIndex) {
      throw new Error(`Station ${segment.toStationId} is not reachable on line ${segment.lineId}`);
    }

    for (let index = fromIndex; index < toIndex; index += 1) {
      steps.push({
        lineId: segment.lineId,
        fromStationId: direction.stationIds[index]!,
        toStationId: direction.stationIds[index + 1]!,
        estimatedSeconds: wuhanMetroData.defaultSegmentSeconds
      });
    }

    const nextSegment = route.segments[segmentIndex + 1];
    targets.push({
      stationId: segment.toStationId,
      kind: nextSegment ? 'transfer' : 'destination',
      lineId: segment.lineId,
      ...(nextSegment ? { transferToLineId: nextSegment.lineId } : {}),
      ...(nextSegment ? { transferDirectionTerminalStationId: nextSegment.directionTerminalStationId } : {}),
      ...(segment.transferNote ? { transferNote: segment.transferNote } : {}),
      reminderStage: 'not-reminded'
    });
  });

  return { steps, targets };
}
