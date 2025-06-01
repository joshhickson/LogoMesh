
/**
 * Global event bus for plugin and core service communication.
 * Provides pub/sub pattern for loose coupling between components.
 */
export class EventBus {
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Subscribe to an event
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get list of all registered events
   */
  getRegisteredEvents(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
  }
}
