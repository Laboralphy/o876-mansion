import { Howl, Howler, type HowlOptions, type PannerAttributes } from 'howler'
import AUDIO from '@/data/audio.json'
import type Position from '@/engine/Position'

/**
 * A loaded sound
 */
export interface LoadedSound {
    id: string; // sound id : the file name, without folder
    filename: string; // file name, relative to the audio folder, without extension
    sound: Howl;
}

/**
 * The background music
 */
interface BGM extends LoadedSound {
    next?: string; // the music that will be played once this one has faded out
}

/**
 * A sound being played (see play())
 */
export interface PlayingSound {
    id: number; // Howler sound instance id
    sound: Howl;
}

/**
 * Sound loading options (the source is computed from the file name)
 */
export type SoundOptions = Omit<HowlOptions, 'src'>;

export interface AudioManagerState {
    bgm: string;
}

class AudioManager {
    BGM_VOLUME: number;
    SND_VOLUME: number;
    _bgm: BGM | null;
    _lastBgm: string;
    _ovrBgm: boolean;
    _registry: Record<string, LoadedSound>;
    _saveBgm: string;
    audioPath: string;
    streamedSounds: Set<string>;

    constructor () {
        this.audioPath = 'assets/audio'
        this.streamedSounds = new Set([
            'ambiance',
            'ambiance-loops',
            'apparitions',
            'events',
            'music'
        ])
        this._bgm = null
        this._ovrBgm = false
        this._saveBgm = ''
        this._lastBgm = ''
        this._registry = {}
        this.BGM_VOLUME = 0.5
        this.SND_VOLUME = 0.5
    }

    get state (): AudioManagerState {
        return {
            bgm: this._lastBgm
        }
    }

    set state (value: AudioManagerState) {
        const { bgm } = value
        if (bgm) {
            this.playBGM(bgm)
        }
    }

    buildFileLoadingArray (sFile: string): string[] {
        return [
            this.audioPath + '/mp3/' + sFile + '.mp3',
            this.audioPath + '/ogg/' + sFile + '.ogg',
        ]
    }

    /**
     *
     * @param sFile file name, relative to the audio folder, without extension
     * @param options Howler options
     */
    load (sFile: string, options: SoundOptions): Promise<LoadedSound> {
        return new Promise((resolve, reject) => {
            try {
                const aFile = sFile.split('/')
                const id = aFile.pop()
                const sound = new Howl({
                    src: this.buildFileLoadingArray(sFile),
                    ...options
                })
                const oSound = {
                    id,
                    filename: sFile,
                    sound
                }
                if (options.autoplay) {
                    resolve(oSound)
                } else {
                    sound.on('load', () => {
                        resolve(oSound)
                    })
                }
            } catch (e) {
                reject(e)
            }
        })
    }

    loadSoundCategory (aFiles: string[], options: SoundOptions): Promise<LoadedSound>[] {
        return aFiles.map(f => this.load(f, options))
    }

    /**
     * Places the listener (the player's ears)
     */
    setListeningEntity (position: Position) {
        Howler.pos(position.x, position.y, position.z)
        const angle = position.angle
        const x = Math.cos(angle);
        const y = 0;
        const z = Math.sin(angle);
        Howler.orientation(x, y, z, 0, 1, 0)
    }

    /**
     * Arret général de tous les sons
     */
    stop() {
        this._bgm = null
        this._ovrBgm = false
        this._saveBgm = ''
        Howler.stop()
    }

    async generalFadeOutAndStop () {
        await this.stopBGM()
        this.stop()
    }

    stopBGM (): Promise<void> {
        return new Promise<void>(resolve => {
            this._bgm.sound.fade(this.BGM_VOLUME, 0, 2000, undefined)
            this._bgm.sound.once('fade', () => {
                resolve()
            })
        })
    }

    /**
     * @param value 0..1
     */
    setBGMVolume (value: number) {
        this.BGM_VOLUME = value
        if (this._bgm) {
            this._bgm.sound.volume(value)
        }
    }

    /**
     * @param value 0..1
     */
    setSoundVolume (value: number) {
        this.SND_VOLUME = value
    }

    async playBGM (sFile: string) {
        console.log('[a] now playing', sFile)
        this._lastBgm = sFile
        if (this._ovrBgm) {
            console.log('[a] during override, stacking: %s', sFile)
            this._saveBgm = sFile
        } else if (this._bgm === null) {
            if (!!sFile) {
                console.log('[a] creating new bgm object')
                this._bgm = await this.load(sFile, {
                    html5: true,
                    loop: true,
                    autoplay: true,
                    volume: this.BGM_VOLUME
                })
            } else {
                console.warn('[a] music file name evaluating as empty : ignoring')
            }
        } else {
            if (this._bgm.filename === sFile && !this._bgm.next) {
                console.log('[a] same music filename %s : ignored', sFile)
                return
            }
            // fadeout le BGM actuel
            if (this._bgm.next) {
                console.log('[a] already queued %s : changing to %s', this._bgm.next, sFile)
                this._bgm.next = sFile
                return
            }
            this._bgm.next = sFile
            console.log('[a] fading out current bgm')
            const sNewBGM = this._bgm.next
            await this.stopBGM()
            console.log('[a] fade out complete')
            this._bgm = null
            if (sNewBGM) {
                console.log('[a] received new play bgm order : %s', sFile)
                await this.playBGM(sNewBGM)
            }
        }
    }

    /**
     * Remplacer la musique actuelle par une musique de combat
     * Gérer les changement de BGM
     * @param sFile music file name
     */
    async playOverriddenBGM (sFile: string) {
        // Détecter si on est deja en overridden
        // si oui : ne rien faire
        // sinon : sauver le BGM File actuel
        // changer de BGM
        if (this._ovrBgm) {
            // juste changer de ovr
            await this.playBGM(sFile)
        } else {
            this._saveBgm = this._bgm.filename
            await this.playBGM(sFile)
            this._ovrBgm = true
        }
    }

    async stopOverridenBGM () {
        if (this._saveBgm) {
            this._ovrBgm = false
            await this.playBGM(this._saveBgm)
            this._saveBgm = ''
        }
    }

    /**
     * Joue un son d'ambiance. Ce genre de son n'a pas besoin d'être chargé au debut du prorgamme.
     * Même si le son est joué avec une fraction de seconde en retard ce n'est pas grave.
     * @param sFile file name
     * @param bLoop le son sera bouclé et ne sera déchargé que si on l'arrête manuellement
     */
    async playAmbiance (sFile: string, bLoop = false): Promise<{ sound: Howl }> {
        const { sound } = await this.load(sFile, {
            autoplay: true,
            loop: bLoop
        })
        sound.on(bLoop ? 'stop' : 'end', () => {
            if (bLoop) {
                console.log('[a] unloading looped ambiance sound %s', sFile)
            }
            sound.unload()
        })
        return { sound }
    }

    /**
     * Spatial attributes of a positioned sound
     * @param nDistance reference distance : the sound volume starts decreasing beyond this distance
     */
    getPannerAttribute (nDistance = 128): PannerAttributes {
        return {
            coneInnerAngle: 360,
            coneOuterAngle: 360,
            coneOuterGain: 0,
            // @types/howler only lists "inverse" and "linear", but "exponential" is a valid
            // Web Audio PannerNode distance model, which Howler passes through.
            distanceModel: 'exponential' as PannerAttributes['distanceModel'],
            maxDistance: 65536,
            refDistance: nDistance,
            rolloffFactor: 2.5,
            panningModel: 'HRTF'
        }
    }

    /**
     * Joue un son stocké en mémoire
     * Ne fonctionne que pour les sons communs et courts comme les bruitages ou autres effets sonores de jeu
     * @param sId sound id (file name without folder)
     * @returns the playing sound, or undefined if the sound is not registered
     */
    play (sId: string): PlayingSound | undefined {
        if (sId in this._registry) {
            const { sound } = this._registry[sId]
            sound.volume(this.SND_VOLUME)
            return {
                id: sound.play(),
                sound
            }
        } else {
            console.error('[a] this sound is not registered : %s', sId)
        }
    }

    async init () {
        // les sons les plus utilisés
        const aMechanisms = this.loadSoundCategory(
            AUDIO.files.filter(f => f.startsWith('mechanisms/')),
            {
                preload: true
            }
        )
        const aPickup = this.loadSoundCategory(
            AUDIO.files.filter(f => f.startsWith('pickup/')),
            {
                preload: true
            }
        )
        const aMagic = this.loadSoundCategory(
            AUDIO.files.filter(f => f.startsWith('magic/')),
            {
                preload: true
            }
        )
        const aGhosts = this.loadSoundCategory(
            AUDIO.files.filter(f => f.startsWith('ghosts/')),
            {
                preload: true
            }
        )
        const aSounds = await Promise.all([
            ...aMagic,
            ...aMechanisms,
            ...aPickup,
            ...aGhosts
        ])

        aSounds.forEach(s => {
            this._registry[s.id] = s
        })
        console.log('[a] %d sound(s) has been loaded', Object.keys(this._registry).length)
    }
}

export default AudioManager
