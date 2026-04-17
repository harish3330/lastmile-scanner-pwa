// ============================================================
//  lib/api-client.js  — ISSUE #2
//  Frontend HTTP client — all API calls go through here
//  Endpoint constants from lib/types/api.js
//  When Issue #8 backend is ready, replace mock delays
// ============================================================
import { API_ENDPOINTS } from './types/api.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * Generic fetch wrapper with JSON body + error handling.
 * @param {string} endpoint
 * @param {Object} body
 * @param {'POST'|'GET'|'PUT'|'DELETE'} [method='POST']
 * @returns {Promise<{ok:boolean, data?:any, error?:string}>}
 */
async function apiFetch(endpoint: string, body?: any, method = 'POST') {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.message ?? `HTTP ${res.status}` };
    return { ok: true, data };
  } catch (err: any) {
    // Offline — caller handles retry via IndexedDB sync (Issue #3)
    return { ok: false, error: err.message };
  }
}

// ── Issue #2 frontend API calls ─────────────────────────────

/** POST /api/scan */
export const postScan = (payload: any) => apiFetch(API_ENDPOINTS.SCAN, payload);

/** POST /api/location */
export const postLocation = (payload: any) => apiFetch(API_ENDPOINTS.LOCATION, payload);

/** POST /api/delivery */
export const postDelivery = (payload: any) => apiFetch(API_ENDPOINTS.DELIVERY, payload);

/** POST /api/payment */
export const postPayment = (payload: any) => apiFetch(API_ENDPOINTS.PAYMENT, payload);

/** POST /api/sync */
export const postSync = (payload: any) => apiFetch(API_ENDPOINTS.SYNC, payload);

/** POST /api/detect */
export const postDetect = (payload: any) => apiFetch(API_ENDPOINTS.DETECT, payload);

/** POST /api/otp */
export const postOtp = (payload: any) => apiFetch(API_ENDPOINTS.OTP, payload);

/** POST /api/whatsapp */
export const postWhatsapp = (payload: any) => apiFetch(API_ENDPOINTS.WHATSAPP, payload);

export default apiFetch;
