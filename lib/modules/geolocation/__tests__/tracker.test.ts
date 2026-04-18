import { GeolocationTracker } from '../tracker'
import { eventBus } from '@/lib/events/eventBus'
import { syncManager } from '@/lib/modules/sync'

describe('GeolocationTracker', () => {
  let tracker: GeolocationTracker
  const originalGeolocation = global.navigator.geolocation

  beforeEach(() => {
    tracker = new GeolocationTracker({ agentId: 'agent-1' })

    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        watchPosition: jest.fn().mockImplementation((success) => {
          const position = {
            coords: {
              latitude: 12.9716,
              longitude: 77.5946,
              accuracy: 5
            }
          }
          success(position as GeolocationPosition)
          return 42
        }),
        clearWatch: jest.fn()
      },
      configurable: true
    })

    Object.defineProperty(global.navigator, 'onLine', {
      value: true,
      configurable: true
    })

    jest.spyOn(eventBus, 'emit').mockImplementation(() => undefined)
    jest.spyOn(syncManager, 'queue').mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Object.defineProperty(global.navigator, 'geolocation', {
      value: originalGeolocation,
      configurable: true
    })
  })

  it('starts tracking and registers the geolocation watcher', () => {
    const result = tracker.start()
    expect(result).toBe(true)
    expect(global.navigator.geolocation.watchPosition).toHaveBeenCalled()
  })

  it('emits location events and queues them when a new position is found', async () => {
    tracker.start()
    expect(eventBus.emit).toHaveBeenCalled()
    expect(syncManager.queue).toHaveBeenCalled()
  })

  it('stops tracking and clears the watcher', () => {
    tracker.start()
    tracker.stop()
    expect(global.navigator.geolocation.clearWatch).toHaveBeenCalledWith(42)
  })
})
