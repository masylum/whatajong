import { batch, createMemo, createSignal, For, onCleanup, Show } from "solid-js"
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
import { Powerups } from "@/components/game/powerups"
import { Bell, Goal, Home, Skull } from "@/components/icon"
import { Button, LinkButton } from "@/components/button"
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
import { Dialog } from "@kobalte/core/dialog"
import { EmperorDetailsDialog } from "@/components/game/emperorHover"
import { getEmperors } from "@/state/emperors"
import { Modal } from "@/components/dialog"

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
          <Powerups />
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

  return (
    <>
      <nav class={menuContainerClass}>
        <LinkButton href="/" hue="bam">
          <Home />
        </LinkButton>
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

  function onDiscard() {
    const rng = new Rand()

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
    <Modal
      trigger={
        <Dialog.Trigger
          class={emperorCardClass({
            deleted: deleted(),
            orientation: layout().orientation,
          })}
        >
          <BasicEmperor name={props.item.name} />
        </Dialog.Trigger>
      }
      content={
        <div class={emperorDialogClass}>
          <EmperorDetailsDialog emperor={emperor()} />
          <div class={emperorDialogButtonsClass}>
            shuffle the board and
            <Button type="button" hue="dot" onClick={onDiscard}>
              <Skull />
              Discard
            </Button>
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
