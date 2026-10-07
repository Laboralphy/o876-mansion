# Typing to-do : untyped parameters

Inventory of the function parameters that have no type annotation (they are implicitly `any`).
Generated from the TypeScript compiler itself, by type-checking with `noImplicitAny` turned on :

```bash
npx vue-tsc --noEmit --noImplicitAny
```

| diagnostic | meaning |
|---|---|
| TS7006 | parameter without type : `function f(x)` |
| TS7031 | destructured parameter without type : `function f({x, y})` |
| TS7019 | rest parameter without type : `function f(...args)` |

**Total : 849 untyped parameters in 460 functions, across 114 files.**

## How to proceed

- Work step by step, in the order below : each step only depends on the previous ones, so the types written
  in a step (e.g. `Vector`, `Entity`, `Engine`) can be used to type the next ones.
- When a step is done, tick it here and re-run the command above : the count of that step must reach 0.
- Callbacks (`callback of .forEach()`...) usually get their type for free once the array or the emitter
  they belong to is typed : fix the owning structure rather than annotating the callback.
- Once everything is at 0, enable `"noImplicitAny": true` in `tsconfig.json` so that it stays that way.

## Progress

| | step | files | functions | parameters |
|---|---|---:|---:|---:|
| [x] | Step 1 — leaf libraries | 20 | 115 | 219 |
| [x] | Step 2 — engine (compat layer over raycaster386) | 14 | 52 | 68 |
| [ ] | Step 3 — stores | 5 | 43 | 56 |
| [ ] | Step 4 — game core classes | 8 | 96 | 171 |
| [ ] | Step 5 — game visual filters | 12 | 39 | 63 |
| [ ] | Step 6 — thinkers (AI) | 6 | 37 | 44 |
| [ ] | Step 7 — scripts | 40 | 56 | 205 |
| [ ] | Step 8 — Vue components | 9 | 22 | 23 |
| | **total** | | **460** | **849** |

**Remaining after step 1 : 625** (some parameters of later steps were typed for free by the typed libraries).
**Remaining after step 2 : 532.**

### Explicit `any`

Untyped parameters are not the only holes : explicit `any` (`: any`, `as any`, `any[]`, `<any>`) is tracked too.

```bash
grep -rnoE ':\s*any\b|as any\b|<any>|any\[\]' src --include=*.ts --include=*.vue | wc -l
```

| after | explicit `any` |
|---|---:|
| start of step 2 | 171 |
| step 2 | 88 — none left in `src/engine`, only `src/libs/events.ts` in `src/libs` |

`libs/events.ts` keeps `(...args: any[])` on purpose : it is what lets listeners destructure their payload
(`.on('x', ({a, b}) => ...)`). Removing it requires a typed event map per emitter.

Shared types available for the next steps :
- `ThinkerContext` (`engine/thinkers/Thinker.ts`), extended by `Game.ts` with `game: Game` (declaration merging)
- `ThinkerClass`, `StateDefinition`, `Transition`, `ScriptParameters`
- `GameOptions` (`engine/GameAbstract.ts`), `PulseOptions`, `FillStyle`, `TilesetAnimation`
- `Game.playerThinker` : the camera thinker, typed as `PlayerThinker`

## Step 1 — leaf libraries

No dependency on the game : types written here are reused by everything else.

### `src/libs/geometry/index.ts` — 41 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 18 | `distance` | `x1`, `y1`, `x2`, `y2` |
| 24 | `squareDistance` | `x1`, `y1`, `x2`, `y2` |
| 36 | `normalizeAngle` | `value` |
| 56 | `pointInRect` | `x`, `y`, `xr`, `yr`, `wr`, `hr` |
| 60 | `rectInRect` | `ax`, `ay`, `aw`, `ah`, `bx`, `by`, `bw`, `bh` |
| 69 | `pointInCircle` | `x`, `y`, `xc`, `yc`, `r` |
| 73 | `circleInRect` | `xc`, `yc`, `r`, `xr`, `yr`, `wr`, `hr` |
| 90 | `angle` | `x1`, `y1`, `x2`, `y2` |
| 103 | `polar2rect` | `angle`, `norm` |

### `src/libs/canvas-helper.ts` — 26 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 12 | `createCanvas` | `width`, `height` |
| 21 | `setDefaultImageSmoothing` | `b` |
| 29 | `getData` | `oCanvas` |
| 48 | `setImageSmoothing` | `oCanvas`, `b` |
| 58 | `getImageSmoothing` | `oCanvas` |
| 68 | `isCanvas` | `c` |
| 77 | `isImage` | `c` |
| 86 | `cloneCanvas` | `oCanvas` |
| 111 | `applyFilter` | `oCanvas`, `f` |
| 142 | `loadCanvases` | `aUrls` |
| 143 | callback of .map() | `s` |
| 152 | `loadCanvas` | `sUrl` |
| 173 | `resize` | `oCanvas`, `width`, `height` |
| 198 | `text` | `oCanvas`, `sText`, `x`, `y`, `oStyles`, `wMax`, `h` |
| 239 | callback of .filter() | `s` |

### `src/libs/object-helper/Extender.ts` — 23 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 10 | `getType` | `x` |
| 24 | `objectKeyMap` | `oObj` |
| 45 | `objectDiffKeys` | `a1`, `a2` |
| 48 | callback of .filter() | `l` |
| 49 | callback of .filter() | `l` |
| 60 | `objectReachBranch` | `oObj`, `sBranch` |
| 63 | callback of .reduce() | `prev`, `next` |
| 73 | `objectMkBranch` | `oObj`, `sBranch` |
| 76 | callback of .reduce() | `prev`, `next` |
| 90 | `objectSet` | `oObj`, `sBranch`, `newValue` |
| 104 | `objectGet` | `oObj`, `sBranch` |
| 118 | `objectExtends` | `oTarget`, `oSource` |
| 120 | callback of .forEach() | `path` |
| 124 | callback of .forEach() | `path` |

### `src/libs/object-helper/Reactor.ts` — 23 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 14 | `constructor` | `obj` |
| 48 | `notify` | `path`, `oRoot` |
| 62 | `makeReactiveArrayMethod` | `arr`, `sMethod`, `path`, `oRoot` |
| 64 | `arr[sMethod]` | `...args` |
| 77 | `makeReactiveArray` | `obj`, `key`, `path`, `oRoot` |
| 101 | `makeReactiveScalar` | `obj`, `key`, `path`, `oRoot` |
| 128 | `makeReactiveItem` | `obj`, `key`, `path`, `oRoot` |
| 144 | `makeReactiveObject` | `obj`, `path`, `oRoot` |

### `src/libs/tools2d.ts` — 16 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 10 | `createArray2D` | `w`, `h`, `feed` |
| 25 | `_createRow` | `aRow` |
| 40 | `walk2D` | `aArray2D`, `cb` |
| 55 | `map2D` | `aArray2D`, `cb` |
| 56 | callback of .map() | `row`, `y`, `cell`, `x` |
| 59 | `rotate` | `aArray` |
| 64 | callback of createArray2D() | `x`, `y` |
| 70 | `rotateTwice` | `aArray` |

### `src/libs/range-collider.ts` — 13 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 5 | `constructor` | `p1`, `p2` |
| 13 | `setRange` | `p1`, `p2` |
| 21 | `getPointSector` | `x` |
| 39 | `getRangeSectors` | `x1`, `x2` |
| 50 | `getLeftRelic` | `x1`, `x2` |
| 74 | `getRightRelic` | `x1`, `x2` |
| 92 | `getCenterRelic` | `x1`, `x2` |

### `src/libs/perlin.ts` — 12 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 8 | `computeOptimalOctaves` | `n` |
| 27 | `cosineInterpolate` | `x0`, `x1`, `mu` |
| 32 | `generateSmoothNoise` | `aBaseNoise`, `nOctave` |
| 68 | `generate` | `aBaseNoise`, `nOctaveCount` |
| 117 | `colorize` | `aNoise`, `aPalette` |
| 120 | callback of .forEach() | `r`, `x` |

### `src/libs/fetch-json.ts` — 9 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 1 | `fetchJSON` | `url` |
| 21 | `putJSON` | `url`, `data` |
| 25 | `postJSON` | `url`, `data` |
| 29 | `sendJSON` | `url`, `method`, `data` |
| 55 | `deleteJSON` | `url` |

### `src/libs/automaton/Automaton.ts` — 8 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 22 | `checkInput` | `oDefinition` |
| 49 | `defineState` | `sName`, `oStateDef` |
| 84 | callback of .filter() | `s` |
| 88 | callback of .map() | `s` |
| 96 | `defineStates` | `oStates` |
| 119 | `changeState` | `sState` |
| 139 | `enterState` | `sState` |

### `src/libs/geometry/Vector.ts` — 8 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 41 | `set` | `x` |
| 56 | `add` | `v` |
| 65 | `sub` | `v` |
| 80 | `mul` | `f` |
| 119 | `translate` | `v` |
| 130 | `scale` | `f` |
| 148 | `fromPolar` | `a`, `s` |

### `src/libs/pointer-lock.ts` — 7 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 98 | `requestPointerLock` | `oElement` |
| 132 | `trigger` | `sEvent`, `payload` |
| 143 | `eventChange` | `event` |
| 146 | `this._handlers.mousemove` | `event` |
| 163 | `eventError` | `event` |
| 172 | `eventMouseMove` | `event` |

### `src/libs/automaton/StateContext.ts` — 6 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 32 | `runActions` | `a` |
| 33 | callback of .forEach() | `s` |
| 38 | `runSmth` | `s` |
| 82 | `parseScriptArguments` | `sInput` |
| 100 | `invokeAction` | `action` |
| 109 | `invokeTest` | `test` |

### `src/libs/ui/Screen.ts` — 6 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 28 | `constructor` | `comp` |
| 77 | `_getClickEventOffset` | `event` |
| 98 | `buildStructure` | `{surface}`, `{overlay}` |
| 150 | `this._handlers.click` | `event` |
| 163 | `this._handlers.click` | `event` |

### `src/libs/interpolator.ts` — 5 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 11 | `linear` | `v`, `x1`, `y1`, `x3`, `y3` |

### `src/libs/pixel-processor.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 3 | `process` | `oCanvas`, `cb` |
| 10 | `pixel` | `x`, `y` |

### `src/libs/approach-value.ts` — 3 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 1 | `approachValue` | `fGoal`, `fCurrent`, `fStep` |

### `src/libs/filters/FilterManager.ts` — 3 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 29 | `link` | `oFilter` |
| 59 | `process` | `time` |
| 74 | `render` | `canvas` |

### `src/libs/geometry/Point.ts` — 3 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 10 | `constructor` | `x`, `y` |
| 25 | `distance` | `p` |

### `src/libs/filters/AbstractFilter.ts` — 2 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 43 | `render` | `canvas` |
| 50 | `computeClock` | `time` |

### `src/libs/ui/ManagedElement.ts` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 8 | `constructor` | `element` |

## Step 2 — engine (compat layer over raycaster386)

Entity, Horde, thinker bases, engine filters, GameAbstract.

### `src/engine/thinkers/FPSControlThinker.ts` — 20 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 50 | `isCommandOn` | `sCommand` |
| 58 | `clearCommand` | `sCommand` |
| 70 | `consumeCommand` | `sCommand` |
| 77 | `setLookFactor` | `f` |
| 81 | `setupCommands` | `oKeys` |
| 114 | `getKey` | `key` |
| 125 | `keyDown` | `key` |
| 136 | `keyUp` | `key` |
| 146 | `look` | `x` |
| 153 | `computeAngleSpeed` | `nTime` |
| 167 | `getVectorForward` | `fAngle`, `fSpeed` |
| 174 | `getVectorBackward` | `fAngle`, `fSpeed` |
| 178 | `getVectorLeftward` | `fAngle`, `fSpeed` |
| 182 | `getVectorRightward` | `fAngle`, `fSpeed` |
| 294 | `useBlock` | `x`, `y` |

### `src/engine/GameAbstract.ts` — 17 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 59 | `loadProgress` | `phase`, `f` |
| 90 | `log` | `...args` |
| 96 | `logGroup` | `sGroup`, `...args` |
| 209 | callback of .on() | `event` |
| 237 | `config` | `options` |
| 252 | `keyUpHandler` | `key` |
| 256 | `keyDownHandler` | `key` |
| 260 | `invokeCameraThinkerFunction` | `sFunction`, `...args` |
| 269 | `setMouseSensitivity` | `f` |
| 273 | `progressFunction` | `phase`, `f` |
| 302 | `displayMessage` | `sMessage` |
| 324 | `buildLevel` | `data` |
| 353 | callback of .filter() | `level` |

### `src/engine/filters/Blur.ts` — 5 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 18 | `constructor` | `radius` |
| 25 | `setRadius` | `n` |
| 30 | `createCanvas` | `width`, `height` |
| 37 | `render` | `canvas` |

### `src/engine/thinkers/MoverThinker.ts` — 5 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 65 | `slide` | `v` |
| 99 | `setLocation` | `x`, `y`, `angle` |
| 125 | `setSpeed` | `sx` |

### `src/engine/filters/Halo.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 26 | `buildGradient` | `canvas`, `color` |
| 37 | `process` | `time` |
| 45 | `render` | `canvas` |

### `src/engine/thinkers/Thinker.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 47 | `emit` | `sEvent`, `payload` |
| 77 | `_invoke` | `sMeth`, `...parameters` |

### `src/engine/thinkers/MissileThinker.ts` — 3 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 68 | `fire` | `owner`, `speed` |
| 89 | `setAngle` | `a` |

### `src/engine/filters/Link.ts` — 2 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 13 | `constructor` | `children` |
| 36 | `render` | `canvas` |

### `src/engine/filters/Pulse.ts` — 2 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 28 | `constructor` | `{child}` |
| 89 | `render` | `canvas` |

### `src/engine/filters/Timed.ts` — 2 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 12 | `constructor` | `{child}` |
| 30 | `render` | `canvas` |

### `src/engine/Engine.ts` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 749 | callback of .forEach() | `a` |

### `src/engine/TagManager.ts` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 142 | callback of .forEach() | `e` |

### `src/engine/filters/Flash.ts` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 30 | `render` | `canvas` |

### `src/engine/filters/Foreground.ts` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 24 | `render` | `canvas` |

## Step 3 — stores

Pinia stores and the StoreAbstract bridge : action payloads.

### `src/stores/ui/index.ts` — 32 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 94 | `[TYPES.PUSH_POPUP]` | `{text}`, `{icon}` |
| 95 | callback of .filter() | `w` |
| 104 | `[TYPES.SET_HUD_VISIBLE]` | `{value}` |
| 108 | `[TYPES.SET_UI_FRAME_VISIBLE]` | `{value}` |
| 112 | `[TYPES.SET_SHOT]` | `{value}`, `{energy}`, `{distance}`, `{angle}`, `{targets}`, `{shutter}`, `{damage}` |
| 127 | `[TYPES.SET_UI_FULLY_VISIBLE]` | `{value}` |
| 131 | `[TYPES.SET_ALBUM_ACTIVE_TYPE]` | `{value}` |
| 137 | `[TYPES.SET_MAIN_ACTIVE_TAB]` | `{value}` |
| 141 | `[TYPES.SET_ITEM_TYPE_ACTIVE_TYPE]` | `{value}` |
| 145 | `[TYPES.SET_PHOTO_DETAILS]` | `{visible}` |
| 154 | `[TYPES.SHOW_FIRST_PAGE]` | `{value}` |
| 158 | `[TYPES.SET_MAIN_MENU_PHASE]` | `{value}` |
| 162 | `[TYPES.SET_TODO_INNER_PHASE]` | `{value}` |
| 166 | `[TYPES.SET_NOTE_SELECTED_TYPE]` | `{value}` |
| 170 | `[TYPES.SET_GAME_OVER_PROMPT_VISIBLE]` | `{value}` |
| 174 | `[TYPES.SET_END_OF_GAME_VISIBLE]` | `{value}` |
| 178 | `[TYPES.SET_MOUSE_FACTOR]` | `{value}` |
| 182 | `[TYPES.SET_MUSIC_VOLUME]` | `{value}` |
| 186 | `[TYPES.SET_SFX_VOLUME]` | `{value}` |
| 190 | `[TYPES.ADD_NOTE_ENTRY]` | `{ref}`, `{type}` |
| 203 | `[ACTIONS.SHOW_POPUP]` | `{text}`, `{icon}` |
| 207 | callback of .some() | `p` |
| 252 | `[ACTIONS.SET_SHOT]` | `payload` |

### `src/stores/album/index.ts` — 9 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 32 | `[TYPES.STORE_PHOTO]` | `{content}`, `{type}`, `{value}`, `{ref}` |
| 45 | `[TYPES.SET_ACTIVE_TYPE]` | `{value}` |
| 51 | `[TYPES.SET_PHOTO_TYPE]` | `{ref}`, `{type}` |
| 52 | callback of .find() | `p` |
| 62 | `[TYPES.SET_STATE_CONTENT]` | `{content}` |

### `src/stores/logic/index.ts` — 9 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 55 | `[TYPES.ADD_INVENTORY_ITEM]` | `{ref}` |
| 66 | `[TYPES.REMOVE_INVENTORY_ITEM]` | `{ref}` |
| 77 | `[TYPES.DEFINE_ITEMS]` | `{items}` |
| 78 | callback of .forEach() | `x` |
| 84 | `[TYPES.SET_PLAYER_HP]` | `{value}` |
| 92 | `[TYPES.SET_PLAYER_MAX_HP]` | `{value}` |
| 97 | `[TYPES.MODIFY_PLAYER_HP]` | `{value}` |
| 103 | `[TYPES.SET_STATE_CONTENT]` | `{content}` |
| 109 | `[TYPES.INC_SCORE]` | `{value}` |

### `src/stores/visor/index.ts` — 5 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 24 | `[TYPES.INC_ENERGY]` | `{amount}` |
| 45 | `[TYPES.SET_SHOOT_LAST_TIME]` | `{time}` |
| 49 | `[TYPES.SET_CAMERA_WIDTH]` | `{value}` |
| 53 | `[TYPES.AIMING_SUPERNATURAL]` | `{value}` |
| 57 | `[TYPES.SET_CAMERA_LAMP]` | `{value}` |

### `src/mixins/ui.ts` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 48 | `set` | `value` |

## Step 4 — game core classes

Game, UI, Logic, Visor, Album, AudioManager, SenseMap, Serializer, DataBuilder.

### `src/Game.ts` — 83 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 80 | callback of .on() | `{entity}` |
| 81 | callback of .on() | `{key}`, `{value}` |
| 152 | `getOneGhostData` | `oData`, `sGhostId` |
| 193 | `loadLevel` | `sLevel` |
| 228 | `setDecalState` | `value` |
| 229 | callback of .forEach() | `mut` |
| 256 | `removeDecals` | `x`, `y` |
| 271 | `rotateDecals` | `x`, `y`, `bClockWise` |
| 283 | `applyDecal` | `x`, `y`, `nSides`, `sRef` |
| 307 | `removeSprite` | `x`, `y` |
| 416 | `engineEntityDestroyedHandler` | `entity` |
| 424 | `engineOptionChanged` | `key`, `value` |
| 431 | `triggerEntityEvent` | `entity`, `sEvent`, `...args` |
| 440 | callback of .on() | `{x}`, `{y}` |
| 443 | callback of .on() | `{x}`, `{y}` |
| 454 | `runScript` | `sName`, `...params` |
| 470 | `registerActiveGhost` | `oGhost` |
| 478 | `unregisterActiveGhost` | `oGhost` |
| 504 | `keyDownHandler` | `key` |
| 543 | callback of .forEach() | `id` |
| 585 | callback of .sort() | `a`, `b` |
| 589 | callback of .some() | `{entity}` |
| 607 | callback of .forEach() | `{args}`, `{ref}`, `{id}`, `{x}`, `{y}` |
| 621 | `storePhoto` | `type`, `value`, `ref`, `oPosition` |
| 702 | callback of .filter() | `{value}` |
| 703 | callback of .forEach() | `{entity}`, `{value}`, `{precision}`, `{distance}` |
| 728 | `wraithShot` | `entity`, `fScore` |
| 737 | `ghostShot` | `entity`, `fScore` |
| 814 | `capture` | `pos` |
| 869 | `commitGhostAttack` | `oGhost`, `oTarget`, `nMultiplier` |
| 920 | `spawnGhost` | `sRef`, `xCell`, `yCell` |
| 954 | callback of .iterate() | `x`, `y` |
| 960 | `getTagsAt` | `x`, `y` |
| 964 | callback of .forEach() | `t` |
| 992 | callback of .on() | `{entity}`, `{x}`, `{y}`, `{parameters}`, `{remove}` |
| 1043 | `isLocatorDefined` | `sRef` |
| 1052 | `getLocator` | `sRef` |
| 1065 | `removeSense` | `sRef` |
| 1084 | `setLevelState` | `{tags}`, `{doors}`, `{locks}`, `{decals}`, `{senses}`, `{time}` |
| 1096 | `soundEvent` | `sId` |

### `src/Serializer.ts` — 20 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 5 | `censor` | `key`, `value` |
| 9 | `uncensor` | `key`, `value` |
| 16 | `getDoorManagerState` | `g` |
| 20 | `setDoorManagerState` | `g`, `state` |
| 25 | `getDecalState` | `g` |
| 33 | `setDecalState` | `g`, `state` |
| 35 | callback of .forEach() | `data` |
| 52 | `getPlayerState` | `g` |
| 60 | `setPlayerState` | `g`, `state` |
| 68 | `saveLevelState` | `g` |
| 85 | `restoreLevelState` | `g`, `state` |
| 107 | `restoreAlbumLogicState` | `g`, `oState` |
| 112 | `saveAlbumLogicState` | `g` |

### `src/DataBuilder.ts` — 15 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 2 | `buildWraithBlueprints` | `aWraiths` |
| 3 | callback of .map() | `w` |
| 17 | `buildGhostBlueprints` | `aGhosts`, `data` |
| 19 | callback of .map() | `id` |
| 20 | callback of .find() | `d` |
| 22 | callback of .map() | `{id}`, `{thinker}`, `{speed}`, `{vitality}`, `{power}`, `{score}`, `{level}`, `{missile}`, `{soundset}` |

### `src/Visor.ts` — 14 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 10 | `constructor` | `store` |
| 20 | `updateCameraWidth` | `value` |
| 31 | `_min_0_max_1` | `value` |
| 44 | `_linear_0_1` | `value`, `val0`, `val1` |
| 54 | `getGhostScore` | `entity` |
| 106 | `damageGhost` | `entity`, `amount` |
| 128 | `updateCameraEnergy` | `aGhosts`, `bSupernatural` |
| 129 | callback of .reduce() | `prev`, `curr` |
| 194 | `setShootLastTime` | `time` |

### `src/AudioManager.ts` — 13 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 46 | `buildFileLoadingArray` | `sFile` |
| 59 | `load` | `sFile`, `options` |
| 86 | `loadSoundCategory` | `aFiles`, `options` |
| 87 | callback of .map() | `f` |
| 90 | `setListeningEntity` | `position` |
| 123 | `setBGMVolume` | `value` |
| 130 | `setSoundVolume` | `value` |
| 134 | `playBGM` | `sFile` |
| 181 | `playOverriddenBGM` | `sFile` |
| 210 | `playAmbiance` | `sFile` |
| 247 | `play` | `sId` |

### `src/Logic.ts` — 9 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 6 | `constructor` | `store` |
| 23 | `getItemData` | `ref` |
| 25 | callback of .find() | `x` |
| 36 | `addInventoryItem` | `ref` |
| 44 | `removeInventoryItem` | `ref` |
| 52 | `hasInventoryItem` | `ref` |
| 55 | callback of .find() | `{item}` |
| 58 | `damagePlayer` | `ghost` |
| 68 | `incScore` | `value` |

### `src/UI.ts` — 9 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 52 | `displayPhotoDetailScore` | `{value}`, `{energy}`, `{distance}`, `{angle}`, `{targets}`, `{shutter}`, `{damage}` |
| 72 | `displayPhotoScore` | `nValue` |
| 96 | `addNote` | `ref` |

### `src/Album.ts` — 8 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 7 | `constructor` | `store` |
| 12 | `storePhoto` | `content`, `type`, `value`, `ref` |
| 16 | `archivePhoto` | `ref` |
| 20 | `hasTakenPhoto` | `ref` |
| 22 | callback of .find() | `p` |

## Step 5 — game visual filters

Canvas post-processing filters of the game.

### `src/filters/PhotoMogrify.ts` — 28 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 55 | `constructor` | `{src}`, `{dst}` |
| 86 | callback of .createArray2D() | `x`, `y` |
| 92 | callback of .walk2D() | `x`, `y`, `value` |
| 109 | `_createMaskedCanvasFromRegistry` | `n0`, `n1`, `color` |
| 134 | `_combinePhotoAndMask` | `n0`, `n1`, `cvsPhoto` |
| 150 | `_renderSpot` | `dstctx`, `x`, `y` |
| 165 | `_addSpots` | `dstcvs`, `aPoints`, `n` |
| 181 | `_renderSpots` | `dstcvs` |
| 208 | `_transMogrify` | `n`, `c0`, `c1` |
| 230 | `drawImageAtCenter` | `src`, `dst` |
| 250 | `buildPhoto` | `oPhotoCvs` |
| 335 | `flip` | `canvas` |
| 347 | `render` | `canvas` |

### `src/filters/CameraObscura.ts` — 6 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 104 | `assignAssets` | `{visor}`, `{lamp}` |
| 149 | `processing` | `nStateAfter` |
| 249 | `drawLamp` | `ctx`, `dyCameraVisor` |
| 268 | `render` | `canvas` |

### `src/filters/SimpleText.ts` — 6 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 57 | callback of .forEach() | `t`, `i` |
| 66 | `text` | `aText`, `x`, `y` |
| 103 | `render` | `canvas` |

### `src/filters/Splash.ts` — 5 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 20 | `constructor` | `photos`, `nMaxSplash` |
| 47 | `splash` | `photos`, `nMaxSplash` |
| 107 | `render` | `cvs` |

### `src/filters/AmbientLight.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 19 | `constructor` | `{engine}` |
| 28 | `setLight` | `nLight`, `t` |
| 46 | `render` | `canvas` |

### `src/filters/Confusion.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 19 | `init` | `canvas` |
| 29 | `render` | `canvas` |
| 35 | `toRad` | `n` |
| 39 | `buildConfusion` | `canvas` |

### `src/filters/Blindness.ts` — 3 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 15 | `init` | `canvas` |
| 24 | `buildBlindness` | `canvas` |
| 42 | `render` | `canvas` |

### `src/filters/GhostScreamer.ts` — 2 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 17 | `addGhost` | `oGhost` |
| 46 | `render` | `oCanvas` |

### `src/filters/RedHaze.ts` — 2 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 28 | `buildGradient` | `canvas`, `color` |

### `src/filters/CinemaScope.ts` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 17 | `render` | `canvas` |

### `src/filters/ColorVeil.ts` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 46 | `init` | `canvas` |

### `src/filters/GameOver.ts` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 8 | `render` | `canvas` |

## Step 6 — thinkers (AI)

Ghosts, missiles, player. Most methods are automaton states ($...).

### `src/thinkers.d/VengefulThinker.ts` — 11 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 204 | callback of .map() | `{x}`, `{y}` |
| 212 | callback of .sort() | `a`, `b` |
| 240 | `compareTargetDistance` | `n` |
| 255 | `$shutterChance` | `bOn` |
| 273 | `$setAnimation` | `sAnim` |
| 428 | `$isTargetCloserThan` | `nDist` |
| 432 | `$isTargetFurtherThan` | `nDist` |
| 446 | `$elapsedTime` | `n` |
| 451 | `$quantumChoice` | `n` |

### `src/thinkers.d/GhostThinker.ts` — 10 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 131 | `moveAwayFromTarget` | `ms` |
| 165 | `setTimeOut` | `scd`, `n` |
| 174 | `isTimeOut` | `scd` |
| 212 | `testSolid` | `x`, `y` |
| 216 | `testWalkable` | `x`, `y` |
| 233 | `isEntityVisible` | `oTarget` |
| 295 | `$setTimeOut` | `n` |

### `src/thinkers.d/LinearBoltThinker.ts` — 10 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 14 | `fire` | `owner`, `missileData` |
| 21 | `applyDamage` | `entity` |
| 27 | `applyBlindness` | `entity` |
| 29 | callback of .filter() | `f` |
| 30 | callback of .forEach() | `f` |
| 36 | `applyConfusion` | `entity` |
| 37 | callback of .filter() | `f` |
| 38 | callback of .forEach() | `f` |
| 44 | `applyEffect` | `entity` |

### `src/thinkers.d/PlayerThinker.ts` — 8 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 37 | `useBlock` | `x`, `y` |
| 44 | `setWalkingSpeed` | `n` |
| 58 | `ghostThreat` | `oGhost` |
| 66 | `computeAngleToMobile` | `t` |
| 73 | `forceAngle` | `fTarget` |
| 100 | `look` | `x` |
| 106 | `computeAngleSpeed` | `nTime` |

### `src/thinkers.d/IntroThinker.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 41 | `displayStory` | `t` |
| 107 | `buildTextFilter` | `data` |
| 119 | callback of .map() | `p` |
| 144 | `keyDown` | `key` |

### `src/thinkers.d/HomingBoltThinker.ts` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 19 | `getAngleToTarget` | `fTarget` |

## Step 7 — scripts

Tag, action, event, photo and key scripts. They all share the (game, remove, x, y, ...args) signature : one shared type will cover most of them.

### `src/scripts.d/tag/item.ts` — 35 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 4 | `destroyItem` | `game`, `x`, `y`, `item` |
| 9 | callback of .find() | `i` |
| 15 | `addItemToInventory` | `game`, `item` |
| 22 | `addNoteToDocuments` | `game`, `item` |
| 28 | `pickupItemWall` | `game`, `x`, `y`, `item` |
| 33 | `pickupNoteWall` | `game`, `x`, `y`, `item` |
| 38 | `pickupNoteFloor` | `game`, `x`, `y`, `item` |
| 44 | `pickupItemFloor` | `game`, `x`, `y`, `item` |
| 58 | `push` | `game`, `remove`, `x`, `y`, `item` |
| 75 | `enter` | `game`, `remove`, `x`, `y`, `item` |

### `src/scripts.d/tag/event.ts` — 12 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 11 | `push` | `game`, `remove`, `x`, `y`, `ref`, `...params` |
| 15 | `enter` | `game`, `remove`, `x`, `y`, `ref`, `...params` |

### `src/scripts.d/tag/open.ts` — 10 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 3 | `enter` | `game`, `remove`, `xTag`, `yTag`, `doorTag` |
| 8 | `push` | `game`, `remove`, `xTag`, `yTag`, `doorTag` |

### `src/scripts.d/tag/lock.ts` — 9 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 11 | `init` | `game`, `remove`, `x`, `y` |
| 25 | `push` | `game`, `remove`, `x`, `y`, `key` |

### `src/scripts.d/action/photoMogrify.ts` — 6 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 15 | `doMogrify` | `game`, `p0`, `p1` |
| 45 | `main` | `game`, `p0`, `p1` |

### `src/scripts.d/photo/ambient.ts` — 6 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 3 | `main` | `game`, `remove`, `x`, `y`, `paintRef`, `score` |

### `src/scripts.d/photo/art.ts` — 6 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 12 | `main` | `game`, `remove`, `x`, `y`, `paintRef`, `score` |

### `src/scripts.d/tag/goto.ts` — 6 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 10 | `enter` | `game`, `remove`, `x`, `y`, `level`, `startpoint` |

### `src/scripts.d/tag/lookat.ts` — 6 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 8 | `getAngle` | `direction` |
| 27 | `enter` | `game`, `remove`, `x`, `y`, `direction` |

### `src/scripts.d/tag/ambsound.ts` — 5 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 12 | `init` | `game`, `remove`, `x`, `y`, `file` |

### `src/scripts.d/tag/archive.ts` — 5 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 13 | `push` | `game`, `remove`, `x`, `y`, `ref` |

### `src/scripts.d/tag/bgm.ts` — 5 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 11 | `enter` | `game`, `remove`, `x`, `y`, `ref` |

### `src/scripts.d/tag/discard.ts` — 5 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 13 | `push` | `game`, `remove`, `x`, `y`, `ref` |

### `src/scripts.d/tag/locator.ts` — 5 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 13 | `init` | `game`, `remove`, `x`, `y`, `ref` |

### `src/scripts.d/tag/sense.ts` — 5 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 12 | `init` | `game`, `remove`, `x`, `y`, `ref` |

### `src/scripts.d/tag/trigsound.ts` — 5 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 7 | `enter` | `game`, `remove`, `x`, `y`, `sSoundFile` |

### `src/scripts.d/action/spawnWraith.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 12 | `main` | `game`, `ref`, `locator`, `duration` |

### `src/scripts.d/action/unlockDoor.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 6 | `main` | `game`, `locator` |
| 14 | callback of .filter() | `{tag}` |
| 15 | callback of .forEach() | `tag` |

### `src/scripts.d/event/m0_book_glyphs_taken.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 2 | `main` | `game`, `remove`, `x`, `y` |

### `src/scripts.d/event/m0_wraith_skull_face.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 4 | `main` | `game`, `remove`, `x`, `y` |

### `src/scripts.d/event/m1_enter_dark_grove.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 1 | `main` | `game`, `remove`, `x`, `y` |

### `src/scripts.d/event/m1_enter_east_glade.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 1 | `main` | `game`, `remove`, `x`, `y` |

### `src/scripts.d/event/m1_enter_hidden_garden.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 1 | `main` | `game`, `remove`, `x`, `y` |

### `src/scripts.d/event/m1_remise_int_door.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 6 | `main` | `game`, `remove`, `x`, `y` |

### `src/scripts.d/event/mi_lightning_0.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 3 | `main` | `game`, `remove`, `x`, `y` |

### `src/scripts.d/event/test_ghost_ai.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 1 | `main` | `game`, `remove`, `x`, `y` |

### `src/scripts.d/photo/m0_bloody_hands.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 11 | `main` | `game`, `remove`, `x`, `y` |

### `src/scripts.d/photo/m0_cyan_sigil.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 2 | `main` | `game`, `remove`, `x`, `y` |

### `src/scripts.d/photo/m0_fire_place.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 3 | `main` | `game`, `remove`, `x`, `y` |

### `src/scripts.d/photo/m0_skull_face.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 10 | `main` | `game`, `remove`, `x`, `y` |

### `src/scripts.d/photo/m1_secret_pass.ts` — 4 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 3 | `main` | `game`, `remove`, `x`, `y` |

### `src/scripts.d/action/lockDoor.ts` — 2 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 7 | `main` | `game`, `locator` |

### `src/scripts.d/action/resolveClueUnlockSecret.ts` — 2 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 9 | `main` | `game`, `ref` |

### `src/scripts.d/action/showRemotePlace.ts` — 2 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 12 | `main` | `game`, `ref` |

### `src/scripts.d/action/takeAmbientPhoto.ts` — 2 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 4 | `main` | `game`, `ref` |

### `src/scripts.d/action/takeArtPhoto.ts` — 2 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 3 | `main` | `game`, `ref` |

### `src/scripts.d/event/m0_red_sigil_unlock.ts` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 1 | `main` | `game` |

### `src/scripts.d/key/mouse0.ts` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 1 | `keydown` | `game` |

### `src/scripts.d/key/mouse2.ts` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 1 | `keydown` | `game` |

### `src/scripts.d/photo/get-photo-score.ts` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 3 | `getPhotoScore` | `score` |

## Step 8 — Vue components

Component methods and computed properties.

### `src/components/Inventory.vue` — 6 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 40 | callback of .map() | `{item}`, `{count}` |
| 41 | callback of .filter() | `item` |
| 46 | `getItemDataById` | `id` |
| 48 | callback of .find() | `item` |
| 64 | `inventoryItemClicked` | `id` |

### `src/components/Settings.vue` — 6 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 36 | `set` | `value` |
| 44 | `set` | `value` |
| 52 | `set` | `value` |
| 65 | `changeMouseFactor` | `oEvent` |
| 69 | `changeMusicVolume` | `oEvent` |
| 73 | `changeSFXVolume` | `oEvent` |

### `src/components/Notes.vue` — 3 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 59 | `getNoteDataById` | `id` |
| 63 | `noteClicked` | `id` |
| 71 | `noteTypeSelected` | `ref` |

### `src/components/Album.vue` — 2 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 42 | `photoClicked` | `id` |
| 43 | callback of .find() | `p` |

### `src/components/intro/TitleStory.vue` — 2 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 99 | `pause` | `nTime` |
| 121 | `setImageIndex` | `iIndex` |

### `src/components/ItemTypes.vue` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 43 | `selected` | `type` |

### `src/components/PhotoTypes.vue` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 48 | `selected` | `type` |

### `src/components/Sidebar.vue` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 20 | `select` | `tab` |

### `src/components/TypeList.vue` — 1 parameter(s)

| line | function | untyped parameters |
|---:|---|---|
| 28 | `setActiveType` | `ref` |

## Other implicit `any` (not parameters)

33 related diagnostics, also reported by `noImplicitAny`. They will need fixing before the flag can be turned on, but most of them disappear by themselves once the parameters around them are typed.

| file | line | diagnostic |
|---|---:|---|
| `src/Game.ts` | 531 | TS7010 : 'getAimedCellPhotoTags', which lacks return-type annotation, implicitly has an 'any' return type. |
| `src/Game.ts` | 534 | TS7034 : Variable 'aPhotos' implicitly has type 'any' in some locations where its type cannot be determined. |
| `src/Game.ts` | 547 | TS7005 : Variable 'aPhotos' implicitly has an 'any' type. |
| `src/Game.ts` | 952 | TS7034 : Variable 'aTags' implicitly has type 'any[]' in some locations where its type cannot be determined. |
| `src/Game.ts` | 957 | TS7005 : Variable 'aTags' implicitly has an 'any[]' type. |
| `src/Game.ts` | 963 | TS7034 : Variable 'a' implicitly has type 'any[]' in some locations where its type cannot be determined. |
| `src/Game.ts` | 974 | TS7005 : Variable 'a' implicitly has an 'any[]' type. |
| `src/Game.ts` | 1019 | TS7034 : Variable 'aDeleted' implicitly has type 'any[]' in some locations where its type cannot be determined. |
| `src/Game.ts` | 1032 | TS7005 : Variable 'aDeleted' implicitly has an 'any[]' type. |
| `src/engine/Engine.ts` | 750 | TS7053 : Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{}'. |
| `src/engine/thinkers/FPSControlThinker.ts` | 125 | TS7010 : 'keyDown', which lacks return-type annotation, implicitly has an 'any' return type. |
| `src/engine/thinkers/FPSControlThinker.ts` | 136 | TS7010 : 'keyUp', which lacks return-type annotation, implicitly has an 'any' return type. |
| `src/engine/thinkers/FPSControlThinker.ts` | 146 | TS7010 : 'look', which lacks return-type annotation, implicitly has an 'any' return type. |
| `src/engine/thinkers/Thinker.ts` | 79 | TS7053 : Element implicitly has an 'any' type because expression of type 'any' can't be used to index type 'Thinker'. |
| `src/filters/PhotoMogrify.ts` | 85 | TS7010 : '_createMogrifyRegistry', which lacks return-type annotation, implicitly has an 'any[][]' return type. |
| `src/filters/PhotoMogrify.ts` | 88 | TS7034 : Variable 'aRegistry' implicitly has type 'any[]' in some locations where its type cannot be determined. |
| `src/filters/PhotoMogrify.ts` | 95 | TS7005 : Variable 'aRegistry' implicitly has an 'any[]' type. |
| `src/libs/automaton/StateContext.ts` | 39 | TS7053 : Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'StateContext'. |
| `src/libs/canvas-helper.ts` | 241 | TS7034 : Variable 'aLine' implicitly has type 'any[]' in some locations where its type cannot be determined. |
| `src/libs/canvas-helper.ts` | 244 | TS7005 : Variable 'aLine' implicitly has an 'any[]' type. |
| `src/libs/geometry/Vector.ts` | 41 | TS7023 : 'set' implicitly has return type 'any' because it does not have a return type annotation and is referenced directly or indirectly in one ... |
| `src/libs/geometry/index.ts` | 90 | TS7023 : 'angle' implicitly has return type 'any' because it does not have a return type annotation and is referenced directly or indirectly in on... |
| `src/libs/object-helper/Extender.ts` | 24 | TS7023 : 'objectKeyMap' implicitly has return type 'any' because it does not have a return type annotation and is referenced directly or indirectl... |
| `src/libs/object-helper/Extender.ts` | 25 | TS7034 : Variable 'a' implicitly has type 'any[]' in some locations where its type cannot be determined. |
| `src/libs/object-helper/Extender.ts` | 30 | TS7005 : Variable 'a' implicitly has an 'any[]' type. |
| `src/libs/perlin.ts` | 119 | TS7034 : Variable 'data' implicitly has type 'any[]' in some locations where its type cannot be determined. |
| `src/libs/perlin.ts` | 124 | TS7005 : Variable 'data' implicitly has an 'any[]' type. |
| `src/stores/album/state.ts` | 15 | TS7018 : Object literal's property 'photos' implicitly has an 'any[]' type. |
| `src/stores/logic/index.ts` | 15 | TS7053 : Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'. |
| `src/stores/logic/index.ts` | 17 | TS7053 : Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'. |
| `src/stores/logic/index.ts` | 22 | TS7053 : Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{}'. |
| `src/stores/logic/state.ts` | 16 | TS7018 : Object literal's property 'items' implicitly has an 'any[]' type. |
| `src/stores/ui/state.ts` | 10 | TS7018 : Object literal's property 'queue' implicitly has an 'any[]' type. |

