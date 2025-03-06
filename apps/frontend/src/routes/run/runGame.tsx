import { createMemo, Show } from "solid-js"
import {
  GameStateProvider,
  createGameState,
  muted,
  setMuted,
  useGameState,
  userId,
} from "@/state/gameState"
import { Board } from "@/components/game/board"
import { GameOverRun } from "./gameOverRun"
import { useRound, useRunState } from "@/state/runState"
import { selectTile } from "@repo/game/game"
import { Frame } from "@/components/game/frame"
import { container, menuContainer } from "../solo/soloGame.css"
import { Powerups } from "@/components/game/powerups"
import { Bell } from "@/components/icon"
import { Button } from "@/components/button"
import { Moves, Points } from "@/components/game/stats"
import { BellOff } from "@/components/icon"
import { useDeckState } from "@/state/deckState"

export default function RunGame() {
  const run = useRunState()
  const round = useRound()
  const deck = useDeckState()

  const { state, started } = createGameState(
    () => `game-${run.get().runId}-${round().id}`,
    {
      map: run.get().map,
      initialPoints: run.get().initialPoints,
      deck: deck.all,
    },
  )

  return (
    <GameStateProvider gameState={state()}>
      <Show when={started()}>
        <Show
          when={state().game.get().endedAt}
          fallback={
            <Frame
              board={
                <Board
                  onSelectTile={(selection) => selectTile(state(), selection)}
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
    </GameStateProvider>
  )
}

function Top() {
  const gameState = useGameState()
  const player = createMemo(() => gameState.players.get(userId())!)

  return (
    <div class={container}>
      TODO: info about the round
      <Powerups player={player()} />
    </div>
  )
}

function Bottom() {
  const gameState = useGameState()
  const player = createMemo(() => gameState.players.get(userId())!)

  return (
    <div class={container}>
      <Points player={player()} />
      <nav class={menuContainer}>
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
