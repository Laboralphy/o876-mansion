import { defineStore } from 'pinia';
import state from './state';
import * as TYPES from './mutation-types';
import type { ValuePayload } from '../payloads';

export const useVisorStore = defineStore('visor', {
    state,

    getters: {
        getCameraEnergy: state => state.energy.value,
        getCameraEnergyMax: state => state.energy.maximum,
        getCameraLastShotTime: state => state.lastShotTime,
        getCameraCaptureRadius: state => state.captureRadius,
        getCameraWidth: state => state.width,
        getCameraPower: state => state.power,
        isCameraAimingSupernatural: state => state.sensor.supernatural,
        getCameraSensorLamp: state => state.sensor.lamp,
        getCameraCriticalModifier: state => state.criticalModifier
    },

    actions: {
        /**
         * Increase visor charged energy
         */
        [TYPES.INC_ENERGY]({amount}: { amount: number }) {
            const e = this.energy;
            e.rate = amount;
            e.value = Math.min(e.maximum, e.value + e.rate);
        },

        /**
         * Decrease visor charged energy
         */
        [TYPES.DEC_ENERGY]() {
            const e = this.energy;
            e.value = Math.max(0, e.value - e.depleteRate);
        },

        /**
         * Deplete charged energy : set energy to 0
         */
        [TYPES.DEPLETE_ENERGY]() {
            this.energy.value = 0;
        },

        [TYPES.SET_SHOOT_LAST_TIME]({time}: { time: number }) {
            this.lastShotTime = time;
        },

        [TYPES.SET_CAMERA_WIDTH]({value}: ValuePayload<number>) {
            this.width = value;
        },

        [TYPES.AIMING_SUPERNATURAL]({value}: ValuePayload<boolean>) {
            this.sensor.supernatural = value;
        },

        [TYPES.SET_CAMERA_LAMP]({value}: ValuePayload<number>) {
            // the original mutation wrote into "state.sensor.lamp.intensity.aim", but "lamp" is a number
            // and this mutation is never committed.
            this.sensor.lamp = value;
        }
    }
});
