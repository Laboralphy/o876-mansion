import * as CONSTS from '@/consts';

export function main(game, ref, score = 0) {
    game.storePhoto(
        CONSTS.PHOTO_TYPE_ART, // type de photo
        score,                  // score de la photo
        ref,                    // information supplémentaire (titre, description)
    );
    game.engine.delayCommand(
        () => game.ui.popup('EVENT_PHOTO_ART_STORED', 'album-art'),
        CONSTS.DELAY_BETWEEN_PHOTO_AND_POPUP
    );
}
