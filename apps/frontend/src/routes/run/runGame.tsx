import { createMemo, createSignal, For, onCleanup, Show } from "solid-js"
import {
  GameStateProvider,
  createGameState,
  muted,
  setMuted,
  started,
} from "@/state/gameState"
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
  roundClass,
  topContainerClass,
} from "./runGame.css"
import { Powerups } from "@/components/game/powerups"
import { Bell, Skull } from "@/components/icon"
import { Button } from "@/components/button"
import { Moves, Points } from "@/components/game/stats"
import { BellOff } from "@/components/icon"
import { useDeckState } from "@/state/deckState"
import { selectTile } from "@/lib/game"
import {
  createTileState,
  TileStateProvider,
  useTileState,
} from "@/state/tileState"
import { Emperor } from "@/components/emperor"
import { shuffleTiles } from "@/lib/shuffleTiles"
import Rand from "rand-seed"
import type { EmperorItem } from "@/state/shopState"

export default function RunGame() {
  const run = useRunState()
  const round = useRound()
  const deck = useDeckState()
  const id = createMemo(() => `${run.runId}-${round().id}`)

  const tiles = createTileState({ id, deck: deck.all })
  const state = createGameState({ id })

  return (
    <GameStateProvider game={state}>
      <TileStateProvider tileDb={tiles()}>
        <Show when={started(state)}>
          <Show
            when={state.endedAt}
            fallback={
              <Frame
                board={
                  <Board
                    onSelectTile={(tileId) =>
                      selectTile({
                        tileDb: tiles(),
                        run,
                        game: state,
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
  const items = createMemo(() =>
    run.items.filter((item) => item.type === "emperor"),
  )

  return (
    <div class={containerClass}>
      <div class={topContainerClass}>
        <div class={roundClass}>
          <div class={roundTitleClass}>Round {run.round}</div>
        </div>
        <div class={roundClass}>
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
    shuffleTiles({ rng, tileDb: tiles })

    const deltedTimeout = setTimeout(() => {
      setDeleted(true)

      const sideEffectTimeout = setTimeout(() => {
        run.items = run.items.filter((item) => item.id !== props.item.id)
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
      <div class={cardClass({ open: open() })}>
        <div class={cardFrontClass}>
          <Emperor name={props.item.name} />
        </div>
        <div class={cardBackClass}>
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

  return (
    <div class={containerClass}>
      <Points timerPoints={round().timerPoints} />
      <nav class={menuContainerClass}>
        <Button
          type="button"
          hue="dot"
          title="silence"
          onClick={() => setMuted(!muted())}
        >
          <Show when={muted()} fallback={<Bell />}>
            <BellOff />
          </Show>
        </Button>
      </nav>
      <Moves />
    </div>
  )
}
