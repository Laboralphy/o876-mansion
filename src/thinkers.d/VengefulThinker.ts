import GhostThinker from "@/thinkers.d/GhostThinker";
import * as CONSTS from "@/consts";
import Automaton from "@/libs/automaton";
import Geometry from '@/libs/geometry'
import * as RC_CONSTS from '@/engine/consts'
import LinearBoltThinker from "@/thinkers.d/LinearBoltThinker";
import type { MissileData } from "@/data/types";

const PULSE_MAP_LARGE = [4, 3, 2, 1, 2, 3, 2, 1, 0, 1, 2, 1, 0, 1, 0];

/**
 * gt_time_out : renvoie true quand le time out est terminé
 * gt_wounded : renvoie true quand le fantome est bléssé
 * gt_has_teleported: renvoie true quand le fantome vien de se teleporté
 *
 * gs_time_XXX : initialise le timer à XXX millisecondes
 * gs_shutter_chance_on: allume le shutter chance
 * gs_shutter_chance_off: éteint le shutter chance
 *
 */
class VengefulThinker extends GhostThinker {
    _bShutterChance: boolean;
    _bWounded: boolean;
    _ghostAI: Automaton;
    _nGhostTimeOut: number;
    _teleportAnim: number;
    _teleportDestination: { x: number, y: number } | null;


    constructor() {
        super();
        this._ghostAI = new Automaton();
        this._nGhostTimeOut = 0;
        this._bWounded = false;
        this._bShutterChance = false;
        this._teleportDestination = null;
        this._teleportAnim = 0;
        this.automaton.defineStates({
            idle: {
                jump: [{
                    test: '$isTeleportReady',
                    state: 'teleport'
                }, {
                    test: '$isTargetDead',
                    state: 'despawn'
                }, {
                    test: '$isTargetFound',
                    state: 'ghostAI'
                }, {
                    test: '$isTargetNotFound',
                    state: 'teleportNearTarget'
                }]
            },
            teleportNearTarget: {
                init: [
                    '$setTimeOut 1000'
                ],
                done: [
                    '$computeTeleportInSight'
                ],
                jump: [{
                    test: '$isTimeOut',
                    state: 'teleport'
                }]
            },
            ghostAI: {
                init: [
                    '$setTimeOut 250',
                    '$setAnimation walk',
                    '$doGhostAi',
                ],
                loop: [
                    '$pulse',
                    '$move'
                ],
                jump: [{
                    test: '$isTargetHit',
                    state: 'attack'
                }, {
                    test: '$isTimeOut',
                    state: 'idle'
                }]
            },
            attack: {
                init: [
                    '$doAttackTarget',
                    '$setTimeOut 750'
                ],
                jump: [{
                    test: '$isTimeOut',
                    state: 'idle'
                }]
            },
            teleport: {
                init: ['$doTeleportVanish'],
                loop: ['$doTeleportPulse'],
                done: ['$doTeleportMove'],
                jump: [{
                    test: '$isTeleportAnimDone',
                    state: 'spawn'
                }]
            },
            wounded: {
                init: [
                    '$setTimeOut 600',
                    '$rebuke 1'
                ],
                jump: [{
                    test: '$isTimeOut',
                    state: 'idle'
                }]
            },
            woundedCritical: {
                init: [
                    '$setTimeOut 750',
                    '$rebuke 2'
                ],
                jump: [{
                    test: '$isTimeOut',
                    state: 'idle'
                }]
            },
            burning: {
                done: [
                    '$spawnFlame'
                ],
                loop: [
                    '$pulse'
                ],
                jump: [{
                    test: '$isCurrentAnimOver',
                    state: 'despawn'
                }]
            }
        })
        this.setupGhostAI()
    }

    setupGhostAI (): void {
        const gai = this._ghostAI
        gai.events.on('state', ({
            state,
            data
        }) => {
            data._timer = this.engine.getTime()
        })
        gai.events.on('test', ({
           test,
           parameters,
           pass
        }) => {
            const b = this._invoke(test, ...parameters)
            pass(b)
        })
        gai.events.on('action', ({
            action,
            parameters
        }) => {
            this._invoke(action, ...parameters)
        })
        gai.defineStates({
            'init': {}
        })
        gai.initialState = 'init'
    }

    get shutterChance (): boolean {
        return this._bShutterChance;
    }

    set shutterChance (value: boolean) {
        this._bShutterChance = value
    }

    kill(): void {
        this.entity.sprite.setCurrentAnimation('death');
        this.context.game.soundEvent(CONSTS.AUDIO_EVENT_GHOST_DIE, { entity: this.entity })
        this.automaton.state = 'burning';
    }

    wound(bCritical: boolean = false): void {
        if (this.automaton.state !== 'wounded' && this.automaton.state !== 'woundedCritical') {
            this._bWounded = true;
            this.automaton.state = bCritical ? 'woundedCritical' : 'wounded';
        }
    }

    get ghostAI(): Automaton {
        return this._ghostAI;
    }

    /**
     * Choose a location inside the target's cone of visibility
     */
    computeTeleportInsideVisibilityCone (): void {
        const engine = this.engine;
        const target = this.target;
        const targetPos = target.position;
        const rc = engine.raycaster;
        const nDistance = this.getDistanceToTarget();
        const aVisibleSectors = rc
          .visibleFrontCells
          .toArray()
          .map(({ x, y }) => {
              const cc = engine.getCellCenter(x, y)
              return {
                  x,
                  y,
                  distance: Geometry.distance(cc.x, cc.y, targetPos.x, targetPos.y)
              }
          })
          .sort((a, b) => Math.abs(nDistance - a.distance) - Math.abs(nDistance - b.distance))
        if (aVisibleSectors.length > 0) {
            this._teleportDestination = aVisibleSectors[0];
        } else {
            // la cible à le nez collé au mur
            // il va falloir se teleporter derrière son dos
            // ou attendre... de toutes facon le joueur doit bouger au bout d'un moment.
        }
    }

    /**
     * Calculer une destination de téléportation proche
     */
    computeTeleportBehind (): void {
        const engine = this.engine;
        const target = this.target;
        const targetPos = target.position;
        const vCellBehind = targetPos.front(-engine.cellSize * 1.5);
        // test if cell is walkable
        const cc = engine.clipCell(vCellBehind.x, vCellBehind.y);
        if (engine.getCellType(cc.x, cc.y) === RC_CONSTS.PHYS_NONE) {
            this._teleportDestination = cc;
        } else {
            // la cellule derrière la cible n'est pas traversable.
            this._teleportDestination = null;
        }
    }

    compareTargetDistance (n: number): number {
        if (this.target) {
            const n2 = n * n
            const mpos = this.entity.position
            const opos = this.target.position
            return Math.sign(Geometry.squareDistance(mpos.x, mpos.y, opos.x, opos.y) - n2);
        } else {
            throw new Error('this entity has no target')
        }
    }

    ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES //////
    ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES //////
    ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES //////

    $shutterChance (bOn: number): void {
        if (typeof bOn !== 'number') {
            throw new TypeError('$shutterChance needs 1 or 0 as number value')
        }
        this.shutterChance = bOn !== 0;
    }

    /**
     * Etat initialisation
     */
    $init(): void {
        super.$init();
        this.$setAnimation('walk');
    }

    /**
     * Etat : démarrer animation marche
     */
    $setAnimation(sAnim: string): void {
        this.entity.sprite.setCurrentAnimation(sAnim);
    }

    /**
     * The state of "doing nothing"
     * The ghost is pulsating
     */
    $pulse(): void {
        this.pulse();
        this.updateVisibilityData();
    }

    /**
     * the ghost is wounded : set angle to go away from player
     */
    $rebuke(factor: number = 1): void {
        this.moveAwayFromTarget(CONSTS.REBUKE_STRENGTH * factor);
        this.context.game.soundEvent(CONSTS.AUDIO_EVENT_GHOST_WOUNDED, { entity: this.entity })
    }

    /**
     * A blueflame is spawned
     */
    $spawnFlame(): void {
        const p = this.entity.position;
        const oFlame = this.engine.createEntity("o_flame", p);
        this.context.game.soundEvent(CONSTS.AUDIO_EVENT_GHOST_BURN, { entity: oFlame })
    }

    /**
     * the ghost plays an attack animation
     */
    $doAttackTarget(): void {
        this.entity.sprite.setCurrentAnimation('attack');
        this.entity.sprite.getCurrentAnimation().reset();
        // wound player
        this.context.game.commitGhostAttack(this.entity, this.target);
    }


    $computeTeleportInSight(): void {
        this.computeTeleportInsideVisibilityCone();
        this._teleportAnim = 0;
    }

    $teleportBehindTarget(): void {
        this.computeTeleportBehind();
        this._teleportAnim = 0;
    }

    $doTeleportPulse(): void {
        this._nOpacity = PULSE_MAP_LARGE[this._teleportAnim];
        this.setOpacityFlags();
        ++this._teleportAnim;
    }

    $doTeleportVanish(): void {
        this._teleportAnim = 0;
        this._nOpacity = 0;
        this.setOpacityFlags();
    }

    $doTeleportMove(): void {
        if (this._teleportDestination) {
            const { x, y } = this._teleportDestination;
            this.entity.position.set(this.engine.getCellCenter(x, y));
            this._teleportDestination = null;
        }
    }

    $stop(): void {
        this.setSpeed(0, 0)
    }

    $doGhostAi (): void {
        this._ghostAI.process()
    }

    $unwound (): void {
        this._bWounded = false
    }

    $followTarget (nSpeed: number = 1, nAngle: number = 0): void {
        this.moveTowardTarget(nSpeed, nAngle)
    }

    $shoot (): void {
        this.moveTowardTarget(0, 0);
        // tirer un projectile
        const missiles: MissileData[] | MissileData = this.entity.data.missile
        const oMissileData = Array.isArray(missiles)
            ? missiles[Math.floor(Math.random() * missiles.length)]
            : missiles
        const sMissileResRef = oMissileData.resref
        const missile = this.engine.createEntity(sMissileResRef, this.entity.position);
        (missile.thinker as LinearBoltThinker).launch(this.entity, oMissileData);
    }


    ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS //////
    ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS //////
    ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS //////


    /**
     * returns true if this entity hits something (wall or other entity)
     * @return {boolean}
     */
    $hitWall(): boolean {
        return !!this._cwc.wcf.c;
    }

    $isWounded (): boolean {
        const bWounded = this._bWounded;
        this.$unwound();
        return bWounded;
    }

    $isWoundedCritical (): boolean {
        if (this._bWounded && this.shutterChance) {
            this.$unwound()
            return true
        }
        this.$unwound();
        return false;
    }

    /**
     * Tests if dead opacity is depleted
     * @returns {boolean}
     */
    $isCurrentAnimOver(): boolean {
        return this.entity.sprite.getCurrentAnimation().frozen;
    }

    /**
     * The ghost has it player
     */
    $isTargetHit(): boolean {
        const d = this.compareTargetDistance(this.target.size + this.entity.size)
        return d <= 0
    }

    $isTargetDead(): boolean {
        return this.context.game.logic.isPlayerDead();
    }

    $isTargetFound(): boolean {
        return this.isEntityVisible(this.target) && !this.$isTargetDead();
    }

    $isTargetNotFound(): boolean {
        return !this.$isTargetFound();
    }

    $isTargetCloserThan (nDist: number): boolean {
        return this.getDistanceToTarget() < nDist;
    }

    $isTargetFurtherThan (nDist: number): boolean {
        return this.getDistanceToTarget() > nDist;
    }
    $isTeleportReady (): boolean {
        return this._teleportDestination !== null;
    }

    $isTeleportAnimDone (): boolean {
        return this._teleportAnim >= (PULSE_MAP_LARGE.length - 1);
    }

    /**
     * Renvoie true si la durée du state dépasse un certain valeur
     */
    $elapsedTime (n: number): boolean {
        const t = this.engine.getTime()
        return (this._ghostAI.currentStateContext.data._timer as number) + n < t
    }

    $quantumChoice (n: number): boolean {
        const r = Math.random()
        return r < (n / 100)
    }
}

export default VengefulThinker;
