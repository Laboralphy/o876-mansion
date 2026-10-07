import Events from '@/libs/events';
import StateContext, { type StateDefinition } from '@/libs/automaton/StateContext';

export type TransitionType = 'jump' | 'call' | 'back';

class Automaton {
    _currentState: string;
    _events: Events;
    _initialState: string;
    _stack: string[];
    _states: Record<string, StateContext>;

    constructor() {
        this._states = {}
        this._currentState = ''
        this._initialState = ''
        this._events = new Events()
    }

    /**
     * The original validated state definitions against a JSON schema (jsonschema npm package).
     * State definitions are written by the game itself, so validation was dropped along with the dependency.
     */
    checkInput (oDefinition: unknown): boolean {
        if (typeof oDefinition !== 'object' || oDefinition === null) {
            throw new TypeError('Automaton: state definition must be an object')
        }
        return true
    }

    get state () {
        return this._currentState
    }

    set state (value: string) {
        this.changeState(value, 'jump')
    }

    get initialState () {
        return this._initialState
    }

    set initialState (value: string) {
        this._initialState = value
    }

    get events () {
        return this._events
    }

    defineState (sName: string, oStateDef: StateDefinition): StateContext {
        this.checkInput(oStateDef)
        const oState = new StateContext(oStateDef)
        this._states[sName] = oState
        this._stack = []
        if (this._initialState === '') {
            this._initialState = sName
        }
        oState.events.on('action', eventObject => {
            this._events.emit('action', {
                state: sName,
                ...eventObject
            })
        })
        oState.events.on('test', eventObject => {
            this._events.emit('test', {
                state: sName,
                test: eventObject.test,
                parameters: eventObject.parameters,
                data: eventObject.data,
                pass(v: unknown = true) {
                    eventObject.pass(v)
                }
            })
        })
        oState.events.on('state', eventObject => {
            this.changeState(eventObject.state, eventObject.transitionType)
        })
        oState.events.on('back', () => {
            this.changeState(this._stack.pop(), 'back')
        })
        oState.events.on('parse', eventObject => {
            eventObject.output = eventObject
                .input
                .split(' ')
                .filter((s: string) => s !== '')
                /**
                 * @param s {string}
                 */
                .map((s: string) => {
                    const f = parseFloat(s)
                    return isNaN(f) ? s : f
                })
        })
        return oState
    }

    defineStates (oStates: Record<string, StateDefinition>): void {
        for (const [sState, oState] of Object.entries(oStates)) {
            this.defineState(sState, oState)
        }
    }

    /**
     *
     * @returns {StateContext}
     */
    get currentStateContext (): StateContext {
        if (this._currentState === '') {
            this.enterState(this._initialState)
        }
        if (this._currentState === '' || this._currentState === undefined) {
            return undefined
        } else if (this._currentState in this._states) {
            return this._states[this._currentState]
        } else {
            throw new Error('state ' + this._currentState + ' unknown')
        }
    }

    changeState (sState: string, sType: TransitionType = 'jump'): void {
        switch (sType) {
            case 'jump': {
                this.exitState()
                this.enterState(sState)
                break
            }

            case 'call': {
                this.enterState(sState)
                break
            }

            case 'back': {
                this.exitState()
                this._currentState = sState
            }
        }
    }

    enterState (sState: string): void {
        if (!(sState in this._states)) {
            throw new Error('state "' + sState + '" is undefined')
        }
        this._currentState = sState
        const sc = this.currentStateContext
        if (sc) {
            this._events.emit('state', { state: sState, data: sc.data })
            sc.runInit()
        }
    }

    exitState () {
        const sc = this.currentStateContext
        if (sc) {
            sc.runDone()
        }
    }

    process () {
        const sc = this.currentStateContext
        if (sc) {
            sc.runLoop()
            sc.runCall()
            sc.runBack()
            sc.runJump()
        }
    }
}

export default Automaton;