const STORAGE_KEY = 'metro-reminder-local-state-v1';

export interface MiniappRouteSegment {
  lineId: string;
  fromStationId: string;
  toStationId: string;
  directionTerminalStationId: string;
  transferNote?: string;
}

export interface MiniappRoute {
  id: string;
  name: string;
  kind: 'fixed' | 'temporary';
  segments: MiniappRouteSegment[];
  createdAt: number;
  updatedAt: number;
}

export interface MiniappLocalState {
  schemaVersion: 1;
  routes: MiniappRoute[];
  recentRouteId?: string;
  reminderSettings: {
    strength: 'quiet' | 'obvious' | 'anti-oversleep';
    lightReminderStationsBefore: 1 | 2;
    strongReminderSecondsBefore: 30 | 45 | 60;
    vibrationEnabled: boolean;
    soundEnabled: boolean;
  };
  timingProfiles: Array<{ routeId: string; segmentOverrides: Record<string, number>; updatedAt: number }>;
  transferNotes: Record<string, string>;
}

function createEmptyMiniappLocalState(): MiniappLocalState {
  return {
    schemaVersion: 1,
    routes: [],
    recentRouteId: undefined,
    reminderSettings: {
      strength: 'quiet',
      lightReminderStationsBefore: 1,
      strongReminderSecondsBefore: 45,
      vibrationEnabled: true,
      soundEnabled: false
    },
    timingProfiles: [],
    transferNotes: {}
  };
}

export function loadLocalState(): MiniappLocalState {
  const stored = wx.getStorageSync(STORAGE_KEY) as MiniappLocalState | '';
  if (!stored) {
    const empty = createEmptyMiniappLocalState();
    saveLocalState(empty);
    return empty;
  }

  return stored;
}

export function saveLocalState(state: MiniappLocalState): void {
  wx.setStorageSync(STORAGE_KEY, state);
}

export function clearLocalState(): MiniappLocalState {
  const empty = createEmptyMiniappLocalState();
  saveLocalState(empty);
  return empty;
}
