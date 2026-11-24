import MoverThinker from "@/engine/thinkers/MoverThinker";
import * as RC_CONSTS from "@/engine/consts";
import * as CONSTS from "@/consts";
import Geometry from "@/libs/geometry";
import { bresenhamLine } from "@laboralphy/raycaster386";
import type Entity from "@/engine/Entity";
import type Vector from "@/libs/geometry/Vector";

/**
 * Data of an automaton state that has a timer (see setTimeOut / isTimeOut)
 */
export interface TimeOutData {
    timeOut?: number;
}

const PULSE_MAP = [2 ,3, 4, 3];


class GhostThinker extends MoverThinker {
    _nOpacity: number;
    _nTime: number;
    _nTimeOut: number;
    _target: Entity;

    constructor() {
        super();
        this._nOpacity = 0; // indice de transparence 0 = invisible, 1 = 25% alpha ... 4 = 100% opacity
        this._nTime = 0;
        this._nTimeOut = 0;
        this._target = null; // cible designée
        this.automaton.defineStates({
            spawn: {
                init: ['$init', '$spawn'],
                loop: ['$incAlphaToFull'],
                jump: [{
                    test: '$isAlphaFull',
                    state: 'idle'
                }]
            },
            idle: {},
            despawn: {
                loop: ['$decAlphaToZero'],
                jump: [{
                    test: '$isAlphaZero',
                    state: 'dead'
                }]
            },
            dead: {
                init: ['$dead']
            }
        });
        this.automaton.initialState = 'spawn'
    }

    get target(): Entity {
        return this._target;
    }

    set target(value: Entity) {
        this._target = value;
    }

    /**
     * Sets sprites flag according to opacity level
     */
    setOpacityFlags(): void {
        const sprite = this.entity.sprite;
        switch (Math.floor(this._nOpacity)) {
            case 0:
                sprite.removeFlag(RC_CONSTS.FX_ALPHA_25 | RC_CONSTS.FX_ALPHA_50 | RC_CONSTS.FX_ALPHA_75);
                sprite.visible = false;
                break;

            case 1:
                sprite.removeFlag(RC_CONSTS.FX_ALPHA_50 | RC_CONSTS.FX_ALPHA_75);
                sprite.visible = true;
                sprite.addFlag(RC_CONSTS.FX_ALPHA_25);
                break;

            case 2:
                sprite.removeFlag(RC_CONSTS.FX_ALPHA_25 | RC_CONSTS.FX_ALPHA_75);
                sprite.visible = true;
                sprite.addFlag(RC_CONSTS.FX_ALPHA_50);
                break;

            case 3:
                sprite.removeFlag(RC_CONSTS.FX_ALPHA_25 | RC_CONSTS.FX_ALPHA_50);
                sprite.visible = true;
                sprite.addFlag(RC_CONSTS.FX_ALPHA_75);
                break;

            case 4:
                sprite.removeFlag(RC_CONSTS.FX_ALPHA_25 | RC_CONSTS.FX_ALPHA_50 | RC_CONSTS.FX_ALPHA_75);
                sprite.visible = true;
                break;
        }
    }

    /**
     * makes the ghost pulse
     */
    pulse(): void {
        ++this._nTime;
        this._nOpacity = PULSE_MAP[(this._nTime >> 1) & 3];
        this.setOpacityFlags();
    }

    vectorToTarget(): Vector {
        const oGhost = this.entity;
        const oTarget = this.target;
        const vGhostPos = oGhost.position;
        const vTargetPos = oTarget.position;
        return vTargetPos.vector().sub(vGhostPos.vector());
    }

    /**
     * sets the moving angle, so the ghost may chase the target
     */
    lookAtTarget(): void {
        this.entity.position.angle = this.vectorToTarget().angle();
    }

    /**
     * Define a speed vector with an angle modifier
     * @param fSpeedMod {number} speed modifier (scale)
     * @param fAngleMod {number}
     */
    moveTowardTarget(fSpeedMod: number = 1, fAngleMod: number = 0): void {
        this.lookAtTarget();
        const ms = this.entity.data.speed * fSpeedMod;
        const a = this.entity.position.angle + fAngleMod;
        this.setSpeed(
            ms * Math.cos(a),
            ms * Math.sin(a)
        );
    }

    moveAwayFromTarget(ms: number): void {
        this.lookAtTarget();
        const a = this.entity.position.angle;
        this.setSpeed(
            -ms * Math.cos(a),
            -ms * Math.sin(a)
        );
    }
    /**
     * get the distance beetwen target and ghost
     */
    getDistanceToTarget(): number {
        return this.vectorToTarget().length();
    }

    $move(): void {
        this.pulse();
        this.updateVisibilityData();
        super.$move();
    }

    rebuke(): void {
        this.pulse();
        let m = this.entity;
        m.inertia.set(0, 0);
        this.slide(this._speed);
        this._speed.scale(0.9);
    }

    /**
     * définit le timer de l'état automate spécifié
     * @param scd automaton state data
     * @param n delay (ms)
     */
    setTimeOut(scd: TimeOutData, n: number): void {
        scd.timeOut = this.engine.getTime() + n;
    }

    /**
     * renvoie true si le timer interne de l'etat automate spécifié est dépassé
     * @return {boolean}
     * @param scd automaton state data
     */
    isTimeOut(scd: TimeOutData): boolean {
        const nEngineTime = this.engine.getTime()
        const nTimeOut = scd.timeOut || Infinity
        return nTimeOut <= nEngineTime
    }

    /**
     * Updates ghost visibility data
     * That means, all data aimed at resolving how many energy a ghost worth
     */
    updateVisibilityData(): void {
        const entity = this.entity;
        if (!('visibility' in entity.data)) {
            entity.data.visibility = {
                visible: false, // ghost is visible (even partially) ?
                offset: 0, // last rendered position of the ghost sprite
                size: 0, // apparent size of ghost
                distance: 0, // distance from player to ghost
            };
        }
        const vis = entity.data.visibility;
        // visible or not visible ?
        const bVisible = vis.visible = !!entity.sector && this.engine.raycaster.visibleCells.isMarked(entity.sector.x, entity.sector.y);
        if (!bVisible) {
            // no need to proceed
            return;
        }
        // distance from player to ghost
        const oPlayerPos = this.target.position;
        const oGhostPos = entity.position;
        vis.distance = Geometry.distance(oPlayerPos.x, oPlayerPos.y, oGhostPos.x, oGhostPos.y);

        // ghost position on screen
        const r = entity.sprite.lastRendered;
        vis.offset = r.dx;
        vis.size = r.dw;
    }

    testSolid(x: number, y: number): boolean {
        return !this.testWalkable(x, y);
    }

    testWalkable(x: number, y: number): boolean {
        const c = this.context.game.engine.getCellType(x, y);
        return c === RC_CONSTS.PHYS_NONE;
    }


    /**
     * Renvoie true si le sujet peut voir la cible.
     * pour que la fonction renvoie true il faut que le sujet puisse voir la cible
     * ceci prend en compte l'invisibilité de la cible,
     * le niveau de detection et l'aveuglement du sujet,
     * les obstacle muraux qui cacheraient éventuellement la cible
     * Si on spécifié les coordonnées d'une secteur, celui ci sera utilisée
     * sinon on utilisera le secteur du mobile
     * @param oTarget cible qu'on cherche à voir
     * @return boolean
     */
    isEntityVisible(oTarget: Entity): boolean {
        const oMe = this.entity;
        const xMe = oMe.sector.x;
        const yMe = oMe.sector.y;
        if (!this.testWalkable(xMe, yMe)) {
            return false;
        }
        const xTarget = oTarget.sector.x;
        const yTarget = oTarget.sector.y;
        return bresenhamLine(
            xMe,
            yMe,
            xTarget,
            yTarget,
            (x, y) => this.testWalkable(x, y));
    }

    ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES //////
    ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES //////
    ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES //////

    $init(): void {
    }

    $spawn(): void {
        // décider de la marche à suivre
        // un spectre va toujours se déplacer en ligne droite, ou bien rester immobile
        // - déterminer le point d'apparition et le point de destination
        const entity = this.entity;
        const {x, y} = entity.position;
        this.setLocation(x, y);
        this.updateVisibilityData();
        this._nOpacity = 0;
        this.setOpacityFlags();
        this.elapsedTime = 0;
    }

    /**
     * The ghost is spawning, the alpha prop is increasing
     */
    $incAlphaToFull(): void {
        this._nOpacity += 0.5;
        this.setOpacityFlags();
    }

    /**
     * The ghost is vanishing
     */
    $decAlphaToZero(): void {
        this._nOpacity -= 0.5;
        this.setOpacityFlags();
    }

    /**
     * The ghost will cease to exist
     */
    $dead(): void {
        if (!this.entity.dead) {
            this.entity.dead = true;
        }
    }

    $setTimeOut(n: number): void {
        this.setTimeOut(this.automaton.currentStateContext.data as TimeOutData, n)
    }

    ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS //////
    ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS //////
    ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS //////

    /**
     * tests if sprite has reach full opacity
     * @returns {boolean}
     */
    $isAlphaFull(): boolean {
        return this._nOpacity >= 4;
    }

    $isAlphaZero(): boolean {
        return this._nOpacity <= 0;
    }

    /**
     * returns true if the time is out
     * @returns {boolean}
     */
    $isTimeOut(): boolean {
        return this.isTimeOut(this.automaton.currentStateContext.data as TimeOutData)
    }
}


export default GhostThinker;
