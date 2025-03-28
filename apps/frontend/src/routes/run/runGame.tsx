import { batch, createMemo, createSignal, For, onCleanup, Show } from "solid-js"
import { GameStateProvider, createGameState, started } from "@/state/gameState"
import { Board } from "@/components/game/board"
import { GameOverRun } from "./gameOverRun"
import { useRound, useRunState } from "@/state/runState"
import { Frame } from "@/components/game/frame"
import {
  cardBackButtonClass,
  cardBackClass,
  cardClass,
  cardFrontClass,
  containerClass,
  emperorCardClass,
  FLIP_DURATION,
  menuContainerClass,
  roundTitleClass,
  roundObjectiveClass,
  topContainerClass,
  roundClass,
  emperorsClass,
} from "./runGame.css"
import { Powerups } from "@/components/game/powerups"
import { Bell, Goal, Skull } from "@/components/icon"
import { Button } from "@/components/button"
import { Moves, Points } from "@/components/game/stats"
import { BellOff } from "@/components/icon"
import { useDeckState } from "@/state/deckState"
import { getOwnedEmperors, selectTile } from "@/lib/game"
import {
  createTileState,
  TileStateProvider,
  useTileState,
} from "@/state/tileState"
import { Emperor } from "@/components/emperor"
import { shuffleTiles } from "@/lib/shuffleTiles"
import Rand from "rand-seed"
import { SELL_EMPEROR_AMOUNT, type EmperorItem } from "@/state/shopState"
import { useGlobalState } from "@/state/globalState"

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
                bottom={<Bottom />}
                top={<Top />}
              />
            }
          >
            <GameOverRun />
          </Show>
        </Show>
      </TileStateProvider>
    </GameStateProvider>
  )
}

function Top() {
  const run = useRunState()
  const round = useRound()
  const items = createMemo(() =>
    run.items.filter((item) => item.type === "emperor"),
  )

  return (
    <div class={containerClass}>
      <div class={topContainerClass}>
        <div class={roundClass}>
          <div class={roundTitleClass}>Round {run.round}</div>
          <div class={roundObjectiveClass}>
            <Goal /> {round().pointObjective} points
          </div>
        </div>
        <div class={emperorsClass}>
          <For each={items()}>{(item) => <EmperorCard item={item} />}</For>
        </div>
      </div>
      <Powerups />
    </div>
  )
}

function EmperorCard(props: { item: EmperorItem }) {
  const [open, setOpen] = createSignal(false)
  const [deleted, setDeleted] = createSignal(false)
  const tiles = useTileState()
  const run = useRunState()

  function onDiscard() {
    const rng = new Rand()

    batch(() => {
      shuffleTiles({ rng, tileDb: tiles })

      for (const emperor of getOwnedEmperors(run)) {
        emperor.whenDiscarded?.()
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
  }

  return (
    <div
      class={emperorCardClass({ deleted: deleted() })}
      onClick={() => setOpen(!open())}
    >
      <div data-tour="emperors" class={cardClass({ open: open() })}>
        <div class={cardFrontClass}>
          <Emperor name={props.item.name} />
        </div>
        <div class={cardBackClass}>
          <span>shuffle</span>
          <button class={cardBackButtonClass} type="button" onClick={onDiscard}>
            <Skull />
          </button>
        </div>
      </div>
    </div>
  )
}

function Bottom() {
  const round = useRound()
  const globalState = useGlobalState()

  return (
    <div class={containerClass}>
      <Points timerPoints={round().timerPoints} />
      <nav class={menuContainerClass}>
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
      <Moves />
    </div>
  )
}
