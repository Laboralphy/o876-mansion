/**
 * Minimal EventEmitter, a browser-side replacement for node's "events" module.
 * Only implements the subset used by the game: on, once, off, emit, removeAllListeners, listenerCount
 */
export type EventListener = (...args: any[]) => void;

class EventEmitter {
    private _listeners: Map<string, EventListener[]> = new Map();

    on(event: string, listener: EventListener): this {
        const a = this._listeners.get(event);
        if (a) {
            a.push(listener);
        } else {
            this._listeners.set(event, [listener]);
        }
        return this;
    }

    addListener(event: string, listener: EventListener): this {
        return this.on(event, listener);
    }

    once(event: string, listener: EventListener): this {
        const wrapper = (...args: any[]) => {
            this.off(event, wrapper);
            listener(...args);
        };
        return this.on(event, wrapper);
    }

    off(event: string, listener: EventListener): this {
        const a = this._listeners.get(event);
        if (a) {
            const i = a.indexOf(listener);
            if (i >= 0) {
                a.splice(i, 1);
            }
        }
        return this;
    }

    removeListener(event: string, listener: EventListener): this {
        return this.off(event, listener);
    }

    removeAllListeners(event?: string): this {
        if (event === undefined) {
            this._listeners.clear();
        } else {
            this._listeners.delete(event);
        }
        return this;
    }

    emit(event: string, ...args: any[]): boolean {
        const a = this._listeners.get(event);
        if (!a || a.length === 0) {
            return false;
        }
        // copy : listeners may be removed while iterating (once)
        for (const listener of a.slice()) {
            listener(...args);
        }
        return true;
    }

    listenerCount(event: string): number {
        return this._listeners.get(event)?.length ?? 0;
    }
}

export default EventEmitter;
