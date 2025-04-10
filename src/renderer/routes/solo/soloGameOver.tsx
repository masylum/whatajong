import { LinkButton } from "@/components/button"
import { GameOver } from "@/components/game/gameOver"
import { ArrowLeft, Rotate } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { calculateSeconds, useGameState } from "@/state/gameState"
import { nanoid } from "nanoid"
import { createMemo } from "solid-js"
import { TIMER_POINTS } from "./soloGame"

export function GameOverSolo() {
  const game = useGameState()
  const win = createMemo(() => game.endCondition === "empty-board")
  const time = createMemo(() => calculateSeconds(game))
  const penalty = createMemo(() => Math.floor(time() * TIMER_POINTS))
  const points = createMemo(() => game.points)
  const totalPoints = createMemo(() => points() - penalty())
  const t = useTranslation()

  return (
    <GameOver win={win()}>
      <GameOver.Score>
        <GameOver.List hue="bam">
          <GameOver.Item label={t.common.points()}>{points()}</GameOver.Item>
        </GameOver.List>
        <GameOver.List hue="crack">
          <GameOver.Item label={t.gameOver.timePenalty({ time: time() })}>
            {penalty()}
          </GameOver.Item>
        </GameOver.List>

        <GameOver.List hue="dot">
          <GameOver.Item label={t.gameOver.totalPoints()}>
            {totalPoints()}
          </GameOver.Item>
        </GameOver.List>
      </GameOver.Score>

      <GameOver.Buttons>
        <LinkButton hue="dot" kind="dark" href="/">
          <ArrowLeft />
          {t.common.prev()}
        </LinkButton>
        <LinkButton
          hue={win() ? "bam" : "crack"}
          kind="dark"
          href={`/play/${nanoid()}`}
        >
          <Rotate />
          {t.gameOver.playAgain()}
        </LinkButton>
      </GameOver.Buttons>
      <GameOver.BouncingCards />
    </GameOver>
  )
}
