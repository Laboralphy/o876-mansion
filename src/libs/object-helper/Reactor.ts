import Events from '@/libs/events';
import Extender from "@/libs/object-helper/Extender";

const REACTOR_PROP_NAME = '__reactor__';
const REACTOR_CHANGED_EVENT_NAME = 'changed';

/**
 * Array methods that mutate the array : they are wrapped to trigger notifications
 */
type ArrayMutator = 'push' | 'pop' | 'shift' | 'unshift' | 'sort' | 'splice' | 'reverse';

/**
 * This class is use to observe all mutations against an object.
 */
class Reactor {
    _events: Events;
    _log: Record<string, boolean>;

    constructor(obj: object) {
        this._events = new Events();
        this._log = {};
        this.clear();
        this.makeReactiveObject(obj, undefined, obj);
    }

    get events(): Events {
        return this._events;
    }

    getLog(): string[] {
        return Object.keys(this._log);
    }

    /**
     * remove all event handler, and clears the log to save memory
     */
    dispose() {
        this._events.removeAllListeners(REACTOR_CHANGED_EVENT_NAME);
        this.clear();
    }

    /**
     * clears the mutation log
     */
    clear() {
        this._log = {};
    }

    /**
     * add a hierarchic key to the mutation log
     * @param path {string} hierarchic key
     * @param oRoot {object} root object
     */
    notify(path: string, oRoot: object): void {
        path = path.substr(1);
        this._log[path] = true;
        const value = Extender.objectGet(oRoot, path);
        this._events.emit(REACTOR_CHANGED_EVENT_NAME, {key: path, root: oRoot, value});
    }

    /**
     * Wraps an array method, so when it is called, it triggers the notify method
     * @param arr {Array}
     * @param sMethod {string}
     * @param path {string}
     * @param oRoot {object} root object
     */
    makeReactiveArrayMethod(arr: unknown[], sMethod: ArrayMutator, path: string, oRoot: object): void {
        const oSelf = this;
        (arr as unknown as Record<ArrayMutator, Function>)[sMethod] = (...args: unknown[]) => {
            oSelf.notify(path, oRoot);
            return (Array.prototype[sMethod] as Function).apply(arr, args);
        };
    }

    /**
     * renders an array reactive, when items are changed, the notification is triggered
     * @param obj {*}
     * @param key {string}
     * @param path {string}
     * @param oRoot {object} root object
     */
    makeReactiveArray(obj: Record<string, any>, key: string, path: string, oRoot: object): void {
        const arr = obj[key];
        path += '.' + key;
        const meth: ArrayMutator[] = [
            'push',
            'pop',
            'shift',
            'unshift',
            'sort',
            'splice',
            'reverse'
        ];
        this.notify(path, oRoot);
        meth.forEach(m => this.makeReactiveArrayMethod(arr, m, path, oRoot));
    }

    /**
     * Renders a single scalar value, (including bool, number, string), reactive
     * @param obj {*}
     * @param key {string}
     * @param path {string}
     * @param oRoot {object} root object
     */
    makeReactiveScalar(obj: Record<string, any>, key: string, path: string, oRoot: object): void {
        let val = obj[key];
        path += '.' + key;
        const oSelf = this;

        this.notify(path, oRoot);

        Object.defineProperty(obj, key, {
            get() {
                return val; // Simply return the cached value
            },
            set(newVal) {
                if (val !== newVal) {
                    val = newVal; // Save the newVal
                    oSelf.notify(path, oRoot);
                }
            }
        });
    }

    /**
     * makes an item reactive
     * @param obj
     * @param key
     * @param path
     * @param oRoot {object} root object
     */
    makeReactiveItem(obj: Record<string, any>, key: string, path: string, oRoot: object): void {
        switch (Extender.getType(obj[key])) {
            case 'object':
                this.makeReactiveObject(obj[key], path + '.' + key, oRoot);
                break;

            case 'array':
                this.makeReactiveArray(obj, key, path, oRoot);
                break;

            default:
                this.makeReactiveScalar(obj, key, path, oRoot);
                break;
        }
    }

    makeReactiveObject(obj: Record<string, any>, path?: string, oRoot?: object): void {
        if (path === undefined) {
            path = '';
            oRoot = obj;
        }
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                this.makeReactiveItem(obj, key, path, oRoot);
            }
        }
        Object.seal(obj);
    }
}

export default Reactor;