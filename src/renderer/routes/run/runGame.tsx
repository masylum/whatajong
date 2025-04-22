import { Button, LinkButton } from "@/components/button"
import { Dialog } from "@/components/dialog"
import {
  dialogContentClass,
  dialogItemClass,
  dialogItemsClass,
  dialogTitleClass,
} from "@/components/dialog.css"
import { Board } from "@/components/game/board"
import { Frame } from "@/components/game/frame"
import { Moves, PointsAndPenalty } from "@/components/game/stats"
import { GameTutorial } from "@/components/gameTutorial"
import { Bell, Gear, Help, Home, Rotate } from "@/components/icon"
import { BellOff } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { selectTile } from "@/lib/game"
import { useDeckState } from "@/state/deckState"
import { GameStateProvider, createGameState } from "@/state/gameState"
import { useGlobalState } from "@/state/globalState"
import { useRound, useRunState } from "@/state/runState"
import { TileStateProvider, createTileState } from "@/state/tileState"
import { nanoid } from "nanoid"
import { Show, createEffect, createMemo, createSignal } from "solid-js"
import { roundClass, roundObjectiveClass, roundTitleClass } from "./runGame.css"
import RunGameOver from "./runGameOver"

export default function RunGame() {
  const run = useRunState()
  const round = useRound()
  const deck = useDeckState()
  const id = createMemo(() => `${run.runId}-${round().id}`)
  const [tutorial, setTutorial] = createSignal(false)

  const tiles = createTileState({ id, deck: deck.all })
  const game = createGameState({ id })

  return (
    <GameStateProvider game={game}>
      <TileStateProvider tileDb={tiles()}>
        <Show when={game.startedAt}>
          <Show when={!game.endCondition} fallback={<RunGameOver />}>
            <Show
              when={tutorial()}
              fallback={
                <Frame
                  board={
                    <Board
                      onSelectTile={(tileId) =>
                        selectTile({ tileDb: tiles(), game, tileId })
                      }
                    />
                  }
                  bottomLeft={<BottomLeft />}
                  bottomRight={<BottomRight />}
                  topLeft={<TopLeft />}
                  topRight={<TopRight onTutorial={setTutorial} />}
                />
              }
            >
              <GameTutorial onClose={() => setTutorial(false)} />
            </Show>
          </Show>
        </Show>
      </TileStateProvider>
    </GameStateProvider>
  )
}

function TopRight(props: { onTutorial: (tutorial: boolean) => void }) {
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
              <Button hue="gold" suave onClick={() => props.onTutorial(true)}>
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
