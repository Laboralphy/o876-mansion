import AbstractFilter from "@/libs/filters/AbstractFilter";

/**
 * @class Timed
 * @description this filter will display a sub filter for a limited amount of time, then terminate it.
 */
class Timed extends AbstractFilter {
    _child: AbstractFilter;
    _duration: number;

    constructor({child = null, duration = 1000}: { child?: AbstractFilter, duration?: number }) {
        super();
        this._duration = duration;
        this._child = child;
    }

    get child (): AbstractFilter {
        return this._child
    }

    process(): void {
        const c = this._child;
        if (!!c) {
            this._child.computeClock(this._nProcessTime);
            this._child.process();
        }
    }

    render(canvas: HTMLCanvasElement): void {
        const c = this._child;
        if (!!c) {
            this._child.render(canvas);
        }
    }

    over(): boolean {
        return super.over() || this.elapsed >= this._duration;
    }
}

export default Timed;
