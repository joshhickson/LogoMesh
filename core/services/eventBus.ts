/**
 * Global event bus for plugin and core service communication.
 * Provides pub/sub pattern for loose coupling between components.
 */

// Define a generic event listener type
export type EventListener<T = unknown> = (data: T) => void;

export class EventBus {
  private listeners: Map<string, Set<EventListener<unknown>>> = new Map();

  /**
   * Subscribe to an event
   */
  on<T = unknown>(event: string, listener: EventListener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set<EventListener<unknown>>());
    }
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
        // Store as EventListener<unknown>; the specific type T is captured in the listener's closure.
        eventListeners.add(listener as EventListener<unknown>);
    }
  }

  /**
   * Unsubscribe from an event
   */
  off<T = unknown>(event: string, listener: EventListener<T>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener as EventListener<unknown>);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit<T = unknown>(event: string, data?: T): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      // Iterate over a copy of the set in case a listener modifies the set during iteration
      [...eventListeners].forEach(callback => { // callback is EventListener<unknown>
        try {
          // Data of type T is passed to a callback expecting unknown. This is type-safe.
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