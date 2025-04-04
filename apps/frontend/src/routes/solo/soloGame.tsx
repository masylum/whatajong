import { createEffect, createMemo, createSignal, Show } from "solid-js"
import { createGameState, GameStateProvider, started } from "@/state/gameState"
import { Board } from "@/components/game/board"
import { useParams } from "@solidjs/router"
import { getStandardDeck, selectTile } from "@/lib/game"
import { GameOverSolo } from "./soloGameOver"
import { Frame } from "@/components/game/frame"
import { LinkButton } from "@/components/button"
import { PointsAndPenalty, Moves } from "@/components/game/stats"
import { Button } from "@/components/button"
import { Rotate, Home, Gear, BellOff, Bell } from "@/components/icon"
import { nanoid } from "nanoid"
import { createTileState, TileStateProvider } from "@/state/tileState"
import { createRunState, RunStateProvider, useRunState } from "@/state/runState"
import { captureRun } from "@/lib/observability"
import { GameTutorial } from "@/components/gameTutorial"
import { Dialog } from "@/components/dialog"
import { useGlobalState } from "@/state/globalState"
import {
  dialogContentClass,
  dialogTitleClass,
  dialogItemClass,
  dialogItemTitleClass,
  dialogItemsClass,
} from "@/components/dialog.css"

export const TIMER_POINTS = 0.25

export function Solo() {
  const params = useParams()
  const id = createMemo(() => `solo-${params.id}`)

  const run = createRunState({ id })
  const tiles = createTileState({ id, deck: getStandardDeck() })
  const game = createGameState({ id })

  createEffect(() => {
    captureRun(id(), "solo")
  })

  return (
    <RunStateProvider run={run}>
      <GameStateProvider game={game}>
        <TileStateProvider tileDb={tiles()}>
          <GameTutorial>
            <Show when={started(game)}>
              <Show
                when={game.endedAt}
                fallback={
                  <Frame
                    board={
                      <Board
                        onSelectTile={(tileId) =>
                          selectTile({
                            tileDb: tiles(),
                            run,
                            game,
                            tileId,
                          })
                        }
                      />
                    }
                    bottomLeft={<BottomLeft />}
                    topLeft={<TopLeft />}
                    bottomRight={<BottomRight />}
                    topRight={<TopRight />}
                  />
                }
              >
                <GameOverSolo />
              </Show>
            </Show>
          </GameTutorial>
        </TileStateProvider>
      </GameStateProvider>
    </RunStateProvider>
  )
}

function TopLeft() {
  return (
    <LinkButton href="/" hue="bam">
      <Home />
    </LinkButton>
  )
}

function TopRight() {
  const [open, setOpen] = createSignal(false)
  const globalState = useGlobalState()
  const run = useRunState()

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
          <h1 class={dialogTitleClass}>Settings</h1>
          <div class={dialogItemsClass}>
            <div class={dialogItemClass}>
              <Button
                type="button"
                hue="dot"
                title="silence"
                onClick={() => {
                  globalState.muted = !globalState.muted
                }}
              >
                <Show when={globalState.muted} fallback={<Bell />}>
                  <BellOff />
                </Show>
              </Button>
              <span class={dialogItemTitleClass}>Sound effects</span>
            </div>
            <div class={dialogItemClass}>
              <LinkButton href={`/play/${nanoid()}`} hue="crack">
                <Rotate />
              </LinkButton>
              <span class={dialogItemTitleClass}>Restart the game</span>
            </div>
          </div>
        </div>
      }
    />
  )
}

function BottomLeft() {
  return <PointsAndPenalty timerPoints={TIMER_POINTS} />
}

function BottomRight() {
  return <Moves />
}
