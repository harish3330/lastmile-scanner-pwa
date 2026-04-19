// STUB - replace with real implementation later

export class EventBus {
  private listeners: Map<string, Set<Function>> = new Map();

  on(eventType: string, listener: Function): () => void {
    console.log('EventBus.on called for', eventType);
    const listeners = this.listeners.get(eventType) ?? new Set();
    listeners.add(listener);
    this.listeners.set(eventType, listeners);

    return () => {
      this.off(eventType, listener);
    };
  }

  off(eventType: string, listener: Function): void {
    console.log('EventBus.off called for', eventType);
    const listeners = this.listeners.get(eventType);
    if (!listeners) {
      return;
    }
    listeners.delete(listener);
    if (listeners.size === 0) {
      this.listeners.delete(eventType);
    }
  }

  emit(event: any): void {
    console.log('EventBus.emit called for', event);
    const eventType = typeof event === 'object' && event !== null ? String((event as any).type ?? '') : '';
    const listeners = this.listeners.get(eventType);
    if (!listeners) {
      return;
    }
    for (const listener of listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('EventBus listener error', error);
      }
    }
  }
}

export const eventBus = new EventBus();
