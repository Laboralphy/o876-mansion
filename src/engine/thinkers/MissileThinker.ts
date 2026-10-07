import TangibleThinker from "@/engine/thinkers/TangibleThinker";
import Geometry from "@/libs/geometry";
import * as CONSTS from "@/engine/consts";
import type Entity from "@/engine/Entity";

/**
 * This thinker is specialized for missile entities
 * it typically has an owner, an entity that fired the missile.
 */
class MissileThinker extends TangibleThinker {
    _bCrashWall: boolean;
    _owner: Entity;
    _speedNorm: number;
    _victims: Entity[];

    constructor() {
        super();
        this._owner = null;
        this._speedNorm = 0;
        this._bCrashWall = true;
        this._victims = []; // list of entities that have been hit
        this.automaton.defineStates({
            "main": {
                init: ["$init"],
                jump: [{
                    state: "firing"
                }]
            },
            "firing": {
                loop: ['$move'],
                jump: [
                    {
                        test: '$isOutsideOwner',
                        state: 'moving'
                    }
                ]
            },
            'moving': {
                init: ['$becomeFullSolid'],
                loop: ['$move'],
                jump: [
                    {
                        test: '$hitSomething',
                        state: 'hit'
                    }
                ]
            },
            'hit': {
                init: ['$setExplosionAnimation'],
                jump: [
                    {
                        test: '$isExplosionFinished',
                        state: 'dead'
                    }
                ]
            },
            dead: {
                init: ['$dead']
            }
        });
    }

    /**
     * Positionnement du missile devant le owner
     * @param owner entity that fires the missile
     * @param speed missile speed
     */
    fire(owner: Entity, speed: number): void {
        // sets the owner
        this._owner = owner;

        // prepare data
        const oOwnerLocation = owner.position;
        const missile = this.entity;
        const dummy = missile.dummy;

        // define tangibility
        dummy.tangibility.self = CONSTS.COLLISION_CHANNEL_MISSILE;
        dummy.tangibility.hitmask = 0;

        // synchronize position
        missile.position.set(oOwnerLocation);

        // set proper speed vector
        this._speedNorm = speed;
        this.setAngle(oOwnerLocation.angle)
    }

    setAngle (a: number): void {
        this.entity.position.angle = a
        const {dx, dy} = Geometry.polar2rect(a, this._speedNorm);
        this.setSpeed(dx, dy);
    }


    /**
     * retrieve a list of dummies that collides with this entity
     * does not include owner
     */
    getCollidingEntities(): Entity[] {
        // the smasher files entities as smashers (opaque for the dummy) : owner is expelled from the list
        return (this.entity.dummy.smashers as Entity[]).filter(e => e !== this._owner);
    }

    ////// STATES ///// STATES ///// STATES ///// STATES ///// STATES ///// STATES ///// STATES ///// STATES /////
    ////// STATES ///// STATES ///// STATES ///// STATES ///// STATES ///// STATES ///// STATES ///// STATES /////
    ////// STATES ///// STATES ///// STATES ///// STATES ///// STATES ///// STATES ///// STATES ///// STATES /////

    // the missile is not colliding with owner :
    // the missile becomes solid and will hit any other entity.
    $becomeFullSolid(): void {
        this.entity.dummy.tangibility.hitmask = CONSTS.COLLISION_CHANNEL_CREATURE;
    }

    // The missile has hit something
    $dead(): void {
        this.entity.dead = true;
    }



    ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS //////
    ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS //////
    ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS ////// TRANSITIONS //////

    // true if missile is not colliding owner
    $isOutsideOwner(): boolean {
        // calculer la distance entre owner et missile
        const m = this.entity;
        const o = this._owner;
        const mpos = m.position;
        const opos = o.position;
        return Geometry.distance(mpos.x, mpos.y, opos.x, opos.y) > (o.size + m.size);
    }

    /**
     * returns true if this entity hits something (wall or other entity)
     * @return {boolean}
     */
    $hitSomething(): boolean {
        const bHitWall = !!this._cwc.wcf.c;
        const aHitters = this.getCollidingEntities();
        const bHitThing = !!aHitters && aHitters.length > 0;
        return bHitThing || bHitWall;
    }

    /**
     * returns true if the current sprite animation is finished
     * @return {boolean}
     */
    $isExplosionFinished(): boolean {
        return this.entity.sprite.getCurrentAnimation().frozen;
    }
}

export default MissileThinker;