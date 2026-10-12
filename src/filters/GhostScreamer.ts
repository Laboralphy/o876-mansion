import AbstractFilter from "@/libs/filters/AbstractFilter";
import type { Sprite } from "@laboralphy/raycaster386";
import type Entity from "@/engine/Entity";

/**
 * A screaming ghost : its sprite is drawn bigger and bigger, fading out
 */
type ScreamingGhost = {
    time: number,
    sprite: Sprite,
    x: number,
    y: number,
    w: number,
    h: number
};

/**
 * Makes ghost screeam
 */

class GhostScreamer extends AbstractFilter {
    TIME_OUT: number;
    _aGhosts: ScreamingGhost[];

    constructor() {
        super();
        this._aGhosts = [];
        this.TIME_OUT = 25;
    }

    addGhost(oGhost: Entity): void {
        const g: ScreamingGhost = {
            time: 0,
            sprite: oGhost.sprite,
            x: 0,
            y: 0,
            w: 0,
            h: 0
        };
        this._aGhosts.push(g);
    }

    process(): void {
        let timeout = this.TIME_OUT;
        if (this._aGhosts.length > 0) {
            this._aGhosts = this._aGhosts.filter(g => {
                const x =  g.time / timeout;
                const x1 = 1 + x;
                const r = g.sprite.lastRendered;

                g.w = r.dw * x1 | 0;
                g.h = r.dh * x1 | 0;
                g.x = r.dx - ((g.w - r.dw) >> 1);
                g.y = r.dy - ((g.h - r.dh) >> 1);
                return (++g.time) < timeout;
            });
        }
    }

    render(oCanvas: HTMLCanvasElement): void {
        let ghosts = this._aGhosts;
        if (ghosts.length >= 0) {
            let oContext = oCanvas.getContext('2d');
            const fAlpha = oContext.globalAlpha, gco = oContext.globalCompositeOperation;
            oContext.globalCompositeOperation = 'lighter';
            for (let i = 0, l = ghosts.length; i < l; ++i) {
                const g = ghosts[i];
                const r = g.sprite.lastRendered;
                const x = g.time / this.TIME_OUT;
                oContext.globalAlpha = 1 - (x * x);
                r.tileset
                    .drawTile(
                        oContext,
                        r.sx,
                        r.sy,
                        r.sw,
                        r.sh,
                        g.x,
                        g.y,
                        g.w,
                        g.h
                    );
            }
            oContext.globalCompositeOperation = gco;
            oContext.globalAlpha = fAlpha;
        }
    }
}


export default GhostScreamer;
