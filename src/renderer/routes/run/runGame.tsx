import { play, useMusic } from "@/components/audio"
import { Background } from "@/components/background"
import { DustParticles } from "@/components/game/dustParticles"
import { Powerups } from "@/components/game/powerups"
import { TileComponent } from "@/components/game/tileComponent"
import { Menu } from "@/components/menu"
import { Text } from "@/components/text"
import { useTranslation } from "@/i18n/useTranslation"
import {
  type Suit,
  type Tile,
  type TileDb,
  getActiveShadows,
  getAvailablePairs,
  isWind,
  selectTile,
} from "@/lib/game"
import { useIsLagging, useLaggingValue } from "@/lib/useOffsetValues"
import { FLOATING_NUMBER_DURATION, animate } from "@/state/animationState"
import { useLayoutSize } from "@/state/constants"
import { useDeckState } from "@/state/deckState"
import { initialGameState, useGameState } from "@/state/gameState"
import { setMutable } from "@/state/persistantMutable"
import { roundPersistentKey, useRound, useRunState } from "@/state/runState"
import { initializeTileState, useTileState } from "@/state/tileState"
import { FALLING_NUMBER_DURATION } from "@/styles/animations.css"
import { createShortcut } from "@solid-primitives/keyboard"
import { createTimer } from "@solid-primitives/timer"
import Rand from "rand-seed"
import {
  type Accessor,
  For,
  Match,
  Show,
  Switch,
  batch,
  createEffect,
  createMemo,
  createSelector,
  createSignal,
  onMount,
} from "solid-js"
import {
  COMBO_ANIMATION_DURATION,
  arrowBoard1Class,
  arrowBoard2Class,
  arrowBoard3Class,
  bamClass,
  coinsClass,
  containerClass,
  crackClass,
  dotClass,
  gameRecipe,
  movesClass,
  penaltyClass,
  pillClass,
  pointsClass,
  roundClass,
  roundObjectiveClass,
  roundTitleClass,
  tiles1ArrowClass,
  timerClass,
  tutorialClass,
} from "./runGame.css"
import RunGameOver from "./runGameOver"

export default function RunGame() {
  const run = useRunState()
  const deck = useDeckState()
  const game = useGameState()
  const tiles = useTileState()

  const layout = useLayoutSize()
  const orientation = createMemo(() => layout().orientation)

  createTimer(
    () => {
      game.time += 1
    },
    () => !game.pause && 1000,
    setInterval,
  )

  useMusic("game")

  onMount(() => {
    play("tiles")
    play("gong")
  })
  const comboAnimation = useComboEffect()

  // Cheat: Resolve pair
  createShortcut(["Shift", "K"], () => {
    console.log("cheat!")
    const pairs = getAvailablePairs(tiles, game).sort(
      // remove top to bottom and winds last
      // this is the easiest heuristic to solve the game
      (a, b) => {
        const aIsWind = isWind(a[0]!.cardId)
        const bIsWind = isWind(b[0]!.cardId)
        if (aIsWind && !bIsWind) return 1
        if (!aIsWind && bIsWind) return -1

        return b[0]!.z + b[1]!.z - (a[0]!.z + a[1]!.z)
      },
    )[0]
    if (!pairs) return
    for (const tile of pairs) {
      selectTile({ tileDb: tiles, game, tileId: tile.id })
    }
    game.points += 100
  })

  const num = createMemo(() => {
    const rnd = new Rand(`${run.runId}-${run.round}`)
    return Math.floor(rnd.next() * 4)
  })

  // Cheat: Provoke restart
  createShortcut(["Shift", "R"], () => {
    batch(() => {
      run.retries += 1
      const key = roundPersistentKey(run)
      setMutable(game, initialGameState(run.runId))
      initializeTileState(key, deck.all, tiles)
    })
  })

  return (
    <Show when={!game.endCondition} fallback={<RunGameOver />}>
      <Background num={num()}>
        <div
          class={gameRecipe({
            comboAnimation: comboAnimation() as any,
          })}
        >
          <div
            class={containerClass({
              position: "topLeft",
              orientation: orientation(),
            })}
          >
            <Menu />
          </div>
          <div
            class={containerClass({
              position: "topRight",
              orientation: orientation(),
              sudo: game.tutorialStep === 1,
            })}
          >
            <TopRight />
          </div>
          <div
            style={{
              position: "relative",
              width: `${layout().width}px`,
              height: `${layout().height}px`,
              "z-index": 3,
            }}
          >
            <Board />
          </div>
          <div
            class={containerClass({
              position: "bottomLeft",
              orientation: orientation(),
              sudo: game.tutorialStep === 5,
            })}
          >
            <BottomLeft />
          </div>
          <div
            class={containerClass({
              position: "bottomRight",
              orientation: orientation(),
              sudo: game.tutorialStep === 6 || game.tutorialStep === 7,
            })}
          >
            <BottomRight />
          </div>

          <Tutorial />
          <DustParticles />
          <Powerups />
        </div>
      </Background>
    </Show>
  )
}

function Tutorial() {
  const game = useGameState()
  const t = useTranslation()
  const tiles = useTileState()
  const deletedTiles = createMemo(
    () => tiles.filterBy({ deleted: true }).length,
  )

  function onPointerDown() {
    game.tutorialStep = game.tutorialStep! + 1
  }

  createEffect(() => {
    const delTiles = deletedTiles()
    const step = game.tutorialStep

    if ((step === 3 && delTiles > 0) || (step === 4 && delTiles > 10)) {
      game.tutorialStep = game.tutorialStep! + 1
    }

    return delTiles
  })

  return (
    <Show when={game.tutorialStep !== null}>
      <Switch>
        <Match when={game.tutorialStep === 1}>
          <div class={tutorialClass} onPointerDown={onPointerDown}>
            <p innerHTML={t.tutorial.tiles1({ crackClass })} />
            <svg
              width="118"
              height="168"
              viewBox="0 0 118 168"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class={tiles1ArrowClass}
            >
              <path
                d="M49.89 48.513c-16.103 13.974-29.617 34.795-36.728 54.83-4.032 11.362-5.893 23.444-6.836 35.433a187 187 0 0 0-.557 18.607c.037 1.807 1.676 9.243.08 10.217C.475 170.874-.07 143.589.082 140.648c.643-12.439 1.91-25.029 5.607-36.963 6.2-20.02 17.044-40.926 31.837-55.923C46.14 39.03 54.68 30.19 65.14 23.455a83.3 83.3 0 0 1 13.92-7.22c3.433-1.386 6.981-2.718 10.567-3.656 2.656-.695 6.423-.226 8.814-1.315-3.37-3.234-9.766-3.515-13.505-6.604-4.444-3.673.127-5.163 3.897-4.479 6 1.089 11.764 3.172 17.577 4.962 4.953 1.526 11.654 2.28 11.122 8.597-.467 5.547-3.127 11.068-4.729 16.328-1.071 3.517-1.585 11.722-5.737 13.138-12.976 4.424 1.195-21.989 1.372-24.214-2.162.16-4.395 1.419-6.531 1.952-3.09.77-6.256 1.09-9.345 1.875-5.824 1.48-11.665 3.653-17.078 6.256C66.096 33.591 56.73 40.68 49.89 48.513c.989-1.133-5.826 5.055 0 0"
                fill="#222221"
              />
            </svg>
          </div>
        </Match>
        <Match when={game.tutorialStep === 2}>
          <div class={tutorialClass} onPointerDown={onPointerDown}>
            <p innerHTML={t.tutorial.tiles2()} />
            <p>{t.tutorial.tiles3()}</p>
          </div>
        </Match>
        <Match when={game.tutorialStep === 5}>
          <div class={tutorialClass} onPointerDown={onPointerDown}>
            <p innerHTML={t.tutorial.board1({ bamClass })} />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="111"
              height="140"
              viewBox="0 0 111 140"
              fill="none"
              class={arrowBoard1Class}
            >
              <path
                d="M61.55 100.336c14.795-11 27.802-28.07 35.238-44.88 4.216-9.533 6.607-19.828 8.202-30.103a162 162 0 0 0 1.692-16.005c.085-1.561-.843-8.079.597-8.814 4.845-2.473 3.537 21.086 3.215 23.612-1.364 10.682-3.278 21.454-7.242 31.502-6.648 16.856-17.36 34.174-31.09 46.14-7.995 6.967-15.935 14.034-25.39 19.158a72 72 0 0 1-12.471 5.319c-3.051.97-6.197 1.887-9.35 2.463-2.335.426-5.552-.224-7.684.559 2.694 3.008 8.19 3.667 11.213 6.573 3.592 3.456-.446 4.443-3.651 3.608-5.102-1.33-9.937-3.501-14.831-5.423-4.172-1.638-9.9-2.724-9.03-8.136.765-4.752 3.418-9.339 5.142-13.769 1.152-2.963 2.13-10.003 5.802-10.953 11.475-2.97-2.463 18.879-2.76 20.786 1.873.003 3.881-.937 5.757-1.257 2.714-.463 5.465-.532 8.179-1.008 5.117-.896 10.295-2.389 15.131-4.282 8.388-3.281 16.924-8.782 23.332-15.09-.927.912 5.352-3.98 0 0"
                fill="#222221"
              />
            </svg>
          </div>
        </Match>
        <Match when={game.tutorialStep === 6}>
          <div class={tutorialClass} onPointerDown={onPointerDown}>
            <p innerHTML={t.tutorial.board2({ crackClass })} />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="58"
              height="120"
              viewBox="0 0 58 120"
              fill="none"
              class={arrowBoard2Class}
            >
              <path
                d="M57.236 80.292c-7.085 2.785-7.552 4.482-7.09 23.502-1.368-1.255-2.424-2.046-3.26-3.019-7.856-9.14-14.356-19.17-19.65-29.935-8.675-17.641-16.01-35.816-21.35-54.721-1.118-3.96-2.99-7.967-1.145-12.392C5.095 2.876 3.573 1.262 2.916 0L1.168.275C.755 2.619-.211 5.023.04 7.295c.561 5.054 1.294 10.167 2.733 15.032 5.326 17.998 11.551 35.74 20.42 52.335 5.304 9.926 12.042 19.112 18.249 28.558 1.632 2.483 3.685 4.696 6.354 8.05-2.343-.728-3.712-.877-4.764-1.526-7.116-4.393-14.155-8.909-21.244-13.345-1.701-1.065-3.63-3.581-5.522-1.274-1.928 2.352.99 3.713 2.476 4.964 9.591 8.081 20.383 14.175 31.98 19.043 5.396 2.265 7.868-.025 7.158-5.435-.61-4.636-1.377-9.274-2.469-13.82-1.543-6.421-1.473-12.633 1.824-19.585"
                fill="#000"
              />
            </svg>
          </div>
        </Match>
        <Match when={game.tutorialStep === 7}>
          <div class={tutorialClass} onPointerDown={onPointerDown}>
            <p innerHTML={t.tutorial.board3({ dotClass })} />
            <p>{t.tutorial.board4()}</p>
            <svg
              width="51"
              height="62"
              viewBox="0 0 102 124"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class={arrowBoard3Class}
            >
              <path
                d="M0 2.242c5.21-3.379 10.327-2.377 14.906-.65 6.314 2.382 12.62 5.245 18.235 8.958C58.868 27.567 74.115 51.873 80.59 81.81c1.667 7.704 2.129 15.671 3.237 24.241 7.106-4.081 10.704-11.997 17.914-16.707.928 3.526-.821 5.813-2.328 7.86-5.9 8.015-11.88 15.979-18.08 23.763-3.008 3.778-5.347 3.997-8.556.829-6.638-6.55-10.855-14.474-12.022-23.854-.05-.405.588-.897 1.236-1.816 7.585 1.993 5.775 11.708 12.409 15.307 2.78-12.293.685-23.887-2.535-35.336C68.54 64.27 64.13 52.875 57.006 42.722c-6.935-9.883-15.617-18.001-25.054-25.424C22.495 9.86 11.835 5.105 0 2.242"
                fill="#000"
              />
            </svg>
          </div>
        </Match>
      </Switch>
    </Show>
  )
}

function TopRight() {
  const run = useRunState()
  const round = useRound()
  const t = useTranslation()

  return (
    <div class={roundClass}>
      <div class={roundTitleClass}>{t.common.roundN({ round: run.round })}</div>
      <div class={roundObjectiveClass}>{round().pointObjective}</div>
    </div>
  )
}

function BottomLeft() {
  const round = useRound()
  const game = useGameState()

  return (
    <>
      <Points points={game.points} />
      <Penalty points={game.time * round().timerPoints} />
    </>
  )
}

function BottomRight() {
  const game = useGameState()

  return (
    <>
      <Coins coins={game.coins} />
      <Moves />
    </>
  )
}

const EXPRESSIONS = [
  "great",
  "nice",
  "super",
  "awesome",
  "amazing",
  "unreal",
  "fantastic",
  "legendary",
] as const

const FAST_SELECTION_THRESHOLD = 3000

function useSoundEffects(tiles: TileDb) {
  const [lastTileTime, setLastTileTime] = createSignal<number>(0)
  const [speedStreak, setSpeedStreak] = createSignal<number>(0)
  const userDeletions = createMemo(() => tiles.filterBy({ deleted: true }))

  createEffect((prevDeletions: Tile[]) => {
    const deletions = userDeletions()
    if (deletions.length === prevDeletions.length) return deletions

    // Only process if selection count has increased (a new selection was made)
    // We use the length as a proxy for a new selection being added
    const now = Date.now()
    const lastTime = lastTileTime()
    const timeDiff = now - lastTime

    if (lastTime === 0 || timeDiff > FAST_SELECTION_THRESHOLD) {
      setSpeedStreak(0)
    } else {
      const newStreak = speedStreak() + 1
      setSpeedStreak(newStreak)

      if (newStreak >= 3) {
        const expressionIndex = newStreak - 3
        const expressionSound = EXPRESSIONS[expressionIndex]
        if (expressionSound) {
          play(expressionSound)
        }
      }
    }

    setLastTileTime(now)
    return deletions
  }, userDeletions())
}

export function Points(props: { points: number }) {
  const t = useTranslation()
  const animation = useIsLagging(() => props.points, FALLING_NUMBER_DURATION)

  return (
    <div data-tour="points" class={pointsClass({ animation: animation() })}>
      <span>{t.common.points()}</span>
      <div class={pillClass({ hue: "bam" })}>
        <Text animation="fallingNumber">{props.points}</Text>
      </div>
    </div>
  )
}

export function Coins(props: { coins: number }) {
  const t = useTranslation()
  const animation = useIsLagging(() => props.coins, FALLING_NUMBER_DURATION)

  return (
    <div data-tour="coins" class={coinsClass({ animation: animation() })}>
      <span>{t.common.coins()}</span>
      <div class={pillClass({ hue: "crack" })}>
        <Text animation="fallingNumber">{props.coins}</Text>
      </div>
    </div>
  )
}

export function Penalty(props: { points: number }) {
  const t = useTranslation()
  const game = useGameState()
  const points = createMemo(() => Math.floor(props.points))
  const animation = useIsLagging(() => points(), FALLING_NUMBER_DURATION)
  const width = createMemo(() => (props.points - points()) * 100)

  return (
    <div
      data-tour="penalty"
      class={penaltyClass({ paused: game.pause, animation: animation() })}
    >
      <span>{game.pause ? t.common.paused() : t.common.penalty()}</span>
      <div class={pillClass({ hue: "black" })}>
        <div class={timerClass} style={{ width: `${width()}%` }} />
        <Text animation="fallingNumber">{points()}</Text>
      </div>
    </div>
  )
}

type Urgency = "normal" | "mild" | "moderate" | "urgent"

function Moves() {
  const tiles = useTileState()
  const game = useGameState()
  const pairs = createMemo(() => getAvailablePairs(tiles, game).length)

  const urgencyLevel = createMemo(() => {
    const pairsCount = pairs()
    const tilesAlive = tiles.filterBy({ deleted: false })

    if (tilesAlive.length <= 6) {
      return "normal"
    }

    if (pairsCount <= 1) {
      return "urgent"
    }

    if (pairsCount <= 2) {
      return "moderate"
    }

    if (pairsCount <= 3) {
      return "mild"
    }

    return "normal"
  })

  createEffect((prevPairs: number) => {
    const newPairs = pairs()
    const tilesAlive = tiles.filterBy({ deleted: false })

    // do not alarm for the last few moves
    if (tilesAlive.length <= 6) {
      return newPairs
    }

    if (prevPairs > 1 && newPairs === 1) {
      play("alarm3")
    } else if (prevPairs > 2 && newPairs === 2) {
      play("alarm2")
    } else if (prevPairs > 3 && newPairs === 3) {
      play("alarm1")
    }

    return newPairs
  }, pairs())

  return <MovesIndicator urgency={urgencyLevel()} pairs={pairs()} />
}

export function MovesIndicator(props: {
  urgency: Urgency
  pairs: number
}) {
  const t = useTranslation()
  const animation = useIsLagging(() => props.pairs, FALLING_NUMBER_DURATION)
  const hueForUrgency = createMemo(() => {
    switch (props.urgency) {
      case "mild":
        return "bone"
      case "moderate":
        return "bone"
      case "urgent":
        return "crack"
      default:
        return "dot"
    }
  })

  return (
    <div
      data-tour="moves"
      class={movesClass({ urgency: props.urgency, animation: animation() })}
    >
      <span>{t.common.moves()}</span>
      <div class={pillClass({ hue: hueForUrgency() })}>
        <Text animation="fallingNumber">{props.pairs}</Text>
      </div>
    </div>
  )
}

export function Board() {
  const [hover, setHover] = createSignal<string | null>(null)
  const tileDb = useTileState()
  const activeShadows = createMemo(() => getActiveShadows(tileDb))

  onMount(() => {
    batch(() => {
      for (const tile of tileDb.all) {
        animate({ id: tile.id, name: "fall" })
      }
    })
  })

  useSoundEffects(tileDb)

  return (
    <For each={tileDb.all}>
      {(tile) => (
        <TileWrapper
          hover={hover}
          setHover={setHover}
          tile={tile}
          activeShadows={activeShadows()}
        />
      )}
    </For>
  )
}

function TileWrapper(props: {
  tile: Tile
  hover: Accessor<string | null>
  activeShadows: Set<Suit>
  setHover: (hover: string | null) => void
}) {
  const game = useGameState()
  const tileDb = useTileState()
  const isHovered = createSelector(props.hover)
  const deleted = useLaggingValue(
    () => props.tile.deleted,
    FLOATING_NUMBER_DURATION,
  )

  return (
    <Show when={!deleted()}>
      <TileComponent
        tile={props.tile}
        hovered={isHovered(props.tile.id)}
        onSelect={() => selectTile({ tileDb, game, tileId: props.tile.id })}
        onMouseEnter={() => props.setHover(props.tile.id)}
        onMouseLeave={() => props.setHover(null)}
        activeShadows={props.activeShadows}
      />
    </Show>
  )
}

export function useComboEffect() {
  const game = useGameState()
  const [comboAnimation, setComboAnimation] = createSignal(0)
  const getDragonCombo = createMemo(() => game.dragonRun?.combo)
  const getPhoenixCombo = createMemo(() => game.phoenixRun?.combo)
  const effects = [
    {
      getCombo: getDragonCombo,
      startSound: "dragon",
      soundEffect: "grunt",
      endSound: "end_dragon",
    },
    {
      getCombo: getPhoenixCombo,
      startSound: "phoenix",
      soundEffect: "screech",
      endSound: "end_phoenix",
    },
  ] as const

  for (const effect of effects) {
    createEffect((prevCombo: number | undefined) => {
      const combo = effect.getCombo()

      if (prevCombo === undefined && combo !== undefined) {
        play(effect.startSound)
      } else if (prevCombo && !combo) {
        play(effect.endSound)
      } else if (combo && prevCombo && combo > prevCombo) {
        setComboAnimation(combo)
        play(effect.soundEffect)

        setTimeout(() => {
          setComboAnimation(0)
        }, COMBO_ANIMATION_DURATION)
      }

      return combo
    }, effect.getCombo())
  }

  return comboAnimation
}
