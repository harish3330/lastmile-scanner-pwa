/**
 * ISSUE #4 - Scanner Module Export
 * Main entry point for the QR/Barcode scanner module
 */

export { ScannerEngine, getScannerInstance, initScanner, stopScanner } from './scanner'
export { ScanSyncHandler, initScanSyncHandler, getScanSyncHandler } from './syncHandler'
export type { ScanResult, CameraConfig, ScannerState, ScannerOptions, CameraPermissionStatus, ScanEvent } from './types'
