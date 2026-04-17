import { DetectedObject } from './detector'

/**
 * PostProcessor: Utilities for post-processing ML detections
 * - Non-Maximum Suppression (NMS)
 * - Grouping by class
 * - Confidence calculations
 * - Bounding box normalization
 */
export class PostProcessor {
  /**
   * Apply Non-Maximum Suppression to remove overlapping boxes
   * @param detections Array of detections
   * @param iouThreshold Intersection-over-Union threshold (0-1)
   * @returns Filtered detections with overlaps removed
   */
  static getNMS(detections: DetectedObject[], iouThreshold: number = 0.5): DetectedObject[] {
    if (detections.length === 0) return []

    // Sort by score descending
    const sorted = [...detections].sort((a, b) => b.score - a.score)
    const result: DetectedObject[] = []

    for (const detection of sorted) {
      let isOverlapping = false

      for (const kept of result) {
        const iou = this.calculateIOU(detection.bbox, kept.bbox)
        if (iou > iouThreshold) {
          isOverlapping = true
          break
        }
      }

      if (!isOverlapping) {
        result.push(detection)
      }
    }

    return result
  }

  /**
   * Calculate Intersection-over-Union (IOU) between two bounding boxes
   * @param bbox1 Bounding box [x1, y1, x2, y2]
   * @param bbox2 Bounding box [x1, y1, x2, y2]
   * @returns IOU value (0-1)
   */
  private static calculateIOU(
    bbox1: [number, number, number, number],
    bbox2: [number, number, number, number]
  ): number {
    const [x1_1, y1_1, x2_1, y2_1] = bbox1
    const [x1_2, y1_2, x2_2, y2_2] = bbox2

    const intersectX1 = Math.max(x1_1, x1_2)
    const intersectY1 = Math.max(y1_1, y1_2)
    const intersectX2 = Math.min(x2_1, x2_2)
    const intersectY2 = Math.min(y2_1, y2_2)

    if (intersectX1 >= intersectX2 || intersectY1 >= intersectY2) {
      return 0
    }

    const intersectArea =
      (intersectX2 - intersectX1) * (intersectY2 - intersectY1)

    const box1Area = (x2_1 - x1_1) * (y2_1 - y1_1)
    const box2Area = (x2_2 - x1_2) * (y2_2 - y1_2)

    const unionArea = box1Area + box2Area - intersectArea

    return intersectArea / unionArea
  }

  /**
   * Group detections by class label
   * @param detections Array of detections
   * @returns Map of class -> detections
   */
  static groupByClass(detections: DetectedObject[]): Map<string, DetectedObject[]> {
    const grouped = new Map<string, DetectedObject[]>()

    for (const detection of detections) {
      if (!grouped.has(detection.class)) {
        grouped.set(detection.class, [])
      }
      grouped.get(detection.class)!.push(detection)
    }

    return grouped
  }

  /**
   * Normalize bounding box to [x1, y1, x2, y2] format (0-1 range)
   * @param bbox Bounding box [x, y, width, height]
   * @param imageWidth Image width in pixels
   * @param imageHeight Image height in pixels
   * @returns Normalized bbox [x1, y1, x2, y2]
   */
  static normalizeBBox(
    bbox: [number, number, number, number],
    imageWidth: number,
    imageHeight: number
  ): [number, number, number, number] {
    const [x, y, width, height] = bbox
    return [
      x / imageWidth,
      y / imageHeight,
      (x + width) / imageWidth,
      (y + height) / imageHeight
    ]
  }

  /**
   * Get parcel count (count of objects, or specific class if specified)
   * @param detections Array of detections
   * @param parcelClass Optional: only count specific class (e.g., 'parcel')
   * @returns Count of parcels
   */
  static getParcelCount(
    detections: DetectedObject[],
    parcelClass?: string
  ): number {
    if (!parcelClass) {
      return detections.length
    }
    return detections.filter(d => d.class === parcelClass).length
  }

  /**
   * Calculate average confidence score
   * @param detections Array of detections
   * @returns Average confidence (0-1)
   */
  static calculateConfidence(detections: DetectedObject[]): number {
    if (detections.length === 0) return 0
    const sum = detections.reduce((acc, d) => acc + d.score, 0)
    return sum / detections.length
  }

  /**
   * Get detections of specific class
   * @param detections Array of detections
   * @param className Class to filter by
   * @returns Filtered detections
   */
  static filterByClass(
    detections: DetectedObject[],
    className: string
  ): DetectedObject[] {
    return detections.filter(d => d.class === className)
  }

  /**
   * Sort detections by confidence (descending)
   * @param detections Array of detections
   * @returns Sorted detections
   */
  static sortByConfidence(detections: DetectedObject[]): DetectedObject[] {
    return [...detections].sort((a, b) => b.score - a.score)
  }

  /**
   * Get top N detections by confidence
   * @param detections Array of detections
   * @param n Number of detections to return
   * @returns Top N detections
   */
  static getTopN(detections: DetectedObject[], n: number): DetectedObject[] {
    return this.sortByConfidence(detections).slice(0, n)
  }
}
