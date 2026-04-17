import { SYNC_EVENTS } from '../syncEvents';

describe('SYNC_EVENTS Constants', () => {
  it('should have all required sync event types', () => {
    expect(SYNC_EVENTS.SYNC_TRIGGERED).toBe('SYNC_TRIGGERED');
    expect(SYNC_EVENTS.SYNC_STARTED).toBe('SYNC_STARTED');
    expect(SYNC_EVENTS.SYNC_COMPLETED).toBe('SYNC_COMPLETED');
    expect(SYNC_EVENTS.SYNC_FAILED).toBe('SYNC_FAILED');
    expect(SYNC_EVENTS.SYNC_PROGRESS).toBe('SYNC_PROGRESS');
    expect(SYNC_EVENTS.NETWORK_ONLINE).toBe('NETWORK_ONLINE');
    expect(SYNC_EVENTS.NETWORK_OFFLINE).toBe('NETWORK_OFFLINE');
  });

  it('should have unique event type values', () => {
    const values = Object.values(SYNC_EVENTS);
    const uniqueValues = new Set(values);
    expect(values.length).toBe(uniqueValues.size);
  });

  it('should be immutable', () => {
    expect(() => {
      (SYNC_EVENTS as any).NEW_EVENT = 'NEW_EVENT';
    }).toThrow();
  });
});
