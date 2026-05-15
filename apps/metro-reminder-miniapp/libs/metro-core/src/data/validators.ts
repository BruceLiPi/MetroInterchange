import type { MetroDataSet } from '../types';

export function validateMetroDataSet(data: MetroDataSet): string[] {
  const errors: string[] = [];
  const stationIds = new Set<string>();
  const lineIds = new Set<string>();

  for (const station of data.stations) {
    if (stationIds.has(station.id)) {
      errors.push(`Duplicate station id: ${station.id}`);
    }
    stationIds.add(station.id);
  }

  for (const line of data.lines) {
    if (lineIds.has(line.id)) {
      errors.push(`Duplicate line id: ${line.id}`);
    }
    lineIds.add(line.id);

    for (const direction of line.directions) {
      if (direction.stationIds.at(-1) !== direction.terminalStationId) {
        errors.push(`Line ${line.id} terminal mismatch: ${direction.terminalStationId}`);
      }

      for (const stationId of direction.stationIds) {
        if (!stationIds.has(stationId)) {
          errors.push(`Line ${line.id} references missing station: ${stationId}`);
        }
      }
    }
  }

  for (const segment of data.segmentTimes) {
    if (!stationIds.has(segment.fromStationId)) {
      errors.push(`Segment references missing from station: ${segment.fromStationId}`);
    }
    if (!stationIds.has(segment.toStationId)) {
      errors.push(`Segment references missing to station: ${segment.toStationId}`);
    }
    if (segment.seconds <= 0) {
      errors.push(`Segment time must be positive: ${segment.fromStationId}->${segment.toStationId}`);
    }
  }

  return errors;
}
