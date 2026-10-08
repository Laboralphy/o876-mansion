import type { ItemData } from './types';

/**
 * initial state factory
 */
export default () => ({
    player: {
        inventory: [
            'itm_camera'
        ] as string[],
        attributes: {
            hp: 100,
            hpMax: 100
        },
    },
    data: {
        score: 0,
        items: [] as ItemData[]
    }
});
