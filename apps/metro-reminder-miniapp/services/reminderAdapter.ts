import type { ReminderEvent, ReminderSettings } from './coreAdapter';

export function triggerForegroundReminder(event: ReminderEvent, settings: ReminderSettings): void {
  if (settings.vibrationEnabled) {
    wx.vibrateShort({ type: event.kind === 'strong' ? 'heavy' : 'medium' });
  }

  if (settings.soundEnabled && event.kind === 'strong') {
    wx.showToast({ title: '准备下车', icon: 'none' });
  }
}
