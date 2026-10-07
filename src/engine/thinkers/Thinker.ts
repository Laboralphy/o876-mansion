import Automaton from "@/libs/automaton";
import type Entity from "@/engine/Entity";
import type Engine from "@/engine/Engine";

/**
 * Data shared by all thinkers (given to Engine.useThinkers()).
 * Empty at engine level : the game extends it by declaration merging, e.g.
 * declare module '@/engine/thinkers/Thinker' { interface ThinkerContext { game: Game } }
 */
export interface ThinkerContext {}

export type ThinkerClass = new () => Thinker;

/**
 * a class with basic mechanism to manage states.
 * this thinker has no "thinking" abilities whatsoever
 */
class Thinker {
    _automaton: Automaton;
    _context: ThinkerContext;
    _engine: Engine;
    _entity: Entity;
    _timeStart: number;

    constructor() {
        this._context = null;
        this._timeStart = null;
        this._entity = null;
        this._engine = null;
        this._automaton = new Automaton();
        this._automaton.events.on('test', ({
            test,
            parameters,
            pass
        }) => {
            pass(this._invoke(test, ...parameters))
        })
        this._automaton.events.on('action', ({
            action,
            parameters
        }) => {
            this._invoke(action, ...parameters)
        })
    }

    get debugString (): string {
        return this._entity.debugString
    }

    get context(): ThinkerContext {
        return this._context;
    }

    get automaton(): Automaton {
        return this._automaton;
    }

    emit(sEvent: string, payload: object = {}): void {
        if (this.engine) {
            this.engine.events.emit('think.' + sEvent, {
                ...payload,
                emitter: this._entity
            });
        }
    }

    get entity(): Entity {
        return this._entity;
    }

    set entity(value: Entity) {
        this._entity = value;
    }

    get engine(): Engine {
        return this._engine;
    }

    set engine(value: Engine) {
        this._engine = value;
    }

    /**
     * Invoke a method in this instance
     * @param sMeth method name
     * @param parameters method parameters
     */
    _invoke(sMeth: string, ...parameters: unknown[]): unknown {
        const meth = (this as unknown as Record<string, unknown>)[sMeth];
        if (typeof meth === 'function') {
            return meth.apply(this, parameters);
        } else {
            throw new Error('This method "' + sMeth + '" does not existe in this thinker.')
        }
    }

    /**
     * return elapsed time since creation or since modification
     * @return {number}
     */
    get elapsedTime(): number {
        return this._engine.getTime() - this._timeStart;
    }

    set elapsedTime(value: number) {
        this._timeStart = this._engine.getTime() - value;
    }

    /**
     * thinks
     */
    think(): void {
        if (this._timeStart === null) {
            this._timeStart = this._engine.getTime()
        }
        this._automaton.process();
    }
}

export default Thinker;
