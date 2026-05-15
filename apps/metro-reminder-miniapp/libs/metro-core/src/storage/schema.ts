import { DEFAULT_REMINDER_SETTINGS } from '../settings/defaults';
import type { ReminderSettings, Route, TimingProfile } from '../types';

export interface LocalState {
  schemaVersion: 1;
  routes: Route[];
  recentRouteId?: string;
  reminderSettings: ReminderSettings;
  timingProfiles: TimingProfile[];
  transferNotes: Record<string, string>;
}

export function createEmptyLocalState(): LocalState {
  return {
    schemaVersion: 1,
    routes: [],
    reminderSettings: DEFAULT_REMINDER_SETTINGS,
    timingProfiles: [],
    transferNotes: {}
  };
}
