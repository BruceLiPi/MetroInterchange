import { clearLocalState, loadLocalState, saveLocalState } from '../../services/localStore';
import { wuhanMetroData, type ReminderSettings } from '../../services/coreAdapter';

const strengthOptions = ['安静', '明显', '防睡过'];
const strengthValues: ReminderSettings['strength'][] = ['quiet', 'obvious', 'anti-oversleep'];
const strongSecondsOptions = ['30', '45', '60'];

Page({
  data: {
    strengthOptions,
    strongSecondsOptions,
    strengthLabel: '安静',
    strongReminderSecondsBefore: 45,
    vibrationEnabled: true,
    soundEnabled: false,
    dataVersion: wuhanMetroData.version
  },
  onShow() {
    const settings = loadLocalState().reminderSettings;
    this.setData({
      strengthLabel: strengthOptions[strengthValues.indexOf(settings.strength)] ?? '安静',
      strongReminderSecondsBefore: settings.strongReminderSecondsBefore,
      vibrationEnabled: settings.vibrationEnabled,
      soundEnabled: settings.soundEnabled
    });
  },
  updateSettings(patch: Partial<ReminderSettings>) {
    const state = loadLocalState();
    saveLocalState({
      ...state,
      reminderSettings: { ...state.reminderSettings, ...patch }
    });
    this.onShow();
  },
  handleStrengthChange(event: WechatMiniprogram.PickerChange) {
    this.updateSettings({ strength: strengthValues[Number(event.detail.value)] ?? 'quiet' });
  },
  handleStrongSecondsChange(event: WechatMiniprogram.PickerChange) {
    this.updateSettings({ strongReminderSecondsBefore: Number(strongSecondsOptions[Number(event.detail.value)]) as 30 | 45 | 60 });
  },
  handleVibrationChange(event: WechatMiniprogram.SwitchChange) {
    this.updateSettings({ vibrationEnabled: event.detail.value });
  },
  handleSoundChange(event: WechatMiniprogram.SwitchChange) {
    this.updateSettings({ soundEnabled: event.detail.value });
  },
  handleClear() {
    clearLocalState();
    wx.showToast({ title: '已清除', icon: 'success' });
    this.onShow();
  }
});
