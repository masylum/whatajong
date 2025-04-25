import { play } from "@/components/audio"
import type { Track } from "@/components/audio"
import { Button, LinkButton } from "@/components/button"
import { Dialog } from "@/components/dialog"
import {
  dialogContentClass,
  dialogItemClass,
  dialogItemsClass,
  dialogTitleClass,
} from "@/components/dialog.css"
import { DustParticles } from "@/components/game/dustParticles"
import { Powerups } from "@/components/game/powerups"
import { Moves, PointsAndPenalty } from "@/components/game/stats"
import { TileComponent } from "@/components/game/tileComponent"
import { GameTutorial } from "@/components/gameTutorial"
import { Bell, Gear, Help, Home, Rotate } from "@/components/icon"
import { BellOff } from "@/components/icon"
import { Mountains } from "@/components/mountains"
import { useTranslation } from "@/i18n/useTranslation"
import {
  type Tile,
  type TileDb,
  getAvailablePairs,
  selectTile,
} from "@/lib/game"
import { useLayoutSize } from "@/state/constants"
import { useDeckState } from "@/state/deckState"
import { GameStateProvider, createGameState } from "@/state/gameState"
import { useGlobalState } from "@/state/globalState"
import { useRound, useRunState } from "@/state/runState"
import { TileStateProvider, createTileState } from "@/state/tileState"
import { createShortcut } from "@solid-primitives/keyboard"
import { nanoid } from "nanoid"
import {
  type Accessor,
  For,
  Show,
  createEffect,
  createMemo,
  createSelector,
  createSignal,
  onMount,
} from "solid-js"
import {
  COMBO_ANIMATION_DURATION,
  containerClass,
  gameRecipe,
  roundClass,
  roundObjectiveClass,
  roundTitleClass,
} from "./runGame.css"
import RunGameOver from "./runGameOver"

export default function RunGame() {
  const run = useRunState()
  const round = useRound()
  const deck = useDeckState()
  const id = createMemo(() => `${run.runId}-${round().id}`)
  const [tutorial, setTutorial] = createSignal(false)

  const tiles = createTileState({ id, deck: deck.all })
  const game = createGameState({ id })

  const [comboAnimation, setComboAnimation] = createSignal(0)

  const getDragonCombo = createMemo(() => game.dragonRun?.combo || 0)
  const getPhoenixCombo = createMemo(() => game.phoenixRun?.combo || 0)
  const layout = useLayoutSize()
  const orientation = createMemo(() => layout().orientation)
  const [hover, setHover] = createSignal<string | null>(null)
  const isHovered = createSelector(hover)

  createVoicesEffect(tiles())

  function handleComboEffect(
    getCombo: Accessor<number>,
    soundEffect: Track,
    resetAnimation = true,
  ) {
    return createEffect((prevCombo: number) => {
      const combo = getCombo()

      if (combo > prevCombo) {
        setComboAnimation(combo)
        play(soundEffect)

        if (resetAnimation) {
          setTimeout(() => {
            setComboAnimation(0)
          }, COMBO_ANIMATION_DURATION)
        }
      }

      return combo
    }, getCombo())
  }

  handleComboEffect(getDragonCombo, "grunt")
  handleComboEffect(getPhoenixCombo, "screech", false)

  // Cheat Code!
  createShortcut(["Shift", "K"], () => {
    console.log("cheat!")
    const pairs = getAvailablePairs(tiles(), game)[0]
    if (!pairs) return
    for (const tile of pairs) {
      selectTile({ tileDb: tiles(), game, tileId: tile.id })
    }
    game.points += 100
  })

  onMount(() => {
    play("gong")
  })

  createEffect(() => {
    console.log(JSON.stringify(game))
  })

  return (
    <GameStateProvider game={game}>
      <TileStateProvider tileDb={tiles()}>
        <Show when={game.startedAt}>
          <Show when={!game.endCondition} fallback={<RunGameOver />}>
            <Show
              when={!tutorial()}
              fallback={<GameTutorial onClose={() => setTutorial(false)} />}
            >
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
                  <TopLeft />
                </div>
                <div
                  class={containerClass({
                    position: "topRight",
                    orientation: orientation(),
                  })}
                >
                  <TopRight setTutorial={setTutorial} />
                </div>
                <div
                  style={{
                    position: "relative",
                    width: `${layout().width}px`,
                    height: `${layout().height}px`,
                    "z-index": 3,
                  }}
                >
                  <For each={tiles().all}>
                    {(tile) => (
                      <TileComponent
                        tile={tile}
                        hovered={isHovered(tile.id)}
                        onSelect={() =>
                          selectTile({ tileDb: tiles(), game, tileId: tile.id })
                        }
                        onMouseEnter={() => setHover(tile.id)}
                        onMouseLeave={() => setHover(null)}
                      />
                    )}
                  </For>
                </div>
                <div
                  class={containerClass({
                    position: "bottomLeft",
                    orientation: orientation(),
                  })}
                >
                  <BottomLeft />
                </div>
                <div
                  class={containerClass({
                    position: "bottomRight",
                    orientation: orientation(),
                  })}
                >
                  <BottomRight />
                </div>
                <Mountains />
                <DustParticles />
                <Powerups />
              </div>
            </Show>
          </Show>
        </Show>
      </TileStateProvider>
    </GameStateProvider>
  )
}

function TopRight(props: { setTutorial: (tutorial: boolean) => void }) {
  const run = useRunState()
  const globalState = useGlobalState()
  const [open, setOpen] = createSignal(false)
  const t = useTranslation()

  // Close the menu when the run changes
  createEffect((prevRunId: string) => {
    if (prevRunId !== run.runId) {
      setOpen(false)
    }

    return run.runId
  }, run.runId)

  return (
    <Dialog
      open={open()}
      onOpenChange={setOpen}
      trigger={
        <Button
          type="button"
          hue="dot"
          title="settings"
          onClick={() => setOpen(true)}
        >
          <Gear />
        </Button>
      }
      content={
        <div class={dialogContentClass}>
          <h1 class={dialogTitleClass}>{t.settings.title()}</h1>
          <div class={dialogItemsClass}>
            <div class={dialogItemClass}>
              <LinkButton href="/" hue="bam" suave>
                <Home />
                {t.settings.goBack()}
              </LinkButton>
            </div>
            <div class={dialogItemClass}>
              <Button
                type="button"
                hue="dot"
                suave
                title="silence"
                onClick={() => {
                  globalState.muted = !globalState.muted
                }}
              >
                <Show when={globalState.muted} fallback={<Bell />}>
                  <BellOff />
                </Show>
                <Show
                  when={globalState.muted}
                  fallback={t.settings.muteSoundEffects()}
                >
                  {t.settings.unmuteSoundEffects()}
                </Show>
              </Button>
            </div>
            <div class={dialogItemClass}>
              <LinkButton href={`/run/${nanoid()}`} hue="crack" suave>
                <Rotate />
                {t.settings.restartRun()}
              </LinkButton>
            </div>
            <div class={dialogItemClass}>
              <Button hue="gold" suave onClick={() => props.setTutorial(true)}>
                <Help />
                {t.common.help()}
              </Button>
            </div>
          </div>
        </div>
      }
    />
  )
}

function TopLeft() {
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

  return <PointsAndPenalty timerPoints={round().timerPoints} />
}

function BottomRight() {
  return <Moves />
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

export function createVoicesEffect(tiles: TileDb) {
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
