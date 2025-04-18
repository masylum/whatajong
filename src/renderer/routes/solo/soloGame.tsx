import { LinkButton } from "@/components/button"
import { Button } from "@/components/button"
import { Dialog } from "@/components/dialog"
import {
  dialogContentClass,
  dialogItemClass,
  dialogItemTitleClass,
  dialogItemsClass,
  dialogTitleClass,
} from "@/components/dialog.css"
import { Board } from "@/components/game/board"
import { Frame } from "@/components/game/frame"
import { Moves, PointsAndPenalty } from "@/components/game/stats"
import { GameTutorial } from "@/components/gameTutorial"
import { Bell, BellOff, Gear, Home, Rotate } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { getStandardDeck, selectTile } from "@/lib/game"
import { captureRun } from "@/lib/observability"
import { GameStateProvider, createGameState } from "@/state/gameState"
import { useGlobalState } from "@/state/globalState"
import { RunStateProvider, createRunState, useRunState } from "@/state/runState"
import { TileStateProvider, createTileState } from "@/state/tileState"
import { useParams } from "@solidjs/router"
import { nanoid } from "nanoid"
import { Show, createEffect, createMemo, createSignal } from "solid-js"
import { GameOverSolo } from "./soloGameOver"

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
            <Show when={game.startedAt}>
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
  const t = useTranslation()
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
          <h1 class={dialogTitleClass}>{t.settings.soundEffects()}</h1>
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
              <span class={dialogItemTitleClass}>
                {t.settings.soundEffects()}
              </span>
            </div>
            <div class={dialogItemClass}>
              <LinkButton href={`/play/${nanoid()}`} hue="crack">
                <Rotate />
              </LinkButton>
              <span class={dialogItemTitleClass}>{t.settings.restart()}</span>
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
