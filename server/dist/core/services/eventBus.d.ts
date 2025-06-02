/**
 * Global event bus for plugin and core service communication.
 * Provides pub/sub pattern for loose coupling between components.
 */
export declare class EventBus {
    private listeners;
    /**
     * Subscribe to an event
     */
    on(event: string, listener: (...args: any[]) => void): void;
    /**
     * Unsubscribe from an event
     */
    off(event: string, listener: (...args: any[]) => void): void;
    /**
     * Emit an event to all subscribers
     */
    emit(event: string, data?: any): void;
    /**
     * Get list of all registered events
     */
    getRegisteredEvents(): string[];
    /**
     * Clear all listeners
     */
    clear(): void;
}
//# sourceMappingURL=eventBus.d.ts.map