// STUB - replace with real implementation later

export class StorageManager {
  async addEvent(event: any): Promise<void> {
    console.log('StorageManager.addEvent called with', event);
  }

  async getEvents(): Promise<any[]> {
    console.log('StorageManager.getEvents called');
    return [];
  }

  async removeEvent(eventId: string): Promise<void> {
    console.log('StorageManager.removeEvent called with', eventId);
  }

  async clearAll(): Promise<void> {
    console.log('StorageManager.clearAll called');
  }
}

export const storageManager = new StorageManager();
