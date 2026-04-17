/**
 * ML Module Exports
 * Central export point for all ML detection functionality
 */

export { ObjectDetector, getDetector, createDetector } from './detector'
export type { DetectedObject } from './detector'
export { PostProcessor } from './postProcessor'
export type { DetectionEvent } from '@/lib/types/events'
