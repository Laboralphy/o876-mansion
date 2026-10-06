/**
 * Easing, as used by the game.
 *
 * The curves and the interpolation logic come from @laboralphy/raycaster386/simulation.
 * This subclass only restores the static curve names of the original libs/easing module
 * (Easing.LINEAR, Easing.CUBE_DECCEL...), and accepts the original names ('_linear', '_cubeDeccel'...)
 * which may still appear in game data (see WraithThinker: data.easing).
 */
import {
    Easing as SimulationEasing,
    type EasingFunction,
    type EasingName,
    type EasingOptions
} from '@laboralphy/raycaster386/simulation';

export type EasingSpec = EasingName | EasingFunction | string;

function normalize(f: EasingSpec): EasingName | EasingFunction {
    if (typeof f === 'string') {
        // the original module named its curves after private methods : '_linear', '_smoothstep'...
        return f.replace(/^_/, '') as EasingName;
    }
    return f;
}

class Easing extends SimulationEasing {
    static readonly LINEAR: EasingName = 'linear';
    static readonly SMOOTHSTEP: EasingName = 'smoothstep';
    static readonly SMOOTHSTEP_X2: EasingName = 'smoothstepX2';
    static readonly SMOOTHSTEP_X3: EasingName = 'smoothstepX3';
    static readonly SQUARE_ACCEL: EasingName = 'squareAccel';
    static readonly SQUARE_DECCEL: EasingName = 'squareDeccel';
    static readonly CUBE_ACCEL: EasingName = 'cubeAccel';
    static readonly CUBE_DECCEL: EasingName = 'cubeDeccel';
    static readonly CUBE_IN_OUT: EasingName = 'cubeInOut';
    static readonly SINE: EasingName = 'sine';
    static readonly COSINE: EasingName = 'cosine';

    constructor(options: EasingOptions & { use?: EasingSpec } = {}) {
        super({
            ...options,
            use: options.use === undefined ? undefined : normalize(options.use)
        });
    }

    use(f: EasingSpec): this {
        return super.use(normalize(f));
    }

    setFunction(f: EasingSpec): void {
        super.setFunction(normalize(f));
    }
}

export default Easing;
