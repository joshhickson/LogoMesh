"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
/**
 * Global event bus for plugin and core service communication.
 * Provides pub/sub pattern for loose coupling between components.
 */
class EventBus {
    constructor() {
        this.listeners = new Map();
    }
    /**
     * Subscribe to an event
     */
    on(event, listener) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(listener);
    }
    /**
     * Unsubscribe from an event
     */
    off(event, listener) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.delete(listener);
            if (eventListeners.size === 0) {
                this.listeners.delete(event);
            }
        }
    }
    /**
     * Emit an event to all subscribers
     */
    emit(event, data) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => {
                try {
                    callback(data);
                }
                catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    /**
     * Get list of all registered events
     */
    getRegisteredEvents() {
        return Array.from(this.listeners.keys());
    }
    /**
     * Clear all listeners
     */
    clear() {
        this.listeners.clear();
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=eventBus.js.map