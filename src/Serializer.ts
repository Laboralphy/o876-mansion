import type Game from '@/Game';
import type { DoorManagerStateEntry } from '@laboralphy/raycaster386/simulation';
import type {
    AlbumLogicState,
    DecalMutation,
    PlayerState,
    SerializedLevelState
} from '@/types';

const SERIAL_VERSION = 1;

class Serializer {

    /**
     * JSON.stringify replacer : Infinity is not valid json
     */
    static censor(key: string, value: unknown): unknown {
        return value === Infinity  ? "Infinity" : value;
    }

    /**
     * JSON.parse reviver, see censor()
     */
    static uncensor(key: string, value: unknown): unknown {
        return value === "Infinity"  ? Infinity : value;
    }

    /**
     * Door phases. The door policy (@laboralphy/raycaster386/simulation) serializes its contexts itself
     */
    static getDoorManagerState(g: Game): DoorManagerStateEntry[] {
        return g.engine.getDoorManagerState();
    }

    static setDoorManagerState(g: Game, state: DoorManagerStateEntry[]) {
        g.engine.setDoorManagerState(state);
    }


    static getDecalState(g: Game): DecalMutation[] {
        return g._mutations.decals.slice(0);
    }

    /**
     * This function should only be used right after loading level.
     * @param g
     * @param state decal mutations to replay
     */
    static setDecalState(g: Game, state: DecalMutation[]) {
        g._mutations.decals = [];
        state.forEach(data => {
            switch (data.op) {
                case 'del':
                    g.removeDecals(data.x, data.y, data.sides);
                    break;

                case 'rot':
                    g.rotateDecals(data.x, data.y, data.cw);
                    break;

                case 'app':
                    g.applyDecal(data.x, data.y, data.sides, data.ref);
                    break;
            }
        });
    }

    static getPlayerState(g: Game): PlayerState {
        const {x, y, angle} = g.player.position;
        return {x, y, angle};
    }

    static setPlayerState(g: Game, state: PlayerState) {
        g.player.position.set({
            x: state.x,
            y: state.y,
            angle: state.angle
        });
    }

    static saveLevelState(g: Game): string {
        const engine = g.engine;
        const oState: SerializedLevelState = {
            version: SERIAL_VERSION,
            type: 'level',
            level: g._mutations.level,
            doors: Serializer.getDoorManagerState(g),
            time: engine.getTime(),
            locks: engine.doors.locks.state,
            decals: Serializer.getDecalState(g),
            tags: engine.tagManager.grid.state,
            senses: g._senseMap.state,
            player: Serializer.getPlayerState(g)
        };
        return JSON.stringify(oState, Serializer.censor);
    }

    /**
     * @param g
     * @param state a state produced by saveLevelState
     */
    static async restoreLevelState(g: Game, state: string) {
        const oState: SerializedLevelState = JSON.parse(state, Serializer.uncensor);
        if (oState.version !== SERIAL_VERSION) {
            throw new Error('unexpected version number while restoring game state - expected v' + SERIAL_VERSION + ' - got v' + oState.version);
        }
        if (oState.type !== 'level') {
            throw new Error('unexpected state type while restoring game state - expected "level" - got "' + oState.type + '"');
        }
        const engine = g.engine;
        g.exitUI();
        await g.loadLevel(oState.level);
        Serializer.setDoorManagerState(g, oState.doors);
        Serializer.setDecalState(g, oState.decals);
        engine.tagManager.grid.state = oState.tags;
        engine.setTime(oState.time);
        engine.doors.locks.state = oState.locks;
        g._senseMap.state = oState.senses;
        Serializer.setPlayerState(g, oState.player);
        // g.logic.commit('SET_STATE_CONTENT', {content: oState.logic});
        // g.album.commit('SET_STATE_CONTENT', {content: oState.album});
    }

    static restoreAlbumLogicState(g: Game, oState: AlbumLogicState) {
        g.logic.commit('SET_STATE_CONTENT', {content: oState.logic});
        g.album.commit('SET_STATE_CONTENT', {content: oState.album});
    }

    static saveAlbumLogicState(g: Game): AlbumLogicState {
        return {
            logic: g.logic.prop('getStateContent'),
            album: g.album.prop('getStateContent')
        };
    }

    //
    // static saveState(g) {
    //     const engine = g.engine;
    //     const oState = {
    //         version: SERIAL_VERSION,
    //         level: g._mutations.level,
    //         doors: Serializer.getDoorManagerState(g),
    //         time: engine.getTime(),
    //         locks: engine.doors.locks.state,
    //         decals: Serializer.getDecalState(g),
    //         tags: engine.tagManager.grid.state,
    //         senses: g._senseMap.state,
    //         logic: g.logic.prop('getStateContent'),
    //         album: g.album.prop('getStateContent'),
    //         player: Serializer.getPlayerState(g)
    //     };
    //     return JSON.stringify(oState, Serializer.censor);
    // }
    //
    // static async restoreState(g, state) {
    //     const oState = JSON.parse(state, Serializer.uncensor);
    //     console.log('restoring state', oState)
    //     if (oState.version !== SERIAL_VERSION) {
    //         throw new Error('unexpected version number while restoring game state - expected v' + SERIAL_VERSION + ' - got v' + oState.version);
    //     }
    //     const engine = g.engine;
    //     g.exitUI();
    //     await g.loadLevel(oState.level);
    //     Serializer.setPlayerState(g, oState.player);
    //     Serializer.setDoorManagerState(g, oState.doors);
    //     Serializer.setDecalState(g, oState.decals);
    //     engine.tagManager.grid.state = oState.tags;
    //     engine.setTime(oState.time);
    //     engine.doors.locks.state = oState.locks;
    //     g._senseMap.state = oState.senses;
    //     g.logic.commit('SET_STATE_CONTENT', {content: oState.logic});
    //     g.album.commit('SET_STATE_CONTENT', {content: oState.album});
    // }
}

export default Serializer;