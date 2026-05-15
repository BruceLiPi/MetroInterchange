import { createEmptyLocalState, type LocalState } from './coreAdapter';

const STORAGE_KEY = 'metro-reminder-local-state-v1';

export function loadLocalState(): LocalState {
  const stored = wx.getStorageSync(STORAGE_KEY) as LocalState | '';
  if (!stored) {
    const empty = createEmptyLocalState();
    saveLocalState(empty);
    return empty;
  }

  return stored;
}

export function saveLocalState(state: LocalState): void {
  wx.setStorageSync(STORAGE_KEY, state);
}

export function clearLocalState(): LocalState {
  const empty = createEmptyLocalState();
  saveLocalState(empty);
  return empty;
}
