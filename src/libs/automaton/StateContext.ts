import Events from '@/libs/events';

/**
 * A transition toward another state, taken when "test" passes (or unconditionally if there is no test)
 */
/**
 * Script parameters : the input string is split on spaces, numeric values are converted (see Automaton 'parse')
 */
export type ScriptParameters = (string | number)[];

export type Transition = {
    test?: string,
    state?: string,
    actions?: string[]
};

/**
 * State definition, as given to Automaton.defineState().
 * Actions and tests are script strings : "opcode param1 param2..."
 */
export type StateDefinition = {
    data?: Record<string, unknown> | ((sc: StateContext) => Record<string, unknown>),
    init?: string | string[],
    loop?: string | string[],
    done?: string | string[],
    call?: Transition | Transition[],
    back?: Transition | Transition[],
    jump?: Transition | Transition[]
};

class StateContext {
    _back: Transition[];
    _call: Transition[];
    _data: Record<string, unknown>;
    _done: string[];
    _events: Events;
    _init: string[];
    _jump: Transition[];
    _loop: string[];

    constructor(oDefinition: StateDefinition = {}) {
        const { back = [], call = [], data = {}, init = [], loop = [], done = [], jump = [] } = oDefinition
        this._data = typeof data === 'function' ? data(this) : { ...data }
        this._init = Array.isArray(init) ? init : [init] // liste des actions effectuées au début de l'état
        this._loop = Array.isArray(loop) ? loop : [loop] // liste des actions effectuées en boucle
        this._done = Array.isArray(done) ? done : [done] // liste des actions effectuées lorsque l'état change
        this._call = Array.isArray(call) ? call : [call] // appel d'un autre état
        this._back = Array.isArray(back) ? back : [back] // retourne à l'état qui a invoqué call
        this._jump = Array.isArray(jump) ? jump : [jump] // changement d'état
        this._events = new Events
    }

    get data (): Record<string, unknown> {
        return this._data
    }

    get events (): Events {
        return this._events
    }

    runActions (a: string[]): void {
        a.forEach(s => {
            this.invokeAction(s)
        })
    }

    runSmth (s: 'init' | 'loop' | 'done'): void {
        this.runActions({ init: this._init, loop: this._loop, done: this._done }[s])
    }

    runInit () {
        this.runSmth('init')
    }

    runLoop () {
        this.runSmth('loop')
    }

    runDone () {
        this.runSmth('done')
    }

    runJump () {
        for (const { test = undefined, state, actions = [] } of this._jump) {
            if (test === undefined || this.invokeTest(test)) {
                this.runActions(actions)
                this._events.emit('state', { state, data: this._data, transitionType: 'jump' })
                break
            }
        }
    }

    runCall () {
        for (const { test = undefined, state } of this._call) {
            if (test === undefined || this.invokeTest(test)) {
                this._events.emit('state', { state, data: this._data, transitionType: 'call' })
                break
            }
        }
    }

    runBack () {
        for (const { test = undefined } of this._back) {
            if (test === undefined || this.invokeTest(test)) {
                this._events.emit('back', {})
                break
            }
        }
    }

    parseScriptArguments (sInput: string): { opcode: string, parameters: ScriptParameters } {
        const r = sInput.match(/^\s*(\S+)\s*(.*)$/)
        if (r) {
            const eventObject: { opcode: string, input: string, output: string | ScriptParameters } = {
                opcode: r[1],
                input: r[2],
                output: r[2]
            }
            this._events.emit('parse', eventObject)
            return {
                opcode: eventObject.opcode,
                // the 'parse' event listener is expected to split the input
                parameters: typeof eventObject.output === 'string' ? [eventObject.output] : eventObject.output
            }
        } else {
            throw new Error('Parse Error: could not parse input string')
        }
    }

    invokeAction (action: string): void {
        const { opcode, parameters } = this.parseScriptArguments(action)
        this._events.emit('action', {
            action: opcode,
            parameters,
            data: this._data
        })
    }

    invokeTest (test: string): boolean {
        const { opcode, parameters } = this.parseScriptArguments(test)
        const eventObject = {
            test: opcode,
            parameters,
            data: this._data,
            _result: false,
            pass(v: unknown = true) {
                this._result = Boolean(v)
            }
        }
        this._events.emit('test', eventObject)
        return eventObject._result
    }
}

export default StateContext;
