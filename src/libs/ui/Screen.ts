import ManagedElement from "@/libs/ui/ManagedElement";
import PointerLock from '@/libs/pointer-lock';
import Events, { type EventListener } from '@/libs/events';

/**
 * The screen class manages a surface (usually a canvas or a video) and an overlay (usually a div).
 * This screen is dedicated to games, because it will lock the mouse when the surface is clicked.
 * the overlay acts as a User Interface, located above the surface, so that information may be
 * print over the game/media surface layer.
 *
 * The class emits several events :
 * - mousemove ({x, y}) : the mouse is mouved over the surface
 * - pointerlock.enter : the request pointer lock have been successfully accepted
 * - pointerlock.exit : the user has hit 'ESC' to exit pointer lock
 *
 * DON'T FORGET
 * to set request-pointer-lock attributes on overlay items you want them to enter pointer lock when clicked on.
 */
export type ScreenStructure = {
    surface: HTMLCanvasElement,
    overlay?: HTMLElement
};

export type ScreenSetup = {
    autostretch?: boolean,
    pointerlock?: boolean,
    fullscreen?: boolean,
    pointerlockAttribute?: string
};

class Screen {
    _enablePointerLock: boolean;
    _events: Events;
    _handlers: { resize: () => void, click: (event: MouseEvent) => void };
    _overlay: ManagedElement;
    _pointerlock: PointerLock;
    _surface: ManagedElement<HTMLCanvasElement>;


    constructor(comp: ScreenStructure) {
        this._events = new Events();
        this._handlers = {
            resize: null,
            click: null,
        };
        this._surface = null;
        this._overlay = null;
        this._enablePointerLock = true;
        const pl = new PointerLock();
        pl.init();
        pl.on('mousemove', event => this._events.emit('mousemove', event));
        pl.on('enter', event => this._events.emit('pointerlock.enter'));
        pl.on('exit', event => this._events.emit('pointerlock.exit'));
        this._pointerlock = pl;
        this.buildStructure(comp);
    }

    on(event: string, listener: EventListener): void {
        this._events.on(event, listener);
    }

    off(event: string, listener: EventListener): void {
        this._events.off(event, listener);
    }

    get surface(): HTMLCanvasElement {
        return this._surface.element;
    }

    get overlay(): HTMLElement {
        return !!this._overlay ? this._overlay.element : null;
    }

    get pointerlock(): PointerLock {
        return this._pointerlock;
    }

    enablePointerLock () {
        this._enablePointerLock = true;
    }

    disablePointerLock () {
        this._enablePointerLock = false;
        if (this.pointerlock.locked()) {
            this.pointerlock.exitPointerLock();
        }
    }

    _getClickEventOffset(event: MouseEvent): { x: number, y: number } {
        let el = event.target as HTMLElement,
            x = 0,
            y = 0;

        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
            x += el.offsetLeft - el.scrollLeft;
            y += el.offsetTop - el.scrollTop;
            el = el.offsetParent as HTMLElement;
        }

        x = event.clientX - x;
        y = event.clientY - y;

        return { x, y };
    }

    /**
     * Screen and overlay initialization.
     * Will imbue specified canvas with auto-stretch capabilities.
     */
    buildStructure({
        surface,
        overlay
    }: ScreenStructure): void {
        // game surface
        const mSurface = new ManagedElement(surface);
        this._surface = mSurface;
        mSurface.autoStretch();

        // overlay
        if (!!overlay) {
            const mOverlay = new ManagedElement(overlay);
            this._overlay = mOverlay;
            mOverlay.width = mSurface.width;
            mOverlay.height = mSurface.height;
            mOverlay.autoStretch();
        }
        window.addEventListener('resize', () => {
            this._surface.autoStretch();
            if (!!this._overlay) {
                this._overlay.autoStretch();
            }
        });
    }

    setup({
        autostretch = false,
        pointerlock = false,
        fullscreen = false,
        pointerlockAttribute = 'data-request-pointer-lock'
    }: ScreenSetup): void {
        if (!!this._handlers.resize) {
            window.removeEventListener('resize', this._handlers.resize);
            this._handlers.resize = null;
        }
        if (!!this._handlers.click) {
            if (this.overlay) {
                this.overlay.removeEventListener('click', this._handlers.click);
            }
            this._handlers.click = null;
        }
        if (autostretch) {
            this._handlers.resize = () => {
                this._surface.autoStretch();
                if (!!this._overlay) {
                    this._overlay.autoStretch();
                }
            };
            window.addEventListener('resize', this._handlers.resize);
        }
        if (pointerlock && PointerLock.hasPointerLockFeature()) {
            if (!!this.overlay) {
                this._handlers.click = event => {
                    if (this._enablePointerLock) {
                        const oClicked = this._getClickEventOffset(event);
                        this._events.emit('click', oClicked);
                        const oTarget = event.target as HTMLElement;
                        // compare with the DOM elements, not with their ManagedElement wrappers
                        if (oTarget === this.surface || oTarget === this.overlay || oTarget.hasAttribute(pointerlockAttribute)) {
                            this._pointerlock.requestPointerLock(this.surface);
                        }
                    }
                };
                this.overlay.addEventListener('click', this._handlers.click);
            } else {
                this._handlers.click = event => {
                    if (this._enablePointerLock) {
                        const oClicked = this._getClickEventOffset(event);
                        this._events.emit('click', oClicked);
                        this._pointerlock.requestPointerLock(this.surface);
                    }
                };
                this.surface.addEventListener('click', this._handlers.click);
            }
        }
    }
}

export default Screen;
