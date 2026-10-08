/**
 * Photo categories (tabs of the album)
 * - debug : for debug purpose only
 * - art : a photo of a piece of art (mostly painting)
 * - clue : a photo that gives an hint on how to progress throught the game
 * - archive : a clue that has been used (the enigma is solved)
 * - wraith : a photo of a wandering (non hostile) ghost
 * - ambient : a photo of a remarkable place
 */
export type PhotoType = 'debug' | 'art' | 'clue' | 'archive' | 'wraith' | 'ambient';

export interface Photo {
    id: number;
    type: PhotoType;
    content: string; // image, as a data url
    value: number; // score
    ref: string; // translation reference (photos namespace)
}

export interface StorePhotoPayload {
    content: string;
    type: PhotoType;
    value: number;
    ref: string;
}

export interface SetPhotoTypePayload {
    ref: string;
    type: PhotoType;
}
