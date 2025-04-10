import { play } from "@/components/audio"
import { BasicEmperor } from "@/components/basicEmperor"
import { Button, LinkButton, ShopButton } from "@/components/button"
import { Dialog } from "@/components/dialog"
import {
  dialogContentClass,
  dialogItemClass,
  dialogItemTitleClass,
  dialogItemsClass,
  dialogTitleClass,
} from "@/components/dialog.css"
import { Board } from "@/components/game/board"
import { EmperorDetailsDialog } from "@/components/game/emperorDetails"
import { Frame } from "@/components/game/frame"
import { Moves, PointsAndPenalty } from "@/components/game/stats"
import { Bell, Gear, Home, Rotate, Skull } from "@/components/icon"
import { BellOff } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { selectTile } from "@/lib/game"
import { captureEvent } from "@/lib/observability"
import { shuffleTiles } from "@/lib/shuffleTiles"
import { useLayoutSize } from "@/state/constants"
import { useDeckState } from "@/state/deckState"
import { EMPERORS } from "@/state/emperors"
import {
  GameStateProvider,
  createGameState,
  useGameState,
} from "@/state/gameState"
import { useGlobalState } from "@/state/globalState"
import { useRound, useRunState } from "@/state/runState"
import { type EmperorItem, itemCost } from "@/state/shopState"
import {
  TileStateProvider,
  createTileState,
  useTileState,
} from "@/state/tileState"
import { Dialog as KobalteDialog } from "@kobalte/core/dialog"
import { nanoid } from "nanoid"
import Rand from "rand-seed"
import {
  For,
  Show,
  batch,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
} from "solid-js"
import {
  FLIP_DURATION,
  emperorCardClass,
  emperorDialogButtonsClass,
  emperorDialogClass,
  menuContainerClass,
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

  const tiles = createTileState({ id, deck: deck.all })
  const game = createGameState({ id })

  return (
    <GameStateProvider game={game}>
      <TileStateProvider tileDb={tiles()}>
        <Show when={game.startedAt}>
          <Show when={!game.endCondition} fallback={<RunGameOver />}>
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
              bottomRight={<BottomRight />}
              topLeft={<TopLeft />}
              topRight={<TopRight />}
            />
          </Show>
        </Show>
      </TileStateProvider>
    </GameStateProvider>
  )
}

function TopLeft() {
  const run = useRunState()
  const globalState = useGlobalState()
  const [open, setOpen] = createSignal(false)
  const t = useTranslation()

  createEffect((prevRunId: string) => {
    if (prevRunId !== run.runId) {
      setOpen(false)
    }

    return run.runId
  }, run.runId)

  return (
    <>
      <nav class={menuContainerClass}>
        <LinkButton href="/" hue="bam">
          <Home />
        </LinkButton>
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
                  <LinkButton href={`/run/${nanoid()}`} hue="crack">
                    <Rotate />
                  </LinkButton>
                  <span class={dialogItemTitleClass}>
                    {t.settings.restartRun()}
                  </span>
                </div>
              </div>
            </div>
          }
        />
      </nav>
    </>
  )
}

function TopRight() {
  const run = useRunState()
  const items = createMemo(() =>
    run.items.filter((item) => item.type === "emperor"),
  )

  return <For each={items()}>{(item) => <EmperorCard item={item} />}</For>
}

function EmperorCard(props: { item: EmperorItem }) {
  const [deleted, setDeleted] = createSignal(false)
  const tiles = useTileState()
  const run = useRunState()
  const deck = useDeckState()
  const game = useGameState()
  const layout = useLayoutSize()
  const emperor = createMemo(
    () => EMPERORS.find((emperor) => emperor.name === props.item.name)!,
  )
  const [open, setOpen] = createSignal(false)
  const t = useTranslation()

  function onDiscard() {
    const rng = new Rand()
    play("discard")
    setOpen(false)

    batch(() => {
      shuffleTiles({ rng, tileDb: tiles })

      for (const emperor of run.ownedEmperors) {
        emperor.whenDiscarded?.({ run, deck, game, tileDb: tiles })
      }
    })

    setDeleted(true)

    const sideEffectTimeout = setTimeout(() => {
      batch(() => {
        run.items = run.items.filter((item) => item.id !== props.item.id)
        run.money =
          run.money +
          itemCost(
            {
              type: "emperor",
              id: props.item.id,
              level: props.item.level,
              name: props.item.name,
            },
            run,
          )
      })
    }, FLIP_DURATION)

    onCleanup(() => clearTimeout(sideEffectTimeout))

    captureEvent("emperor_discarded", {
      emperor: props.item.name,
    })
  }

  return (
    <Dialog
      open={open()}
      onOpenChange={setOpen}
      trigger={
        <KobalteDialog.Trigger
          class={emperorCardClass({
            deleted: deleted(),
            orientation: layout().orientation,
          })}
        >
          <BasicEmperor name={props.item.name} />
        </KobalteDialog.Trigger>
      }
      content={
        <div class={emperorDialogClass}>
          <EmperorDetailsDialog emperor={emperor()} />
          <div class={emperorDialogButtonsClass}>
            <ShopButton hue="dot" onClick={onDiscard}>
              <Skull />
              {t.common.discardAndShuffle()}
            </ShopButton>
          </div>
        </div>
      }
    />
  )
}

function BottomLeft() {
  const round = useRound()
  const run = useRunState()
  const t = useTranslation()

  return (
    <>
      <div class={roundClass}>
        <div class={roundTitleClass}>
          {t.common.roundN({ round: run.round })}
        </div>
        <div class={roundObjectiveClass}>{round().pointObjective}</div>
      </div>
      <PointsAndPenalty timerPoints={round().timerPoints} />
    </>
  )
}

function BottomRight() {
  return <Moves />
}
