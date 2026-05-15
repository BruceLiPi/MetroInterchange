import { describe, expect, it } from 'vitest';
import {
  correctTripToStation,
  createTrip,
  evaluateReminder,
  getWrongDirectionWarning,
  markReminderSent,
  updateTimingProfile
} from '../src';
import type { ReminderSettings, Route, TimingProfile } from '../src';

const route: Route = {
  id: 'route-trip',
  name: '汪家墩到国博中心北',
  kind: 'fixed',
  segments: [
    {
      lineId: 'wuhan-line-8',
      fromStationId: 'wuhan-8-wangjiadun',
      toStationId: 'wuhan-4-yuejiazui',
      directionTerminalStationId: 'wuhan-8-junyuncun'
    },
    {
      lineId: 'wuhan-line-4',
      fromStationId: 'wuhan-4-yuejiazui',
      toStationId: 'wuhan-4-zhongjiacun',
      directionTerminalStationId: 'wuhan-4-huangjinkou'
    },
    {
      lineId: 'wuhan-line-6',
      fromStationId: 'wuhan-4-zhongjiacun',
      toStationId: 'wuhan-6-guobozhongxinbei',
      directionTerminalStationId: 'wuhan-6-dongfenggongsi'
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

describe('trip lifecycle', () => {
  it('creates a trip and corrects to the next station', () => {
    const trip = createTrip(route, 1000);
    const corrected = correctTripToStation(trip, 'wuhan-4-yuejiazui', 'next', 5000);

    expect(trip.currentStationId).toBe('wuhan-8-wangjiadun');
    expect(trip.nextStationId).toBe('wuhan-4-yuejiazui');
    expect(corrected.currentStationId).toBe('wuhan-4-yuejiazui');
    expect(corrected.nextStationId).toBe('wuhan-2-hongshanguangchang');
    expect(corrected.correctionEvents).toEqual([
      { at: 5000, stationId: 'wuhan-4-yuejiazui', source: 'next' }
    ]);
  });

  it('evaluates and marks reminders once', () => {
    const trip = createTrip(route, 1000);
    const event = evaluateReminder(trip, settings, 1000);

    expect(event).toEqual({ targetStationId: 'wuhan-4-yuejiazui', kind: 'light' });
    const updated = markReminderSent(trip, 'wuhan-4-yuejiazui', 'light');
    expect(updated.targets[0]!.reminderStage).toBe('light-sent');
  });

  it('warns after repeated previous corrections', () => {
    const trip = createTrip(route, 1000);
    const once = correctTripToStation(trip, 'wuhan-8-wangjiadun', 'previous', 2000);
    const twice = correctTripToStation(once, 'wuhan-8-wangjiadun', 'previous', 3000);

    expect(getWrongDirectionWarning(twice)).toBe('可能坐反或方向不一致，请确认下一站。');
  });

  it('smooths timing profile updates', () => {
    const profile: TimingProfile = {
      routeId: 'route-trip',
      segmentOverrides: { 'a->b': 120 },
      updatedAt: 1
    };

    expect(updateTimingProfile(profile, 'a', 'b', 180, 2).segmentOverrides['a->b']).toBe(132);
  });
});

