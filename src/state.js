import { readJson, writeJson } from './fs.js';

const defaultState = {
  notifiedMessageIds: [],
  chatWatermarks: {},
  lastScanAt: null
};

export async function loadState(stateFile) {
  const state = await readJson(stateFile, defaultState);
  return {
    ...defaultState,
    ...state,
    notifiedMessageIds: Array.isArray(state.notifiedMessageIds) ? state.notifiedMessageIds : [],
    chatWatermarks: state.chatWatermarks && typeof state.chatWatermarks === 'object' ? state.chatWatermarks : {}
  };
}

export async function saveState(stateFile, state) {
  const trimmed = {
    ...state,
    notifiedMessageIds: [...new Set(state.notifiedMessageIds)].slice(-1000),
    lastScanAt: new Date().toISOString()
  };

  await writeJson(stateFile, trimmed);
  return trimmed;
}

export function hasNotified(state, messageId) {
  return state.notifiedMessageIds.includes(messageId);
}

export function markNotified(state, messageId) {
  if (!hasNotified(state, messageId)) {
    state.notifiedMessageIds.push(messageId);
  }
}
