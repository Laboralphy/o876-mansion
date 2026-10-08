import type { Photo, PhotoType } from './types';

/**
 * initial state factory
 */
export default () => ({
    photoId: 1,
    activeType: 'debug' as PhotoType,
    photoTypes: [
        'debug',
        'art',
        'clue',
        'archive',
        'wraith',
        'ambient'
    ] as PhotoType[],
    photos: [] as Photo[]
});
