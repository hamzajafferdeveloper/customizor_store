// Simple global Event Bus using EventTarget
export const eventBus = new EventTarget();

/**
 * Emit a custom event globally
 * @param {string} eventName - Event name
 * @param {any} detail - Data to send
 */
export function emitEvent<T = any>(eventName: string, detail?: T) {
    eventBus.dispatchEvent(new CustomEvent(eventName, { detail }));
}

/**
 * Listen for a custom event globally
 * @param {string} eventName - Event name
 * @param {(data: T) => void} callback - Callback to handle event
 */
export function onEvent<T = any>(eventName: string, callback: (data: T) => void) {
    const handler = (event: Event) => {
        const customEvent = event as CustomEvent<T>;
        callback(customEvent.detail);
    };
    eventBus.addEventListener(eventName, handler);
    return () => eventBus.removeEventListener(eventName, handler); // ✅ Unsubscribe function
}
