import { useGameState } from "@/state/gameState"
import { createMemo } from "solid-js"
import { LinkButton } from "@/components/button"
import { Rotate } from "@/components/icon"
import { GameOver } from "@/components/game/gameOver"
import { nanoid } from "nanoid"
import { pointsContainerClass } from "./gameOverSolo.css"

export function GameOverSolo() {
  const game = useGameState()
  const win = createMemo(() => game.endCondition === "empty-board")

  return (
    <GameOver win={win()}>
      <div class={pointsContainerClass({ win: win() })}>
        <GameOver.Points points={game.points} />
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
