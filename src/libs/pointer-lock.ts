/**
 * PointerLock
 *
 * @description This class provides control over the Pointer Lock API.
 * Typically an HTML Element (usually a canvas) is designed to lock the mouse pointer.
 * While mouse pointer is locked, it remains invisible. If the user move the mouse, events describing
 * mouse movements are triggered at high frequency. This is ideal for FPS game where the mouse is used
 * to control the player's point of vue (visor angle).
 *
 * @author Raphaël Marandet
 * @email raphael.marandet(at)gmail(dot)com
 * @date 2019-06-13
 */

import Events, { type EventListener } from '@/libs/events';

// vendor-prefixed (Firefox) members, absent from the DOM typings
type MozElement = HTMLElement & {
    mozRequestPointerLock?: () => void,
    mozRequestPointerLockWithKeys?: () => void
};
type MozDocument = Document & {
    mozExitPointerLock?: () => void,
    mozPointerLockElement?: Element
};
type MozMouseEvent = MouseEvent & {
    mozMovementX?: number,
    mozMovementY?: number
};

class PointerLock {
    _events: Events;
    _handlers: { mousemove: (event: MouseEvent) => void };
    bEnabled: boolean;
    bInitialized: boolean;
    bLocked: boolean;
    oElement: HTMLElement;


    constructor() {
        this.oElement = null;
        this.bInitialized = null;
        this.bLocked = false;
        this.bEnabled = false;
        this._events = new Events();
        this._handlers = {
            mousemove: null
        }
    }

    enable() {
        this.bEnabled = true;
    }

    disabled() {
        this.bEnabled = false;
        this.exitPointerLock();
    }

    on(event: string, listener: EventListener): void {
        this._events.on(event, listener);
    }

    /**
     * getter for the events property
     * @returns {module:events.internal}
     */
    get events() {
        return this._events;
    }

    /**
     * returns true if PointerLock API is available on this browser
     * @returns {boolean}
     */
    static hasPointerLockFeature() {
        return 'pointerLockElement' in document || 'mozPointerLockElement' in document;
    }

    /**
     * PointerLock API initialisation.
     * Initialization of event handler to observe PointerLock change of state.
     * @returns {boolean} returns true if PointerLock initialization is successfull
     */
    init() {
        if (!PointerLock.hasPointerLockFeature()) {
            return false;
        }
        if (this.bInitialized) {
            return true;
        }
        document.addEventListener('pointerlockchange', event => this.eventChange(event), false);
        document.addEventListener('mozpointerlockchange', event => this.eventChange(event), false);
        document.addEventListener('pointerlockerror', event => this.eventError(event), false);
        document.addEventListener('mozpointerlockerror', event => this.eventError(event), false);
        this.bInitialized = true;
        return true;
    }

    /**
     * Returns true if the mouse pointer is locked
     * @returns {boolean}
     */
    locked() {
        return this.bLocked;
    }

    /**
     * Requests the browser to lock the mouse pointer at the center of the specified HTML Element
     * @param oElement {HTMLElement}
     */
    requestPointerLock(oElement: HTMLElement): void {
        if (!this.bEnabled) {
            return;
        }
        if (this.locked()) {
            return;
        }
        this.oElement = oElement;
        const el = oElement as MozElement;
        const request: () => Promise<void> | void = el.requestPointerLock || el.mozRequestPointerLockWithKeys || el.mozRequestPointerLock;
        // recent browsers return a promise, which rejects when the request is refused
        // (e.g. clicking again too soon after leaving pointer lock with Escape) : this is reported as
        // a pointerlockerror event anyway, so the rejection is just swallowed here.
        const p = request.call(el);
        if (p && typeof p.catch === 'function') {
            p.catch(() => {});
        }
    }

    /**
     * Requests the browser to release mouse pointer
     */
    exitPointerLock() {
        if (!this.locked()) {
            return;
        }
        const doc = document as MozDocument;
        const exit = doc.exitPointerLock || doc.mozExitPointerLock;
        exit.call(doc);
    }

    /**
     * Emits an event
     * @param sEvent {string}
     * @param payload {*}
     */
    trigger(sEvent: string, payload: unknown = undefined): void {
        this._events.emit(sEvent, payload);
    }

    /**
     * This is the Change event handler. Called when something changed concerning the pointer locking process.
     * These events are dealt with :
     * 1) we are entering PointerLock mode (because we requested to, with the requestPointerLock function)
     * 2) we are exiting PointerLock mode (because we requested to, with the exitPointerLock function)
     * @param event {Event}
     */
    eventChange(event: Event): void {
        let oPointerLockElement = document.pointerLockElement || (document as MozDocument).mozPointerLockElement;
        if (oPointerLockElement) {
            this._handlers.mousemove = event => this.eventMouseMove(event);
            document.addEventListener('mousemove', this._handlers.mousemove, false);
            this.bLocked = true;
            this.trigger('enter');
        } else {
            document.removeEventListener('mousemove', this._handlers.mousemove, false);
            this._handlers.mousemove = null;
            this.oElement = null;
            this.bLocked = false;
            this.trigger('exit');
        }
    }

    /**
     * This handler deals with error
     * @param event {Event}
     */
    eventError(event: Event): void {
        console.error('PointerLock error', event);
        this.trigger('error', {error: event});
    }

    /**
     * This handler deals with mouse movement, tranforming them, transmitting them to client application
     * @param event {MouseEvent}
     */
    eventMouseMove(event: MouseEvent): void {
        const x = event.movementX || (event as MozMouseEvent).mozMovementX || 0;
        const y = event.movementY || (event as MozMouseEvent).mozMovementY || 0;
        this.trigger('mousemove', {x, y});
    }
}

export default PointerLock;