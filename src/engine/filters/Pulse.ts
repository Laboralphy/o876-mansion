import AbstractFilter from "@/libs/filters/AbstractFilter";
import Easing, { type EasingSpec } from "@/libs/easing";

export type PulseOptions = {
    from?: number,
    to?: number,
    loops?: number,
    duration?: number,
    easing?: EasingSpec,
    child: AbstractFilter
};

/**
 * @class Pulse
 * @description This filter will accepts a sub filter and will display it with an alpha pulsating effect.
 */
class Pulse extends AbstractFilter {
    _bPulse: boolean;
    _child: AbstractFilter;
    _direction: number;
    _easing: Easing;
    _fromAlpha: number;
    _loops: number;
    _toAlpha: number;


    /**
     * The filter constructor.
     * @param from {number} the starting opacity value
     * @param to {number} the ending opacity value
     * @param loops {number} numbers of pulsating loogs before filter extinction
     * @param duration {number} duration of one pulsation
     * @param easing {string} function used to modifed
     * @param child {AbstractFilter} the filter whose opacity will pulsate
     */
    constructor({
        from = 1,
        to = 1,
        loops = Infinity,
        duration = 1000,
        easing = Easing.LINEAR,
        child
    }: PulseOptions) {
        super();
        this._fromAlpha = from;
        this._toAlpha = to;
        this._bPulse = from !== to && duration > 0;
        this._easing = new Easing();
        this._easing.steps(duration).use(easing).from(this._fromAlpha);
        this._direction = 0;
        this._loops = loops;
        this._child = child;
        this.fwd();
    }

    fwd(): void {
        if (this._bPulse) {
            this._easing.reset().from(this._fromAlpha).to(this._toAlpha).reset();
        }
    }

    bwd(): void {
        if (this._bPulse) {
            this._easing.reset().to(this._fromAlpha).from(this._toAlpha).reset();
        }
    }

    yoyo(): void {
        switch (this._direction) {
            case 0:
                this.bwd();
                break;

            case 1:
                this.fwd();
                break;
        }
        this._direction = 1 - this._direction;
    }

    process(): void {
        const easing = this._easing;
        if (this._bPulse) {
            if (easing.over()) {
                if (--this._loops > 0) {
                    this.yoyo();
                } else {
                    return;
                }
            } else {
                easing.x += this.delta;
            }
        }
        this._child.computeClock(this._nProcessTime)
    }

    render(canvas: HTMLCanvasElement): void {
        super.render(canvas);
        const context = canvas.getContext('2d');
        context.save();
        context.globalAlpha = this._bPulse ? this._easing.y : this._fromAlpha;
        this._child.render(canvas);
        context.restore();
    }

    over(): boolean {
        return super.over() || this._loops <= 0;
    }
}

export default Pulse;