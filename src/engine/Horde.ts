import { SectorRegistry } from '@laboralphy/raycaster386/simulation';
import Geometry from '@/libs/geometry';
import { SPRITE_DIRECTION_COUNT } from './consts';
import type Entity from './Entity';

/**
 * The entity collection.
 * Entities are thought each tick, their sprites and light sources follow them,
 * and they are filed into logical sectors (one sector per map cell), for tag and door purposes.
 */
class Horde {
    private readonly _entities: Entity[] = [];
    private readonly _sectors = new SectorRegistry<Entity>();

    setMapSize(w: number) {
        this._sectors.setSize(w, w);
    }

    setSectorSize(n: number) {
        this
            ._sectors
            .setCellWidth(n)
            .setCellHeight(n);
    }

    /**
     * checks if an entity is linked into the engine.
     * only linked entities are thinked and rendered
     */
    isEntityLinked(entity: Entity): boolean {
        return this._entities.indexOf(entity) >= 0;
    }

    /**
     * Add an entity into the engine
     * only linked entities are thinked and rendered
     */
    linkEntity(entity: Entity) {
        if (!this.isEntityLinked(entity)) {
            this._entities.push(entity);
        }
    }

    /**
     * Remove an entity from the engine
     * only linked entities are thinked and rendered
     */
    unlinkEntity(entity: Entity) {
        if (entity._sector) {
            entity._sector.remove(entity);
        }
        entity._sector = null;
        const aEntities = this._entities;
        const iEntity = aEntities.indexOf(entity);
        if (iEntity >= 0) {
            aEntities.splice(iEntity, 1);
        }
    }

    /**
     * This will change the animation according to the angle between entity.position.angle and visor.position.angle
     */
    updateLookingAngle(entity: Entity, camera: Entity) {
        if (entity === camera || !entity.sprite) {
            return;
        }
        const oEntityLoc = entity.position;
        const oCameraLoc = camera.position;
        const fTarget = Geometry.angle(oCameraLoc.x, oCameraLoc.y, oEntityLoc.x, oEntityLoc.y);
        let fAngle1 = oEntityLoc.angle + (Math.PI / SPRITE_DIRECTION_COUNT) - fTarget;
        if (fAngle1 < 0) {
            fAngle1 = 2 * Math.PI + fAngle1;
        }
        const nDirection = ((SPRITE_DIRECTION_COUNT * fAngle1 / (2 * Math.PI)) | 0)
            & (SPRITE_DIRECTION_COUNT - 1);
        if (nDirection !== entity.data.backupDirection) {
            entity.data.backupDirection = nDirection;
            // only directional animations (8 facings) can change direction
            // (the original Sprite ignored the call silently, the new one throws)
            if (entity.sprite.facings > 1) {
                entity.sprite.setDirection(nDirection);
            }
        }
    }

    getDeadEntities(): Entity[] {
        return this._entities.filter(e => e.dead);
    }

    get entities(): Entity[] {
        return this._entities;
    }

    process(engine: any) {
        const entities = this._entities;
        const sr = this._sectors;
        const ps = sr.getCellWidth();
        for (let i = 0, l = entities.length; i < l; ++i) {
            const e = entities[i];
            const s = e.sprite;
            const bHasSprite = !!s;
            const eloc = e.position;
            this.updateLookingAngle(e, engine.camera);
            e.think(engine);
            let bChangeLoc = false;
            if (bHasSprite) {
                if (s.x !== eloc.x) {
                    s.x = eloc.x;
                    bChangeLoc = true;
                }
                if (s.y !== eloc.y) {
                    s.y = eloc.y;
                    bChangeLoc = true;
                }
                if (s.h !== eloc.z) {
                    s.h = eloc.z;
                    bChangeLoc = true;
                }
            }
            // if the sprite has moved, or if this is the camera (no sprite)
            // update other position related data (light source, sector)
            // an entity that has never been filed into a sector is filed now.
            if (bChangeLoc || !bHasSprite || !e._sector) {
                // update light source
                if (e.lightsource) {
                    const ls = e.lightsource;
                    ls.x = eloc.x;
                    ls.y = eloc.y;
                }

                // update grid sector
                const xSector = eloc.x / ps | 0;
                const ySector = eloc.y / ps | 0;
                const sector = sr.sector(xSector, ySector);
                if (sector) {
                    if (e._sector !== sector) {
                        if (e._sector) {
                            e._sector.remove(e);
                        }
                        e._sector = sector;
                        sector.add(e);
                    }
                } else {
                    const sSector = '[' + xSector + ' : ' + ySector + ']';
                    throw new Error('ERR_SECTOR_UNRECHABLE: tried to access sector ' + sSector);
                }
            }
        }
    }

    /**
     * Get a list of entities at specified sector
     */
    getEntitiesAt(xSector: number, ySector: number): Entity[] {
        const g = this._sectors;
        const nSize = g.grid.width;
        if (xSector >= 0 && ySector >= 0 && xSector < nSize && ySector < nSize) {
            return g.sector(xSector, ySector).objects.slice();
        } else {
            return [];
        }
    }
}

export default Horde;
