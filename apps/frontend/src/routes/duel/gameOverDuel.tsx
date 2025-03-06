import { createMemo } from "solid-js"
import { useGameState, userId } from "@/state/gameState"
import { didPlayerWin } from "@repo/game/game"
import { GameOver } from "@/components/game/gameOver"
import { Button } from "@/components/button"
import { Rotate } from "@/components/icon"
import { playersContainerClass } from "@/components/game/gameOver.css"

export function GameOverDuel(props: {
  onRestartGame: () => void
}) {
  const gameState = useGameState()
  const player = createMemo(() => gameState.players.byId[userId()]!)
  const otherPlayer = createMemo(
    () => gameState.players.all.find((player) => player.id !== userId())!,
  )
  const win = createMemo(() =>
    didPlayerWin(gameState.game.get(), gameState.players, userId()),
  )
  const winningPlayer = createMemo(() => (win() ? player() : otherPlayer()))

  return (
    <GameOver win={win()}>
      <div class={playersContainerClass}>
        <GameOver.PlayerPoints
          player={player()}
          winningPlayer={winningPlayer()}
        />
        <GameOver.PlayerPoints
          player={otherPlayer()}
          winningPlayer={winningPlayer()}
        />
      </div>
      <Button
        hue={win() ? "bamboo" : "character"}
        kind="dark"
        onClick={() => {
          props.onRestartGame()
        }}
      >
        <Rotate />
        Play again
      </Button>
      <GameOver.BouncingCards />
    </GameOver>
  )
}
