// Utility functions can be added here
// Example: formatDate, formatCurrency, calculateDistance, etc.

/**
 * Format date to readable string
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

/**
 * Format time to readable string
 */
export function formatTime(date) {
  return new Date(date).toLocaleTimeString();
}

/**
 * Check if device is online
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Get device information
 */
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
  };
}
