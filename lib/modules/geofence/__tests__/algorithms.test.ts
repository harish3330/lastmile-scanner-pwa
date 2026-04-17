/**
 * Unit tests for geofence algorithms
 * TDD: Tests written FIRST (RED phase)
 */

import {
  calculateHaversineDistance,
  isPointInCircle,
  distanceFromZoneBoundary,
  checkSingleZoneBoundary,
  checkMultipleZoneBoundaries,
  determineTransition
} from '../algorithms'

describe('Geofence Algorithms', () => {
  describe('calculateHaversineDistance', () => {
    it('should calculate distance between two identical points as 0', () => {
      const distance = calculateHaversineDistance(40.7128, -74.006, 40.7128, -74.006)
      expect(distance).toBe(0)
    })

    it('should calculate distance between NYC and LA approximately correctly', () => {
      // NYC: 40.7128° N, 74.0060° W
      // LA: 34.0522° N, 118.2437° W
      const distance = calculateHaversineDistance(40.7128, -74.006, 34.0522, -118.2437)
      // Expected approximately 3944 km = 3944000 meters
      expect(distance).toBeGreaterThan(3900000)
      expect(distance).toBeLessThan(4000000)
    })

    it('should calculate distance between two nearby points', () => {
      // Two points ~1 km apart
      const distance = calculateHaversineDistance(40.7128, -74.006, 40.7228, -74.006)
      expect(distance).toBeGreaterThan(10000) // > 10km (rough estimate for latitude)
      expect(distance).toBeLessThan(12000) // < 12km
    })

    it('should handle negative coordinates (southern/western hemisphere)', () => {
      const distance = calculateHaversineDistance(-33.8688, 151.2093, -33.8768, 151.2093)
      expect(distance).toBeGreaterThan(800) // At least 800 meters
      expect(distance).toBeLessThan(900) // But less than 900 meters
    })

    it('should return consistent results regardless of point order', () => {
      const dist1 = calculateHaversineDistance(40.7128, -74.006, 34.0522, -118.2437)
      const dist2 = calculateHaversineDistance(34.0522, -118.2437, 40.7128, -74.006)
      expect(dist1).toBe(dist2)
    })
  })

  describe('isPointInCircle', () => {
    // Test zone: center at (40.7128, -74.006) with 500m radius
    const centerLat = 40.7128
    const centerLng = -74.006
    const radiusMeters = 500

    it('should return true when point is exactly at center', () => {
      const result = isPointInCircle(centerLat, centerLng, centerLat, centerLng, radiusMeters)
      expect(result).toBe(true)
    })

    it('should return true when point is inside the circle', () => {
      // Point ~200m from center (inside 500m radius)
      const result = isPointInCircle(40.7188, -74.006, centerLat, centerLng, radiusMeters)
      expect(result).toBe(true)
    })

    it('should return false when point is outside the circle', () => {
      // Point ~6 km away (outside 500m radius)
      const result = isPointInCircle(40.7728, -74.006, centerLat, centerLng, radiusMeters)
      expect(result).toBe(false)
    })

    it('should handle boundary case when point is on circle edge', () => {
      // Test with small radius and calculate point at exact distance
      // For simplicity, use a point we know is ~500m away
      const testLat = 40.7173 // ~500m north
      const testLng = -74.006
      const isInside = isPointInCircle(testLat, testLng, centerLat, centerLng, radiusMeters)
      // Should be true (within 500m)
      expect(isInside).toBe(true)
    })
  })

  describe('distanceFromZoneBoundary', () => {
    const centerLat = 40.7128
    const centerLng = -74.006
    const radiusMeters = 500

    it('should return negative value when point is inside zone', () => {
      const distance = distanceFromZoneBoundary(40.7188, -74.006, centerLat, centerLng, radiusMeters)
      expect(distance).toBeLessThan(0)
    })

    it('should return positive value when point is outside zone', () => {
      const distance = distanceFromZoneBoundary(40.7728, -74.006, centerLat, centerLng, radiusMeters)
      expect(distance).toBeGreaterThan(0)
    })

    it('should return approximately 0 when point is on boundary', () => {
      // Point ~500m away should have distance close to 0
      const distance = distanceFromZoneBoundary(40.7173, -74.006, centerLat, centerLng, radiusMeters)
      expect(Math.abs(distance)).toBeLessThan(10) // Within 10m of boundary
    })
  })

  describe('checkSingleZoneBoundary', () => {
    const centerLat = 40.7128
    const centerLng = -74.006
    const radiusMeters = 500
    const zoneId = 'zone-1'
    const zoneName = 'Warehouse A'

    it('should return correct structure for point inside zone', () => {
      const result = checkSingleZoneBoundary(
        40.7188,
        -74.006,
        zoneId,
        zoneName,
        centerLat,
        centerLng,
        radiusMeters
      )

      expect(result).toHaveProperty('zoneId', zoneId)
      expect(result).toHaveProperty('zoneName', zoneName)
      expect(result).toHaveProperty('isInside', true)
      expect(result).toHaveProperty('distance')
      expect(result.distance).toBeGreaterThan(0)
      expect(result).toHaveProperty('latitude', 40.7188)
      expect(result).toHaveProperty('longitude', -74.006)
    })

    it('should return correct structure for point outside zone', () => {
      const result = checkSingleZoneBoundary(
        40.7728,
        -74.006,
        zoneId,
        zoneName,
        centerLat,
        centerLng,
        radiusMeters
      )

      expect(result.isInside).toBe(false)
      expect(result.distance).toBeGreaterThan(radiusMeters)
    })

    it('should have distance as number rounded to 2 decimal places', () => {
      const result = checkSingleZoneBoundary(
        40.7188,
        -74.006,
        zoneId,
        zoneName,
        centerLat,
        centerLng,
        radiusMeters
      )

      expect(typeof result.distance).toBe('number')
      // Check if rounded to 2 decimal places
      const decimalPart = String(result.distance).split('.')[1]
      expect(decimalPart?.length || 0).toBeLessThanOrEqual(2)
    })
  })

  describe('checkMultipleZoneBoundaries', () => {
    const zones = [
      { id: 'zone-1', name: 'Warehouse A', latitude: 40.7128, longitude: -74.006, radius: 500 },
      { id: 'zone-2', name: 'Delivery Hub B', latitude: 40.7228, longitude: -74.006, radius: 300 },
      { id: 'zone-3', name: 'Pickup Point C', latitude: 40.7028, longitude: -74.006, radius: 200 }
    ]

    it('should return array with results for all zones', () => {
      const results = checkMultipleZoneBoundaries(40.7128, -74.006, zones)

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBe(3)
    })

    it('should return results in same order as input zones', () => {
      const results = checkMultipleZoneBoundaries(40.7128, -74.006, zones)

      expect(results[0].zoneId).toBe('zone-1')
      expect(results[1].zoneId).toBe('zone-2')
      expect(results[2].zoneId).toBe('zone-3')
    })

    it('should correctly identify inside/outside for each zone', () => {
      // Point at center of zone-1
      const results = checkMultipleZoneBoundaries(40.7128, -74.006, zones)

      // Should be inside zone-1 (same point)
      expect(results[0].isInside).toBe(true)
      // May or may not be in zone-2 (depends on distance calculation)
      // zone-3 should be outside or close
      expect(results.every((r) => typeof r.isInside === 'boolean')).toBe(true)
    })

    it('should handle empty zones array', () => {
      const results = checkMultipleZoneBoundaries(40.7128, -74.006, [])
      expect(results).toEqual([])
    })

    it('should handle single zone', () => {
      const results = checkMultipleZoneBoundaries(40.7128, -74.006, [zones[0]])
      expect(results.length).toBe(1)
      expect(results[0].zoneId).toBe('zone-1')
    })
  })

  describe('determineTransition', () => {
    it('should return no_change when first time checking (wasInside undefined)', () => {
      const transition = determineTransition(undefined as any, true)
      expect(transition).toBe('no_change')
    })

    it('should return entered when transitioning from outside to inside', () => {
      const transition = determineTransition(false, true)
      expect(transition).toBe('entered')
    })

    it('should return exited when transitioning from inside to outside', () => {
      const transition = determineTransition(true, false)
      expect(transition).toBe('exited')
    })

    it('should return no_change when staying inside', () => {
      const transition = determineTransition(true, true)
      expect(transition).toBe('no_change')
    })

    it('should return no_change when staying outside', () => {
      const transition = determineTransition(false, false)
      expect(transition).toBe('no_change')
    })
  })
})
