import {
  correctTripToStation,
  createTrip,
  evaluateReminder,
  getWrongDirectionWarning,
  markReminderSent,
  wuhanMetroData,
  type ReminderEvent,
  type Route,
  type Trip
} from '../../services/coreAdapter';
import { loadLocalState } from '../../services/localStore';
import { triggerForegroundReminder } from '../../services/reminderAdapter';

let timer: number | undefined;
let activeTrip: Trip | undefined;
let activeRoute: Route | undefined;

function stationName(stationId?: string): string {
  if (!stationId) return '终点';
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
    currentStationName: '',
    nextStationName: '',
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
      wx.showToast({ title: '路线不存在', icon: 'none' });
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
    const state = loadLocalState();
    const reminder = evaluateReminder(activeTrip, state.reminderSettings, Date.now());
    if (reminder) {
      triggerForegroundReminder(reminder, state.reminderSettings);
      this.showReminder(reminder);
      activeTrip = markReminderSent(activeTrip, reminder.targetStationId, reminder.kind);
    }
    this.renderTrip();
  },
  renderTrip() {
    if (!activeTrip) return;
    const target = nextTarget(activeTrip);
    const stationCount = target ? stationCountUntil(activeTrip, target.stationId) : 0;
    this.setData({
      currentStationName: stationName(activeTrip.currentStationId),
      nextStationName: stationName(activeTrip.nextStationId),
      targetText: target ? `${stationCount}站后${target.kind === 'transfer' ? '换乘' : '下车'}：${stationName(target.stationId)}` : '本段行程已完成',
      warningText: getWrongDirectionWarning(activeTrip) ?? ''
    });
  },
  showReminder(reminder: ReminderEvent) {
    this.setData({
      reminderVisible: true,
      reminderTitle: reminder.kind === 'light' ? '快到目标站' : '准备下车',
      reminderBody: `${stationName(reminder.targetStationId)} ${reminder.kind === 'light' ? '下一站到达' : '即将到达'}`
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
