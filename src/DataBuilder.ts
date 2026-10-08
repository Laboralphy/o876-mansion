import type { RceBlueprint } from '@laboralphy/raycaster386';
import type { GhostEntry } from '@/data/types';

/**
 * Builds blueprints out of wraith and ghost definitions
 * (not used : Game.getCompiledBlueprints does this job)
 */
class DataBuilder {
    /**
     * @param aWraiths wraith ids (the id is also the tileset id)
     */
    static buildWraithBlueprints(aWraiths: string[]): RceBlueprint[] {
        return aWraiths.map(w => ({
            "id": w,
            "ref": w,
            "tileset": w,
            "scale": 3,
            "thinker": "WraithThinker",
            "size": 16,
            "fx": ["@FX_LIGHT_ADD", "@FX_LIGHT_SOURCE"],
            "data": {
                "type": "w"
            }
        }))
    }

    /**
     * @param aGhosts ids of the ghosts to build
     * @param data all the ghost definitions
     */
    static buildGhostBlueprints(aGhosts: string[], data: GhostEntry[]): RceBlueprint[] {
        return aGhosts
            .map(id => {
                return data.find(d => d.id == id);
            })
            .map(({id, thinker, speed, vitality, power, score, level, missile, soundset}) => ({
            id,
            ref: id,
            tileset: id,
            scale: 3,
            thinker: thinker + 'Thinker',
            size: 16,
            fx: ["@FX_LIGHT_ADD", "@FX_LIGHT_SOURCE"],
            data: {
                type: "v",
                speed,
                vitality,
                power,
                score,
                level,
                missile,
                soundset
            }
        }));
    }
}

export default DataBuilder;
