import AbstractFilter from '@/libs/filters/AbstractFilter';

/**
 * @class Halo
 *
 * @description this filter adds a colored circular halo around the screen.
 * This is useful in game where the ambiance needs to be darker (a black colored halo).
 * You must must specify a color.
 *
 */
class Halo extends AbstractFilter {
    _color: string;
    _gradient: CanvasGradient;


    /**
     * The constructor accepts a color for the halo
     * @param color {string}
     */
    constructor(color: string = 'black') {
        super();
        this._gradient = null;
        this._color = color;
    }

    buildGradient(canvas: HTMLCanvasElement, color: string): CanvasGradient {
        const context = canvas.getContext('2d');
        const w2 = canvas.width >> 1;
        const h2 = canvas.height >> 1;
        const radius = Math.sqrt(w2 * w2 + h2 * h2) | 0;
        const grad = context.createRadialGradient(w2, h2, h2, w2, h2, radius);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, color);
        return grad;
    }

    process(time?: number): void {
        super.process(time);
    }

    clearGradient(): void {
        this._gradient = null;
    }

    render(canvas: HTMLCanvasElement): void {
        if (this._gradient === null) {
            this._gradient = this.buildGradient(canvas, this._color);
        }
        super.render(canvas);
        const context = canvas.getContext('2d');
        context.save();
        context.fillStyle = this._gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();
    }
}

export default Halo;