/**
 * Game scripts registry.
 * Statically imports every module of scripts.d/ (formerly gathered at build time by webpack's require.context)
 * The resulting structure mirrors the folder tree : SCRIPTS.<folder>.<file>
 */
import * as actionLockDoor from './scripts.d/action/lockDoor';
import * as actionPhotoMogrify from './scripts.d/action/photoMogrify';
import * as actionResolveClueUnlockSecret from './scripts.d/action/resolveClueUnlockSecret';
import * as actionShowRemotePlace from './scripts.d/action/showRemotePlace';
import * as actionSpawnWraith from './scripts.d/action/spawnWraith';
import * as actionTakeAmbientPhoto from './scripts.d/action/takeAmbientPhoto';
import * as actionTakeArtPhoto from './scripts.d/action/takeArtPhoto';
import * as actionUnlockDoor from './scripts.d/action/unlockDoor';
import * as eventM0BookGlyphsTaken from './scripts.d/event/m0_book_glyphs_taken';
import * as eventM0RedSigilUnlock from './scripts.d/event/m0_red_sigil_unlock';
import * as eventM0WraithSkullFace from './scripts.d/event/m0_wraith_skull_face';
import * as eventM1EnterDarkGrove from './scripts.d/event/m1_enter_dark_grove';
import * as eventM1EnterEastGlade from './scripts.d/event/m1_enter_east_glade';
import * as eventM1EnterHiddenGarden from './scripts.d/event/m1_enter_hidden_garden';
import * as eventM1RemiseIntDoor from './scripts.d/event/m1_remise_int_door';
import * as eventMiLightning0 from './scripts.d/event/mi_lightning_0';
import * as eventTestGhostAi from './scripts.d/event/test_ghost_ai';
import * as keyMouse0 from './scripts.d/key/mouse0';
import * as keyMouse2 from './scripts.d/key/mouse2';
import * as photoAmbient from './scripts.d/photo/ambient';
import * as photoArt from './scripts.d/photo/art';
import * as photoGetPhotoScore from './scripts.d/photo/get-photo-score';
import * as photoM0BloodyHands from './scripts.d/photo/m0_bloody_hands';
import * as photoM0CyanSigil from './scripts.d/photo/m0_cyan_sigil';
import * as photoM0FirePlace from './scripts.d/photo/m0_fire_place';
import * as photoM0SkullFace from './scripts.d/photo/m0_skull_face';
import * as photoM1SecretPass from './scripts.d/photo/m1_secret_pass';
import * as tagAmbsound from './scripts.d/tag/ambsound';
import * as tagArchive from './scripts.d/tag/archive';
import * as tagBgm from './scripts.d/tag/bgm';
import * as tagDiscard from './scripts.d/tag/discard';
import * as tagEvent from './scripts.d/tag/event';
import * as tagGoto from './scripts.d/tag/goto';
import * as tagItem from './scripts.d/tag/item';
import * as tagLocator from './scripts.d/tag/locator';
import * as tagLock from './scripts.d/tag/lock';
import * as tagLookat from './scripts.d/tag/lookat';
import * as tagOpen from './scripts.d/tag/open';
import * as tagSense from './scripts.d/tag/sense';
import * as tagTrigsound from './scripts.d/tag/trigsound';

const SCRIPTS: Record<string, Record<string, any>> = {
    action: {
        lockDoor: actionLockDoor,
        photoMogrify: actionPhotoMogrify,
        resolveClueUnlockSecret: actionResolveClueUnlockSecret,
        showRemotePlace: actionShowRemotePlace,
        spawnWraith: actionSpawnWraith,
        takeAmbientPhoto: actionTakeAmbientPhoto,
        takeArtPhoto: actionTakeArtPhoto,
        unlockDoor: actionUnlockDoor
    },
    event: {
        m0_book_glyphs_taken: eventM0BookGlyphsTaken,
        m0_red_sigil_unlock: eventM0RedSigilUnlock,
        m0_wraith_skull_face: eventM0WraithSkullFace,
        m1_enter_dark_grove: eventM1EnterDarkGrove,
        m1_enter_east_glade: eventM1EnterEastGlade,
        m1_enter_hidden_garden: eventM1EnterHiddenGarden,
        m1_remise_int_door: eventM1RemiseIntDoor,
        mi_lightning_0: eventMiLightning0,
        test_ghost_ai: eventTestGhostAi
    },
    key: {
        mouse0: keyMouse0,
        mouse2: keyMouse2
    },
    photo: {
        ambient: photoAmbient,
        art: photoArt,
        'get-photo-score': photoGetPhotoScore,
        m0_bloody_hands: photoM0BloodyHands,
        m0_cyan_sigil: photoM0CyanSigil,
        m0_fire_place: photoM0FirePlace,
        m0_skull_face: photoM0SkullFace,
        m1_secret_pass: photoM1SecretPass
    },
    tag: {
        ambsound: tagAmbsound,
        archive: tagArchive,
        bgm: tagBgm,
        discard: tagDiscard,
        event: tagEvent,
        goto: tagGoto,
        item: tagItem,
        locator: tagLocator,
        lock: tagLock,
        lookat: tagLookat,
        open: tagOpen,
        sense: tagSense,
        trigsound: tagTrigsound
    }
};

export default SCRIPTS;
