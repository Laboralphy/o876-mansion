import LinearBoltThinker from "@/thinkers.d/LinearBoltThinker";
import type GhostThinker from "@/thinkers.d/GhostThinker";
import type Vector from "@/libs/geometry/Vector";

class HomingBoltThinker extends LinearBoltThinker {
    ANGLE_TURNING: number;

    constructor () {
        super()
        this.ANGLE_TURNING = 0.05
    }

    $move(): void {
        super.$move()
        const nAngle = this.vectorToTarget().angle()
        // essayer de reduire cet angle
        this.setAngle(this.getAngleToTarget(nAngle))
    }

    getAngleToTarget(fTarget: number): number {
        const m = this.entity;
        let fMe = m.position.angle;
        while (fTarget < 0) {
            fTarget += 2 * Math.PI;
            fMe += 2 * Math.PI;
        }
        // notre angle est fMe
        // il faudrait tourner vers fTarget
        if (Math.abs(fMe - fTarget) <= this.ANGLE_TURNING) {
            return fTarget
        }
        if (fMe < fTarget) {
            return fMe + this.ANGLE_TURNING
        }
        if (fMe > fTarget) {
            return fMe - this.ANGLE_TURNING
        }
        return fMe
    }

    vectorToTarget(): Vector {
        const oSelf = this.entity;
        const oOwner = this._owner
        const oTarget = (oOwner.thinker as GhostThinker).target
        const vSelf = oSelf.position
        const vTarget = oTarget.position
        return vTarget.vector().sub(vSelf.vector());
    }

}


export default HomingBoltThinker;
