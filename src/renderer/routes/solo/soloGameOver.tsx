import { calculateSeconds, useGameState } from "@/state/gameState"
import { createMemo } from "solid-js"
import { LinkButton } from "@/components/button"
import { ArrowLeft, Rotate } from "@/components/icon"
import { GameOver } from "@/components/game/gameOver"
import { nanoid } from "nanoid"
import { TIMER_POINTS } from "./soloGame"

export function GameOverSolo() {
  const game = useGameState()
  const win = createMemo(() => game.endCondition === "empty-board")
  const time = createMemo(() => calculateSeconds(game))
  const penalty = createMemo(() => Math.floor(time() * TIMER_POINTS))
  const points = createMemo(() => game.points)
  const totalPoints = createMemo(() => points() - penalty())

  return (
    <GameOver win={win()}>
      <GameOver.Score>
        <GameOver.List hue="bam">
          <GameOver.Item label="Points">{points()}</GameOver.Item>
        </GameOver.List>
        <GameOver.List hue="crack">
          <GameOver.Item label={`Time penalty (${time()} s)`}>
            {penalty()}
          </GameOver.Item>
        </GameOver.List>

        <GameOver.List hue="dot">
          <GameOver.Item label="Total Points">{totalPoints()}</GameOver.Item>
        </GameOver.List>
      </GameOver.Score>

      <GameOver.Buttons>
        <LinkButton hue={"dot"} kind="dark" href="/">
          <ArrowLeft />
          Back
        </LinkButton>
        <LinkButton
          hue={win() ? "bam" : "crack"}
          kind="dark"
          href={`/play/${nanoid()}`}
        >
          <Rotate />
          Play again
        </LinkButton>
      </GameOver.Buttons>
      <GameOver.BouncingCards />
    </GameOver>
  )
}
