import type { ReminderSettings } from '../types';

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  strength: 'quiet',
  lightReminderStationsBefore: 1,
  strongReminderSecondsBefore: 45,
  vibrationEnabled: true,
  soundEnabled: false
};
