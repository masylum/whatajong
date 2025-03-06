import { pointsContainerClass } from "@/components/game/gameOver.css"
import { userId } from "@/state/gameState"
import { useGameState } from "@/state/gameState"
import { createMemo } from "solid-js"
import { LinkButton } from "@/components/button"
import { Rotate } from "@/components/icon"
import { GameOver } from "@/components/game/gameOver"
import { nanoid } from "nanoid"

export function GameOverSolo() {
  const gameState = useGameState()
  const player = createMemo(() => gameState.players.byId[userId()]!)
  const win = createMemo(
    () => gameState.game.get().endCondition === "empty-board",
  )

  return (
    <GameOver win={win()}>
      <div class={pointsContainerClass({ multiplayer: false })}>
        <GameOver.Points points={player().points} />
        <GameOver.Time />
      </div>
      <LinkButton
        hue={win() ? "bamboo" : "character"}
        kind="dark"
        href={`/play/${nanoid()}`}
      >
        <Rotate />
        Play again
      </LinkButton>
      <GameOver.BouncingCards />
    </GameOver>
  )
}
