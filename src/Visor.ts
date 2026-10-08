import * as MUTATIONS from '@/stores/visor/mutation-types';
import StoreAbstract from "@/StoreAbstract";
import RangeCollider from "@/libs/range-collider";
import * as Interpolator from "@/libs/interpolator";
import * as CONSTS from "@/consts";
import type { Pinia } from 'pinia';
import type Entity from '@/engine/Entity';
import type VengefulThinker from '@/thinkers.d/VengefulThinker';

/**
 * How a ghost is seen by the camera, updated each tick by GhostThinker.updateVisibilityData
 * (stored in entity.data.visibility)
 */
export interface GhostVisibility {
    visible: boolean; // ghost is visible (even partially)
    offset: number; // last rendered position (x) of the ghost sprite on screen
    size: number; // apparent size (width) of the ghost on screen
    distance: number; // distance from player to ghost
}

/**
 * How much a ghost is worth, if photographed now
 */
export interface GhostScore {
    entity: Entity;
    value: number; // 0 (no value) to 1 (maximum possible value)
    precision: number; // 0..1 : how close to the center of the camera
    distance: number;
    proximity: number; // 0..1 : how close to the optimal distance
}

/**
 * What changed when updating the camera energy
 */
export interface CameraEnergyUpdate {
    sn: boolean; // the camera has just started aiming at something supernatural
    max: boolean; // energy is at its maximum
    prev: number; // energy before update
    curr: number; // energy after update
}

class Visor extends StoreAbstract<'visor'> {
    _rcCam: RangeCollider;

    constructor(store: Pinia) {
        super('visor');
        this.store = store;
        this._rcCam = new RangeCollider();
    }

    /**
     * tech : updates visor width, so the ghost score may be correctly computed.
     * @param value camera width, in pixels
     */
    updateCameraWidth(value: number) {
        this.commit(MUTATIONS.SET_CAMERA_WIDTH, {value});
    }

    /**
     * Keep a value between 0 and 1
     * @param value input
     * @return output
     */
    static _min_0_max_1(value: number): number {
        return Math.max(0, Math.min(1, value));
    }

    /**
     *
     * @param value input
     * @param val0 value when output is 0
     * @param val1 value when output is 1
     * @return output
     */
    static _linear_0_1(value: number, val0: number, val1: number): number {
        return Visor._min_0_max_1(Interpolator.linear(value, val0, 0, val1, 1));
    }

    /**
     * Gets how much energy a ghost worth
     * and how many points the ghost photo will score
     * @param entity a ghost
     */
    getGhostScore(entity: Entity): GhostScore {
        if (!entity.data.visibility) {
            return {
                entity,
                value: 0,
                precision: 0,
                distance: Infinity,
                proximity: 0
            };
        }
        const {visible, size, offset, distance}: GhostVisibility = entity.data.visibility;
        if (!visible) {
            return {
                entity,
                value: 0,
                precision: 0,
                distance: Infinity,
                proximity: 0
            };
        }
        // the radius is a factor of CAMERA_CIRCLE_SIZE
        const rcCam = this._rcCam;
        const wCamera = this.prop('getCameraWidth') >> 1;
        const xGhost = offset + (size / 2);
        const radius = wCamera * this.prop('getCameraCaptureRadius') * CONSTS.CAMERA_CIRCLE_SIZE;
        rcCam.setRange(wCamera - radius, wCamera + radius);
        const nInnerEnergy = rcCam.getCenterRelic(offset, offset + size);
        const nOuterEnergy = rcCam.getLeftRelic(offset, offset + size) + rcCam.getRightRelic(offset, offset + size);

        // quelle proportion d'energy à l'intérieur ?
        const bAllInside = nInnerEnergy > 0 && nOuterEnergy === 0;
        // si tout le fantome est dans le cercle de capture : 1 sinon entre 0 et 1
        const fFactor = bAllInside ? 1 : nInnerEnergy / (radius * 2);
        const fPrecision = Visor._linear_0_1(Math.abs(wCamera - xGhost), radius, 0);
        const fProximity = distance < CONSTS.CAMERA_OPTIMAL_DISTANCE
            ? 1
            : Visor._linear_0_1(distance, CONSTS.CAMERA_MAXIMAL_DISTANCE, CONSTS.CAMERA_OPTIMAL_DISTANCE);
        return {
            entity,
            value: fFactor * fPrecision * fProximity,
            precision: fPrecision,
            distance,
            proximity: fProximity
        };
    }

    /**
     * Damage currently aimed ghosts
     * @param entity a hostile ghost (its thinker is a VengefulThinker)
     * @param amount photo score of the ghost
     * @returns damage dealt
     */
    damageGhost(entity: Entity, amount: number): number {
        const thinker = entity.thinker as VengefulThinker;
        const fCrit = thinker.shutterChance ? this.prop('getCameraCriticalModifier') : 1;
        const nDamage = Math.ceil(
            amount *
            this.prop('getCameraEnergy') *
            this.prop('getCameraPower') *
            fCrit / 100
        );
        entity.data.vitality -= nDamage;
        if (entity.data.vitality <= 0) {
            thinker.kill();
        } else {
            thinker.wound(thinker.shutterChance);
        }
        return nDamage;
    }

    /**
     * Change visor energy indicator to match the store value
     * @param aGhosts ghosts that are actually being aimed by the visor
     * @param bSupernatural true : the camera is aiming at a supernatural phenomenon
     */
    updateCameraEnergy(aGhosts: GhostScore[], bSupernatural: boolean): CameraEnergyUpdate {
        const nEnergy = aGhosts.reduce((prev: number, curr: GhostScore) => {
            return prev + curr.value;
        }, 0);
        const nPrevEnergy = this.energy
        if (nEnergy > 0) {
            this.commit(MUTATIONS.INC_ENERGY, {amount: nEnergy});
        } else {
            this.commit(MUTATIONS.DEC_ENERGY);
        }
        const nNewEnergy = this.energy
        const bPrevSupernatural = this.aimingSupernatural
        this.commit(MUTATIONS.AIMING_SUPERNATURAL, {value: bSupernatural});
        return {
            sn: !bPrevSupernatural && bSupernatural,
            max: nNewEnergy === this.energyMax,
            prev: nPrevEnergy,
            curr: nNewEnergy
        }
    }

    /**
     * all camera indicators are shutdown, so the camera may be dropped silently
     * and the next time the camera is raised, the indicator won't be uninitialized (which greatly annoys me)
     */
    shutdownCameraIndicators() {
        this.commit(MUTATIONS.DEPLETE_ENERGY);
        this.commit(MUTATIONS.AIMING_SUPERNATURAL, {value: false});
    }

    /**
     * returns the currently accumulated energy (by aiming at ghosts)
     */
    get energy(): number {
        return this.prop('getCameraEnergy');
    }

    /**
     * Return the maximum value of energy accumulation
     */
    get energyMax(): number {
        return this.prop('getCameraEnergyMax');
    }

    /**
     * returns true if the camera is aiming at some supernatural thing
     */
    get aimingSupernatural(): boolean {
        return this.prop('isCameraAimingSupernatural');
    }

    /**
     * returns the last time stamp, the camera has shot
     * to limit rate of fire
     */
    get lastShotTime(): number {
        return this.prop('getCameraLastShotTime');
    }

    depleteEnergy() {
        this.commit(MUTATIONS.DEPLETE_ENERGY);
    }

    setShootLastTime(time: number) {
        this.commit(MUTATIONS.SET_SHOOT_LAST_TIME, {time});
    }
}

export default Visor;
