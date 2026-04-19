// Event and API types
export type EventPayload = Record<string, any> | null | undefined;
export type ApiResponse<T = unknown> = { status: 'success' | 'error'; data?: T; message?: string; code?: string };
export type DbRecord = Record<string, any>;
