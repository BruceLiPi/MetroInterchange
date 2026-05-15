export type LineId = string;
export type StationId = string;
export type RouteId = string;

export interface Station {
  id: StationId;
  name: string;
  lineIds: LineId[];
}

export interface LineDirection {
  terminalStationId: StationId;
  stationIds: StationId[];
}

export interface MetroLine {
  id: LineId;
  name: string;
  color: string;
  directions: [LineDirection, LineDirection];
}

export interface SegmentTime {
  fromStationId: StationId;
  toStationId: StationId;
  seconds: number;
}

export interface MetroDataSet {
  version: string;
  city: 'wuhan';
  lines: MetroLine[];
  stations: Station[];
  segmentTimes: SegmentTime[];
  defaultSegmentSeconds: number;
  defaultTransferSeconds: number;
}

export interface RouteSegment {
  lineId: LineId;
  fromStationId: StationId;
  toStationId: StationId;
  directionTerminalStationId: StationId;
  transferNote?: string;
}

export interface Route {
  id: RouteId;
  name: string;
  kind: 'fixed' | 'temporary';
  segments: RouteSegment[];
  createdAt: number;
  updatedAt: number;
}

export type ReminderStrength = 'quiet' | 'obvious' | 'anti-oversleep';

export interface ReminderSettings {
  strength: ReminderStrength;
  lightReminderStationsBefore: 1 | 2;
  strongReminderSecondsBefore: 30 | 45 | 60;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
}

export type ReminderStage = 'not-reminded' | 'light-sent' | 'strong-sent';

export interface TripTarget {
  stationId: StationId;
  kind: 'transfer' | 'destination';
  lineId: LineId;
  transferToLineId?: LineId;
  transferDirectionTerminalStationId?: StationId;
  transferNote?: string;
  reminderStage: ReminderStage;
}

export interface TripStep {
  lineId: LineId;
  fromStationId: StationId;
  toStationId: StationId;
  estimatedSeconds: number;
}

export interface CorrectionEvent {
  at: number;
  stationId: StationId;
  source: 'previous' | 'next' | 'select';
}

export interface Trip {
  id: string;
  routeId: RouteId;
  startedAt: number;
  currentStationId: StationId;
  nextStationId?: StationId;
  currentStepIndex: number;
  steps: TripStep[];
  targets: TripTarget[];
  correctionEvents: CorrectionEvent[];
  previousCorrectionCount: number;
}

export interface TimingProfile {
  routeId: RouteId;
  segmentOverrides: Record<string, number>;
  updatedAt: number;
}
