import VengefulThinker from "@/thinkers.d/VengefulThinker";
import LinearBoltThinker from "@/thinkers.d/LinearBoltThinker";
import type { MissileData } from "@/data/types";

/**
 * 1) Le fantôme se dirige en ligne droite vers sa cible, pendant 3 secondes, si la cible se déplace, le fantôme
 * ne corrige pas sa trajectoire
 *
 * 2) le fantome s'arrete pendant 0.75 seconde et un shutter chance est allumé
 *
 * 3) le fantôme tire un projectile vers le joueur
 *
 * 4) le fantôme va en 1)
 *
 * testé le 2023-03-15
 */
class ShooterWalkerThinker extends VengefulThinker {

    constructor() {
        super();
        this.ghostAI.defineStates({
            init: {
                init: ['$followTarget'],
                jump: [{
                    test: '$elapsedTime 3000',
                    state: 'pauseBeforeShoot'
                }]
            },
            pauseBeforeShoot: {
                init: ['$stop', '$shutterChance 1'],
                done: ['$shutterChance 0'],
                jump: [{
                    test: '$isWoundedCritical',
                    state: 'init'
                }, {
                    test: '$elapsedTime 750',
                    state: 'shoot'
                }]
            },
            shoot: {
                init: ['$shoot'],
                jump: [{
                    test: '$elapsedTime 1000',
                    state: 'init'
                }]
            }
        })
    }

    ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES //////
    ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES //////
    ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES ////// STATES //////

    $shoot(): void {
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
}

export default ShooterWalkerThinker
