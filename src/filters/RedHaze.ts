import Halo from "@/engine/filters/Halo";
import { Rainbow } from '@laboralphy/rainbow';

class RedHaze extends Halo {
    _color: string;

    constructor() {
        super('#A00');
    }

    /**
     * Builds the halo css color
     * @param r red, 0..255
     * @param g green, 0..255
     * @param b blue, 0..255
     * @param a alpha, 0..255
     */
    _buildColor(r: number, g: number, b: number, a: number) {
        // Rainbow channels are expressed in [0, 1]
        this._color = Rainbow.renderRGBA(Rainbow.fromRGBA({
            r: r / 255,
            g: g / 255,
            b: b / 255,
            a: a / 255
        }));
    }

    buildGradient(canvas: HTMLCanvasElement, color: string): CanvasGradient {
        const g = super.buildGradient(canvas, color);
        g.addColorStop(0.75, color);
        return g;
    }

    process(): void {
        super.process();
        const time = this.elapsed;
        this._buildColor(0xAA, 0, 0, 127 * (Math.sin(time / 160) + 1));
        this.clearGradient();
    }
}

export default RedHaze;