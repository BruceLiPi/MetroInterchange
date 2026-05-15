import {
  advanceTrip,
  correctTripToStation,
  createTrip,
  evaluateReminder,
  getWrongDirectionWarning,
  markReminderSent,
  wuhanMetroData,
  type ReminderEvent,
  type Route,
  type Trip
} from '../../../services/coreAdapter';
import { loadLocalState } from '../../../services/localStore';
import { triggerForegroundReminder } from '../../../services/reminderAdapter';

let timer: number | undefined;
let activeTrip: Trip | undefined;
let activeRoute: Route | undefined;

function stationName(stationId?: string): string {
  if (!stationId) return '\u7EC8\u70B9';
  return wuhanMetroData.stations.find((station) => station.id === stationId)?.name ?? stationId;
}

function nextTarget(trip: Trip) {
  const remainingStationIds = new Set(trip.steps.slice(trip.currentStepIndex).map((step) => step.toStationId));
  return trip.targets.find((target) => remainingStationIds.has(target.stationId));
}

function stationCountUntil(trip: Trip, stationId: string): number {
  const index = trip.steps.slice(trip.currentStepIndex).findIndex((step) => step.toStationId === stationId);
  return index === -1 ? 0 : index + 1;
}

Page({
  data: {
    labels: {
      currentStation: '\u5F53\u524D\u7AD9',
      nextStation: '\u4E0B\u4E00\u7AD9',
      previousStation: '\u4E0A\u4E00\u7AD9',
      nextStationButton: '\u4E0B\u4E00\u7AD9',
      endTrip: '\u7ED3\u675F\u884C\u7A0B'
    },
    currentStationName: '',
    nextStationName: '',
    nextStationText: '',
    targetText: '',
    warningText: '',
    reminderVisible: false,
    reminderTitle: '',
    reminderBody: ''
  },
  onLoad(query) {
    const state = loadLocalState();
    activeRoute = state.routes.find((item) => item.id === query.routeId);
    if (!activeRoute) {
      wx.showToast({ title: '\u8DEF\u7EBF\u4E0D\u5B58\u5728', icon: 'none' });
      wx.navigateBack();
      return;
    }

    activeTrip = createTrip(activeRoute, Date.now());
    this.renderTrip();
    timer = setInterval(() => this.tick(), 1000) as unknown as number;
  },
  onUnload() {
    if (timer) {
      clearInterval(timer);
      timer = undefined;
    }
  },
  tick() {
    if (!activeTrip) return;
    const now = Date.now();
    const state = loadLocalState();
    const reminder = evaluateReminder(activeTrip, state.reminderSettings, now);
    if (reminder) {
      triggerForegroundReminder(reminder, state.reminderSettings);
      this.showReminder(reminder);
      activeTrip = markReminderSent(activeTrip, reminder.targetStationId, reminder.kind);
    }
    activeTrip = advanceTrip(activeTrip, now);
    this.renderTrip();
  },
  renderTrip() {
    if (!activeTrip) return;
    const target = nextTarget(activeTrip);
    const stationCount = target ? stationCountUntil(activeTrip, target.stationId) : 0;
    this.setData({
      currentStationName: stationName(activeTrip.currentStationId),
      nextStationName: stationName(activeTrip.nextStationId),
      nextStationText: `${this.data.labels.nextStation}: ${stationName(activeTrip.nextStationId)}`,
      targetText: target ? `${stationCount}\u7AD9\u540E${target.kind === 'transfer' ? '\u6362\u4E58' : '\u4E0B\u8F66'}\uFF1A${stationName(target.stationId)}` : '\u672C\u6BB5\u884C\u7A0B\u5DF2\u5B8C\u6210',
      warningText: getWrongDirectionWarning(activeTrip) ?? ''
    });
  },
  showReminder(reminder: ReminderEvent) {
    this.setData({
      reminderVisible: true,
      reminderTitle: reminder.kind === 'light' ? '\u5FEB\u5230\u76EE\u6807\u7AD9' : '\u51C6\u5907\u4E0B\u8F66',
      reminderBody: `${stationName(reminder.targetStationId)} ${reminder.kind === 'light' ? '\u4E0B\u4E00\u7AD9\u5230\u8FBE' : '\u5373\u5C06\u5230\u8FBE'}`
    });
  },
  handleReminderConfirm() {
    this.setData({ reminderVisible: false });
  },
  handlePrevious() {
    if (!activeTrip || activeTrip.currentStepIndex === 0) return;
    const previousStep = activeTrip.steps[activeTrip.currentStepIndex - 1]!;
    activeTrip = correctTripToStation(activeTrip, previousStep.fromStationId, 'previous', Date.now());
    this.renderTrip();
  },
  handleNext() {
    if (!activeTrip?.nextStationId) return;
    activeTrip = correctTripToStation(activeTrip, activeTrip.nextStationId, 'next', Date.now());
    this.renderTrip();
  },
  handleEndTrip() {
    wx.navigateBack({ delta: 2 });
  }
});
