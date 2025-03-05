import { useParams } from "@solidjs/router"
import { batch, createEffect, createMemo, Show } from "solid-js"
import {
  GameStateProvider,
  initGameState,
  saveGameState,
  started,
} from "@/state/gameState"
import { Board } from "@/components/game/board"
import { GameOverSinglePlayer } from "@/components/game/gameOver"
import { useRunState } from "@/state/runState"
import { selectTile } from "@repo/game/game"

export default function RunGame() {
  const params = useParams()
  const run = useRunState()

  const gameState = createMemo(() =>
    initGameState(params.gameId!, {
      map: run.get().map,
      initialPoints: run.get().initialPoints,
      deck: run.get().deck,
    }),
  )

  createEffect(() => {
    saveGameState(params.id!)
  })

  return (
    <GameStateProvider gameState={gameState()}>
      <Show when={started(gameState().game.get())}>
        <Show
          when={gameState().game.get().endedAt}
          fallback={
            <Board
              onSelectTile={(selection) =>
                batch(() => {
                  selectTile(gameState(), selection)
                })
              }
            />
          }
        >
          <GameOverSinglePlayer />
        </Show>
      </Show>
    </GameStateProvider>
  )
}
