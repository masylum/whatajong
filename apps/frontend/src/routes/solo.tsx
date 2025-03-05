import { batch, createEffect, createMemo, Show } from "solid-js"
import {
  GameStateProvider,
  initGameState,
  saveGameState,
  started,
} from "@/state/gameState"
import { Board } from "@/components/game/board"
import { GameOverSinglePlayer } from "@/components/game/gameOver"
import { useParams } from "@solidjs/router"
import { getStandardPairs } from "@repo/game/deck"
import { selectTile } from "@repo/game/game"

export function Solo() {
  const params = useParams()

  const gameState = createMemo(() =>
    initGameState(params.id!, {
      map: "default",
      initialPoints: 150,
      deck: getStandardPairs(),
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
