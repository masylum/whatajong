import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  Show,
} from "solid-js"
import { GameStateProvider, createGameState, started } from "@/state/gameState"
import { Board } from "@/components/game/board"
import { useRound, useRunState } from "@/state/runState"
import { Frame } from "@/components/game/frame"
import {
  emperorCardClass,
  FLIP_DURATION,
  menuContainerClass,
  roundTitleClass,
  roundObjectiveClass,
  roundClass,
  roundObjectiveIconClass,
  emperorDialogButtonsClass,
  emperorDialogClass,
} from "./runGame.css"
import { Bell, Gear, Goal, Home, Rotate, Skull } from "@/components/icon"
import { Button, LinkButton, ShopButton } from "@/components/button"
import { Moves, PointsAndPenalty } from "@/components/game/stats"
import { BellOff } from "@/components/icon"
import { useDeckState } from "@/state/deckState"
import { getOwnedEmperors, selectTile } from "@/lib/game"
import {
  createTileState,
  TileStateProvider,
  useTileState,
} from "@/state/tileState"
import { BasicEmperor } from "@/components/emperor"
import { shuffleTiles } from "@/lib/shuffleTiles"
import Rand from "rand-seed"
import { SELL_EMPEROR_AMOUNT, type EmperorItem } from "@/state/shopState"
import { useGlobalState } from "@/state/globalState"
import RunGameOver from "./runGameOver"
import { captureEvent } from "@/lib/observability"
import { useLayoutSize } from "@/state/constants"
import { Dialog as KobalteDialog } from "@kobalte/core/dialog"
import { EmperorDetailsDialog } from "@/components/game/emperorDetails"
import { getEmperors } from "@/state/emperors"
import { Dialog } from "@/components/dialog"
import {
  dialogContentClass,
  dialogTitleClass,
  dialogItemClass,
  dialogItemTitleClass,
  dialogItemsClass,
} from "@/components/dialog.css"
import { nanoid } from "nanoid"

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
        <Show when={started(game)}>
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
  const round = useRound()
  const globalState = useGlobalState()
  const [open, setOpen] = createSignal(false)

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
                  <LinkButton href={`/run/${nanoid()}`} hue="crack">
                    <Rotate />
                  </LinkButton>
                  <span class={dialogItemTitleClass}>Restart the run</span>
                </div>
              </div>
            </div>
          }
        />
      </nav>
      <div class={roundClass}>
        <div class={roundTitleClass}>Round {run.round}</div>
        <div class={roundObjectiveClass}>
          <Goal class={roundObjectiveIconClass} /> {round().pointObjective}{" "}
          points
        </div>
      </div>
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
  const layout = useLayoutSize()
  const emperor = createMemo(
    () => getEmperors().find((emperor) => emperor.name === props.item.name)!,
  )
  const [open, setOpen] = createSignal(false)

  function onDiscard() {
    const rng = new Rand()
    setOpen(false)

    batch(() => {
      shuffleTiles({ rng, tileDb: tiles })

      for (const emperor of getOwnedEmperors(run)) {
        emperor.whenDiscarded?.({ run, deck, tiles })
      }
    })

    const deltedTimeout = setTimeout(() => {
      setDeleted(true)

      const sideEffectTimeout = setTimeout(() => {
        batch(() => {
          run.items = run.items.filter((item) => item.id !== props.item.id)
          run.money = run.money + SELL_EMPEROR_AMOUNT
        })
      }, FLIP_DURATION)

      onCleanup(() => clearTimeout(sideEffectTimeout))
    }, FLIP_DURATION)

    onCleanup(() => clearTimeout(deltedTimeout))

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
              Discard and Shuffle
            </ShopButton>
          </div>
        </div>
      }
    />
  )
}

function BottomLeft() {
  const round = useRound()
  return <PointsAndPenalty timerPoints={round().timerPoints} />
}

function BottomRight() {
  return <Moves />
}
