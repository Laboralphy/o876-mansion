import AbstractFilter from "@/libs/filters/AbstractFilter";
import CanvasHelper from "@/libs/canvas-helper";
import Easing from "@/libs/easing";
import type { Renderer } from "@laboralphy/raycaster386";
import type Engine from "@/engine/Engine";

/** Effet graphique temporisé
 * O876 Raycaster project
 * @class AmbientLight
 * @extends AbstractFilter
 * @date 2012-01-01
 * @author Raphaël Marandet
 *
 * Change graduellement le gradient de luminosité ambiente.
 */
class AmbientLight extends AbstractFilter {
    _oEasing: Easing;
    _rc: Renderer;
    _timeFactor: number;

    constructor ({
        engine
    }: { engine: Engine }) {
        super()
        this._oEasing = new Easing()
        this._rc = engine.raycaster
        this._timeFactor = engine._TIME_INTERVAL
    }

    setLight (nLight: number, t: number): void {
        if (nLight > 0 && t > 0) { // was "x > 0" : "x" was undefined
            this._oEasing
                .from(this._rc.shadingFactor)
                .to(nLight)
                .steps(t * this._timeFactor / 1000 | 0)
                .use('smoothstep');
        }
    }

    process (): void {
        const e = this._oEasing
        e.compute()
        if (e.over()) {
            this.terminate()
        }
    }

    render (canvas: HTMLCanvasElement): void {
        const x = this._oEasing.x;
        if (x > 0) {
            const rc = this._rc;
            rc.shadingFactor = x | 0;
            if (rc.storey) {
                rc.storey.shadingFactor = x | 0;
            }
        }
    }
}

export default AmbientLight
