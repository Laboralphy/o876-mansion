import MissileThinker from "@/engine/thinkers/MissileThinker";
import Blindness from "@/filters/Blindness";
import Timed from "@/engine/filters/Timed";
import Confusion from "@/filters/Confusion";
import type Entity from "@/engine/Entity";
import type { MissileData } from "@/data/types";

const DEFAULT_MISSILE_SPEED = 10
const DEFAULT_MISSILE_EFFECT = 'damage'
const DEFAULT_MISSILE_EFFECT_DURATION = 3000

class LinearBoltThinker extends MissileThinker {
    _missileData: MissileData;

    /**
     * Configures the bolt with the ghost missile data, then fires it
     * @param owner entity that shoots the bolt
     * @param missileData missile definition (data/ghosts)
     */
    launch(owner: Entity, missileData: MissileData): void {
        this._missileData = missileData
        const missile = this.entity;
        missile.sprite.setCurrentAnimation('fly');
        this.fire(owner, this._missileData.speed || DEFAULT_MISSILE_SPEED);
    }

    applyDamage (entity: Entity, nMult: number = 1): void {
        if (nMult > 0) {
            this.context.game.commitGhostAttack(this._owner, entity, nMult)
        }
    }

    applyBlindness (entity: Entity): void {
        // rechercher s'il existe déja un blindness
        const aPrevBlindFilters = this.engine.filters.filters.filter(f => (f instanceof Timed) && f.child instanceof Blindness)
        aPrevBlindFilters.forEach(f => f.terminate())
        const oBlind = new Blindness()
        const oTime = new Timed({ child: oBlind, duration: this._missileData.duration || DEFAULT_MISSILE_EFFECT_DURATION })
        this.engine.filters.link(oTime)
    }

    applyConfusion (entity: Entity): void {
        const aPrevConfFilters = this.engine.filters.filters.filter(f => (f instanceof Timed) && f.child instanceof Confusion)
        aPrevConfFilters.forEach(f => f.terminate())
        const oConf = new Confusion()
        const oTime = new Timed({ child: oConf, duration: this._missileData.duration || DEFAULT_MISSILE_EFFECT_DURATION })
        this.engine.filters.link(oTime)
    }

    applyEffect (entity: Entity): void {
        const sEffect = this._missileData.effect || DEFAULT_MISSILE_EFFECT
        switch (sEffect) {
            case 'damage': {
                this.applyDamage(entity, this._missileData.damage || 1)
                break;
            }

            case 'blindness': {
                this.applyBlindness(entity)
                break;
            }

            case 'confusion': {
                this.applyConfusion(entity)
                break;
            }
        }
    }

    $setExplosionAnimation(): void {
        this.entity.sprite.setCurrentAnimation('explode', 0);
        const aEntities = this.getCollidingEntities()
        if (Array.isArray(aEntities)) {
            aEntities.forEach(e => {
                this.applyEffect(e)
            })
        }
    }
}

export default LinearBoltThinker;
