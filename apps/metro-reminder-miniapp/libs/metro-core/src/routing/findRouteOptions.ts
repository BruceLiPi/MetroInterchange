import { wuhanMetroData } from '../data/wuhan';
import type { LineId, RouteSegment, StationId } from '../types';

export interface RouteOptionRequest {
  startLineId: LineId;
  startStationId: StationId;
  endLineId: LineId;
  endStationId: StationId;
}

export interface RouteOption {
  id: string;
  kind: 'direct' | 'one-transfer' | 'two-transfer';
  transferStationId?: StationId;
  transferStationIds?: StationId[];
  segments: RouteSegment[];
}

function stationCount(segment: RouteSegment): number {
  const line = wuhanMetroData.lines.find((item) => item.id === segment.lineId);
  const direction = line?.directions.find((item) => item.terminalStationId === segment.directionTerminalStationId);
  if (!direction) return Number.MAX_SAFE_INTEGER;

  return direction.stationIds.indexOf(segment.toStationId) - direction.stationIds.indexOf(segment.fromStationId);
}

function optionStationCount(option: RouteOption): number {
  return option.segments.reduce((total, segment) => total + stationCount(segment), 0);
}

function reachableSegment(lineId: LineId, fromStationId: StationId, toStationId: StationId): RouteSegment | undefined {
  const line = wuhanMetroData.lines.find((item) => item.id === lineId);
  if (!line) return undefined;

  const direction = line.directions.find((item) => {
    const fromIndex = item.stationIds.indexOf(fromStationId);
    const toIndex = item.stationIds.indexOf(toStationId);
    return fromIndex >= 0 && toIndex > fromIndex;
  });

  if (!direction) return undefined;

  return {
    lineId,
    fromStationId,
    toStationId,
    directionTerminalStationId: direction.terminalStationId
  };
}

export function findRouteOptions(request: RouteOptionRequest): RouteOption[] {
  const directSegment = reachableSegment(request.startLineId, request.startStationId, request.endStationId);
  if (request.startLineId === request.endLineId && directSegment) {
    return [{ id: 'direct', kind: 'direct', segments: [directSegment] }];
  }

  const oneTransferStations = wuhanMetroData.stations.filter(
    (station) => station.lineIds.includes(request.startLineId) && station.lineIds.includes(request.endLineId)
  );

  const oneTransferOptions = oneTransferStations.flatMap((station) => {
    const firstSegment = reachableSegment(request.startLineId, request.startStationId, station.id);
    const secondSegment = reachableSegment(request.endLineId, station.id, request.endStationId);
    if (!firstSegment || !secondSegment) return [];

    return [
      {
        id: `transfer-${station.id}`,
        kind: 'one-transfer' as const,
        transferStationId: station.id,
        transferStationIds: [station.id],
        segments: [firstSegment, secondSegment]
      }
    ];
  });

  if (oneTransferOptions.length > 0) {
    return oneTransferOptions.sort((left, right) => optionStationCount(left) - optionStationCount(right));
  }

  const twoTransferOptions = wuhanMetroData.lines
    .filter((line) => line.id !== request.startLineId && line.id !== request.endLineId)
    .flatMap((middleLine) => {
      const firstTransferStations = wuhanMetroData.stations.filter(
        (station) => station.lineIds.includes(request.startLineId) && station.lineIds.includes(middleLine.id)
      );
      const secondTransferStations = wuhanMetroData.stations.filter(
        (station) => station.lineIds.includes(middleLine.id) && station.lineIds.includes(request.endLineId)
      );

      return firstTransferStations.flatMap((firstStation) =>
        secondTransferStations.flatMap((secondStation) => {
          if (firstStation.id === secondStation.id) return [];

          const firstSegment = reachableSegment(request.startLineId, request.startStationId, firstStation.id);
          const middleSegment = reachableSegment(middleLine.id, firstStation.id, secondStation.id);
          const finalSegment = reachableSegment(request.endLineId, secondStation.id, request.endStationId);
          if (!firstSegment || !middleSegment || !finalSegment) return [];

          return [
            {
              id: `transfer-${firstStation.id}-${secondStation.id}`,
              kind: 'two-transfer' as const,
              transferStationId: firstStation.id,
              transferStationIds: [firstStation.id, secondStation.id],
              segments: [firstSegment, middleSegment, finalSegment]
            }
          ];
        })
      );
    });

  return [...oneTransferOptions, ...twoTransferOptions].sort((left, right) => optionStationCount(left) - optionStationCount(right));
}
