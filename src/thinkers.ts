/**
 * Game thinkers registry.
 * Statically imports every thinker of thinkers.d/ (formerly gathered at build time by webpack's require.context)
 */
import AnimThinker from './thinkers.d/AnimThinker';
import ChaserThinker from './thinkers.d/ChaserThinker';
import GhostThinker from './thinkers.d/GhostThinker';
import HomingBoltThinker from './thinkers.d/HomingBoltThinker';
import IntroThinker from './thinkers.d/IntroThinker';
import LinearBoltThinker from './thinkers.d/LinearBoltThinker';
import PlayerThinker from './thinkers.d/PlayerThinker';
import RusherThinker from './thinkers.d/RusherThinker';
import ShooterChaserThinker from './thinkers.d/ShooterChaserThinker';
import ShooterWalkerThinker from './thinkers.d/ShooterWalkerThinker';
import StayThinker from './thinkers.d/StayThinker';
import TeleChaserThinker from './thinkers.d/TeleChaserThinker';
import TeleShooterChaserThinker from './thinkers.d/TeleShooterChaserThinker';
import TeleTripleShooterChaserThinker from './thinkers.d/TeleTripleShooterChaserThinker';
import TripleShooterChaserThinker from './thinkers.d/TripleShooterChaserThinker';
import TripleShooterWalkerThinker from './thinkers.d/TripleShooterWalkerThinker';
import VengefulThinker from './thinkers.d/VengefulThinker';
import WalkerThinker from './thinkers.d/WalkerThinker';
import WraithThinker from './thinkers.d/WraithThinker';
import ZigZagChaserThinker from './thinkers.d/ZigZagChaserThinker';
import ZigZagRusherThinker from './thinkers.d/ZigZagRusherThinker';
import ZigZagShooterThinker from './thinkers.d/ZigZagShooterThinker';
import ZigZagTeleChaserThinker from './thinkers.d/ZigZagTeleChaserThinker';

const THINKERS: Record<string, any> = {
    AnimThinker,
    ChaserThinker,
    GhostThinker,
    HomingBoltThinker,
    IntroThinker,
    LinearBoltThinker,
    PlayerThinker,
    RusherThinker,
    ShooterChaserThinker,
    ShooterWalkerThinker,
    StayThinker,
    TeleChaserThinker,
    TeleShooterChaserThinker,
    TeleTripleShooterChaserThinker,
    TripleShooterChaserThinker,
    TripleShooterWalkerThinker,
    VengefulThinker,
    WalkerThinker,
    WraithThinker,
    ZigZagChaserThinker,
    ZigZagRusherThinker,
    ZigZagShooterThinker,
    ZigZagTeleChaserThinker
};

export default THINKERS;
