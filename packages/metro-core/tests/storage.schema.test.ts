import { describe, expect, it } from 'vitest';
import type { ReminderSettings, Route } from '../src';

describe('core public types', () => {
  it('supports typed routes and settings', () => {
    const route: Route = {
      id: 'route-work',
      name: '上班',
      kind: 'fixed',
      segments: [
        {
          lineId: 'line-2',
          fromStationId: 'a',
          toStationId: 'b',
          directionTerminalStationId: 'terminal'
        }
      ],
      createdAt: 1,
      updatedAt: 1
    };

    const settings: ReminderSettings = {
      strength: 'quiet',
      lightReminderStationsBefore: 1,
      strongReminderSecondsBefore: 45,
      vibrationEnabled: true,
      soundEnabled: false
    };

    expect(route.name).toBe('上班');
    expect(settings.strength).toBe('quiet');
  });
});

import { DEFAULT_REMINDER_SETTINGS, createEmptyLocalState } from '../src';

describe('local state defaults', () => {
  it('creates empty local state', () => {
    expect(createEmptyLocalState()).toEqual({
      schemaVersion: 1,
      routes: [],
      reminderSettings: DEFAULT_REMINDER_SETTINGS,
      timingProfiles: [],
      transferNotes: {}
    });
  });
});
