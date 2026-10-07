import type { RceLevel } from '@laboralphy/raycaster386';
import UI from '@/libs/ui';
import type Screen from '@/libs/ui/Screen';
import Engine, { type BuildLevelExtra } from '@/engine/Engine'
import type { ThinkerClass } from '@/engine/thinkers/Thinker';
import type FPSControlThinker from '@/engine/thinkers/FPSControlThinker';
import {fetchJSON} from "@/libs/fetch-json";
import Extender from "@/libs/object-helper/Extender";
import * as ENGINE_CONSTS from '@/engine/consts';
import CanvasHelper from "@/libs/canvas-helper";

const SERIAL_VERSION = 1;

// built in path values
const FETCH_LEVEL_URL = './assets/levels/:name.json';
const FETCH_DATA_URL = './assets/data/:name.json';
const FETCH_LEVEL_LIST_URL = './levels';

export interface GameOptions {
    pointerlock: boolean;
    autostretch: boolean;
    surface: HTMLCanvasElement;
    overlay: HTMLElement;
    mouseSensitivity: number;
    cameraThinker: string;
    thinkers: Record<string, ThinkerClass>;
    loadProgress: (phase: string, f: number) => void;
    autoload: boolean;
    fetchLevelAction: string;
    fetchDataAction: string;
    fetchLevelListAction: string;
    firstLevel?: string;
}

/**
 * Camera thinker methods that are invoked by the game input handlers
 */
type CameraThinkerFunction = 'look' | 'keyUp' | 'keyDown' | 'setLookFactor';

class GameAbstract {
    _debug: boolean;
    _engine: Engine;
    _logGroups: string[];
    _options: GameOptions;
    _runCalled: boolean;
    _screen: Screen;


    constructor() {
        this._debug = false;
        this._logGroups = [];
        this._screen = null;
        this._engine = null;
        this._options = {
            // activate the FPS mode and use the pointerlock system to control the visor with the mouse.
            // when the user click on the game screen, the mouse button is hidden and the mouse takes control
            // of the visor rotation.
            pointerlock: true,

            // If the navigator window is resized the game surface will also auto-resize to get the maximum
            // space available.
            autostretch: true,

            // the DOM surface element where the game will be rendered.
            surface: document.querySelector<HTMLCanvasElement>('div.game canvas.screen'),

            // the DOM overlay element where the user interface can be displayed
            overlay: document.querySelector<HTMLElement>('div.game div.overlay'),

            // the mouse sensitivity, lower this value to slow down visor rotation when the mouse is moved
            // this is only useful if "pointerlock" is also true
            mouseSensitivity: 0.01,

            // The visor thinker.
            cameraThinker: 'FPSControlThinker',

            // declared thinker
            thinkers: {},

            // this function is called back whenever the game loads a level.
            // param phase : a string, the name of the loading phase
            // param f : a float number between 0 and 1. this is the progress indicator, at 0 the game has just
            // begun to load the level, at 1 the game has completed.
            loadProgress: (phase, f) => this.progressFunction(phase, f),

            // auto load the first level available
            autoload: true,

            // this is an url. when the game needs to load a level from the server, it uses this url.
            // DO NOT CHANGE ! // DO NOT CHANGE ! // DO NOT CHANGE !
            fetchLevelAction: FETCH_LEVEL_URL,

            // this is an url. when the game needs to load a data file from the server, it uses this url.
            // DO NOT CHANGE ! // DO NOT CHANGE ! // DO NOT CHANGE !
            fetchDataAction: FETCH_DATA_URL,

            // this is an url. when the game needs to fetch the level list from the server, it uses this url.
            // DO NOT CHANGE ! // DO NOT CHANGE ! // DO NOT CHANGE !
            fetchLevelListAction: FETCH_LEVEL_LIST_URL

        };
        this._runCalled = false;
    }



//  _                                             _   _
// | |    ___   __ _    ___  _ __   ___ _ __ __ _| |_(_) ___  _ __  ___
// | |   / _ \ / _` |  / _ \| '_ \ / _ \ '__/ _` | __| |/ _ \| '_ \/ __|
// | |__| (_) | (_| | | (_) | |_) |  __/ | | (_| | |_| | (_) | | | \__ \
// |_____\___/ \__, |  \___/| .__/ \___|_|  \__,_|\__|_|\___/|_| |_|___/
//             |___/        |_|


    log(...args: unknown[]): void {
        if (this._debug) {
            console.log('[g]', ...args);
        }
    }

    logGroup(sGroup: string): void {
        if (this._debug) {
            console.group(sGroup);
            this._logGroups.push(sGroup);
        }
    }

    logGroupEnd(): void {
        if (this._debug) {
            this._logGroups.pop();
            console.groupEnd();
        }
    }





//             _   _
//   __ _  ___| |_| |_ ___ _ __ ___
//  / _` |/ _ \ __| __/ _ \ '__/ __|
// | (_| |  __/ |_| ||  __/ |  \__ \
//  \__, |\___|\__|\__\___|_|  |___/
//  |___/

    get screen(): Screen {
        return this._screen;
    }

    get engine(): Engine {
        return this._engine;
    }

    get options(): GameOptions {
        return this._options;
    }




//  _       _ _   _       _ _           _
// (_)_ __ (_) |_(_) __ _| (_)___  __ _| |_ ___  _ __ ___
// | | '_ \| | __| |/ _` | | / __|/ _` | __/ _ \| '__/ __|
// | | | | | | |_| | (_| | | \__ \ (_| | || (_) | |  \__ \
// |_|_| |_|_|\__|_|\__,_|_|_|___/\__,_|\__\___/|_|  |___/

    /**
     * Should be called once !
     * @return {GameAbstract}
     */
    initScreen(): this {
        this.log('init screen')
        const surface = this._options.surface;
        const overlay = this._options.overlay;
        const screen = new UI.Screen({
            surface,
            overlay
        });
        screen.setup({
            autostretch: this._options.autostretch,
            pointerlock: this._options.pointerlock
        });
        this._screen = screen;
        return this;
    }

    /**
     * engine initialisation
     * @return {GameAbstract}
     */
    initEngine(): this {
        this.log('init engine')
        const surface = this._screen.surface;       // getting the surface a.k.a the rendering canvas
        const engine = new Engine();             // create an engine instance
        engine.config.cameraThinker = this._options.cameraThinker;
        engine.useThinkers(this._options.thinkers);
        engine.setRenderingCanvas(surface);         // configure the engine, so it uses our canvas
        engine.events.on('level.loading', ({phase, progress}) => this.progressFunction(phase, progress));
        this._engine = engine;                      // keeping updateEntity of the engine instance
        return this;
    }

    /**
     * handler initialisation
     */
    initListeners(): void {
        this.log('install event listeners')
        window.addEventListener('keydown', event => {
            this.keyDownHandler(event.key);
        });
        window.addEventListener('keyup', event => {
            this.keyUpHandler(event.key);
        });
        // mouse buttons are game commands ("Mouse0" : left, "Mouse1" : middle, "Mouse2" : right)
        // when pointer lock is active, they only count while the pointer is locked,
        // so that clicking in menus, or clicking to (re)enter pointer lock, does not trigger any game action.
        window.addEventListener('mousedown', event => {
            if (this.isMouseCaptured()) {
                event.preventDefault();
                this.keyDownHandler('Mouse' + event.button);
            }
        });
        window.addEventListener('mouseup', event => {
            // always released, so that a button cannot stay stuck if the pointer lock is lost while pressed
            this.keyUpHandler('Mouse' + event.button);
        });
        // the right button is a game command : no context menu over the game screen
        window.addEventListener('contextmenu', event => {
            if (this.isMouseCaptured() || this._options.surface?.parentElement?.contains(event.target as Node)) {
                event.preventDefault();
            }
        });
        if (this._options.pointerlock) {
            this.screen.on('mousemove', event => {
                const x = event.x
                this.invokeCameraThinkerFunction('look', x);
            });
        }
    }

    /**
     * Returns true if mouse events must be considered as game commands :
     * either pointer lock is not used by this game, or the pointer is currently locked.
     */
    isMouseCaptured(): boolean {
        return !this._options.pointerlock || (!!this._screen && this._screen.pointerlock.locked());
    }

    init(): void {
        this.log('init game');
        this.initScreen();
        this.initEngine();
        this.initListeners();
    }

    initAsync(): Promise<void> {
        this.log('async init game');
        return Promise.resolve();
    }


    config(options: Partial<GameOptions>): void {
        if (this._runCalled) {
            throw new Error('you must config() BEFORE run(), not after.')
        }
        Extender.objectExtends(this._options, options, true);
    }


//  _                                     _     _                     _ _
// | | _____ _   _    _____   _____ _ __ | |_  | |__   __ _ _ __   __| | | ___ _ __ ___
// | |/ / _ \ | | |  / _ \ \ / / _ \ '_ \| __| | '_ \ / _` | '_ \ / _` | |/ _ \ '__/ __|
// |   <  __/ |_| | |  __/\ V /  __/ | | | |_  | | | | (_| | | | | (_| | |  __/ |  \__ \
// |_|\_\___|\__, |  \___| \_/ \___|_| |_|\__| |_| |_|\__,_|_| |_|\__,_|_|\___|_|  |___/
//           |___/

    keyUpHandler(key: string): void {
        this.invokeCameraThinkerFunction('keyUp', key);
    }

    keyDownHandler(key: string): void {
        this.invokeCameraThinkerFunction('keyDown', key);
    }

    invokeCameraThinkerFunction<K extends CameraThinkerFunction>(sFunction: K, ...args: Parameters<FPSControlThinker[K]>): void {
        if (this._engine && this._engine.camera && this._engine.camera.thinker) {
            // the camera thinker is usually a FPSControlThinker, but any thinker with these methods will do
            const t = this._engine.camera.thinker as unknown as Partial<Record<K, (...a: unknown[]) => void>>;
            const f = t[sFunction];
            if (typeof f === 'function') {
                f.apply(t, args);
            }
        }
    }

    setMouseSensitivity(f: number): void {
        this.invokeCameraThinkerFunction('setLookFactor', f);
    }

    progressFunction(phase: string, f: number): void {
        const canvas = this.screen.surface;
        const context = canvas.getContext('2d');
        const LINEWIDTH = 6;
        const SIZE = 32;
        const xCenter = canvas.width >> 1;
        const yCenter = canvas.height >> 1;
        context.lineWidth = LINEWIDTH;
        context.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
        context.strokeStyle = '#222';
        context.beginPath();
        context.arc(xCenter, yCenter, SIZE - (LINEWIDTH >> 1), 0, Math.PI * 2);
        context.stroke();
        context.strokeStyle = 'white';
        context.beginPath();
        const fPhase = Math.PI * 1.5;
        context.arc(xCenter, yCenter, SIZE - (LINEWIDTH >> 1), fPhase, Math.PI * 2 * f + fPhase);
        context.stroke();
    }

    /**
     * Displays a message on a canvas, usually to notify an error during the initial phase of game construction.
     * @param sMessage {string};
     */
    displayMessage(sMessage: string): void {
        const canvas = this.screen.surface;
        const context = canvas.getContext('2d');
        const PADDING = 8;
        CanvasHelper.text(
            canvas,
            sMessage,
            PADDING,
            PADDING,
            {
                fill: 'red'
            },
            canvas.width - 2 * PADDING,
            12);
    }

    /**
     * loads a level and starts the doomloop.
     * @param data level data
     * @param extra extra json data to be loaded as tilesets and blueprints
     */
    async buildLevel(data: RceLevel, extra: BuildLevelExtra = {}): Promise<void> {
        const engine = this._engine;
        this.log('building level');
        engine.stopDoomLoop();
        await engine.buildLevel(data, extra);
        this.log('data successfuly loaded and parsed');
        engine.startDoomLoop();
        this.log('doom loop started');
        this.enterLevel();
    }

    /**
     * does something special (and synchronous) each time a level is loaded. activates pointerlock.
     */
    enterLevel(): void {
        this.log('entering level');
        if (this._options.pointerlock) {
            this.setMouseSensitivity(this._options.mouseSensitivity);
            this._screen.pointerlock.enable();
        }
    }

    async run(): Promise<void> {
        this.log('starting game engine');
        this._runCalled = true;
        this.init();
        await this.initAsync();
        if (this._options.autoload) {
            const aLevels = await fetchJSON<{ name: string, exported: boolean }[]>(this._options.fetchLevelListAction);
            const aExpLevels = aLevels.filter(level => level.exported);
            const level = aExpLevels.shift();
            if (!!level) {
                try {
                    this.log('autoloading level', level.name);
                    const oLevelData = await fetchJSON<RceLevel>(this.options.fetchLevelAction.replace(/:name/, level.name))
                    await this.buildLevel(oLevelData);
                    this.log('level', level.name, 'successfully loaded');
                } catch (e) {
                    console.error(e);
                    this.displayMessage('Error: ' + e.message);
                }
            } else {
                this.displayMessage('Error: There is no published level !');
            }
        }
    }
}

export default GameAbstract;
