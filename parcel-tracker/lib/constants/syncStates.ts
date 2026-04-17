// ============================================================
//  lib/constants/syncStates.js  — ISSUE #2 placeholder
//  Sync state constants — used by #3 Sync Queue, #2 UI badges
// ============================================================

export const SYNC_PENDING  = 'PENDING';
export const SYNC_SYNCED   = 'SYNCED';
export const SYNC_FAILED   = 'FAILED';
export const SYNC_RETRYING = 'RETRYING';

/** All valid sync states */
export const SYNC_STATES = [SYNC_PENDING, SYNC_SYNCED, SYNC_FAILED, SYNC_RETRYING];

/**
 * Badge color map — use in Issue #2 UI status indicators
 * @type {Record<string, string>}
 */
export const SYNC_STATE_COLORS = {
  PENDING:  'var(--yellow)',
  SYNCED:   'var(--green)',
  FAILED:   'var(--red)',
  RETRYING: 'var(--blue)',
};
