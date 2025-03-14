import { createMemo, For, Show } from "solid-js"
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
  containerClass,
  menuContainerClass,
  roundBoxClass,
  roundClass,
  topContainerClass,
} from "./runGame.css"
import { Powerups } from "@/components/game/powerups"
import { Bell } from "@/components/icon"
import { Button } from "@/components/button"
import { Moves, Points } from "@/components/game/stats"
import { BellOff } from "@/components/icon"
import { useDeckState } from "@/state/deckState"
import { getEmperors, selectTile } from "@/lib/game"
import { createTileState, TileStateProvider } from "@/state/tileState"
import { createPowerupState, PowerupStateProvider } from "@/state/powerupState"
import { Emperor } from "@/components/emperor"

export default function RunGame() {
  const run = useRunState()
  const round = useRound()
  const deck = useDeckState()
  const id = createMemo(() => `${run.runId}-${round().id}`)

  const tiles = createTileState({ id, deck: deck.all })
  const powerups = createPowerupState({ id })
  const state = createGameState({ id })

  return (
    <GameStateProvider game={state}>
      <TileStateProvider tileDb={tiles()}>
        <PowerupStateProvider powerupDb={powerups()}>
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
                          powerupsDb: powerups(),
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
        </PowerupStateProvider>
      </TileStateProvider>
    </GameStateProvider>
  )
}

function Top() {
  const run = useRunState()
  const emperors = createMemo(() => getEmperors(run))

  return (
    <div class={containerClass}>
      <div class={topContainerClass}>
        <div class={roundClass}>
          <div class={roundBoxClass({ hue: "bamboo" })}>Round {run.round}</div>
          <div class={roundBoxClass({ hue: "gold" })}>Coins: {run.money}</div>
        </div>
        <For each={emperors()}>
          {(emperor) => <Emperor name={emperor.name} />}
        </For>
      </div>
      <Powerups />
    </div>
  )
}

function Bottom() {
  return (
    <div class={containerClass}>
      <Points />
      <nav class={menuContainerClass}>
        <Button
          type="button"
          hue="circle"
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
