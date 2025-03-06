import { pointsContainerClass } from "@/components/game/gameOver.css"
import { calculateSeconds, userId } from "@/state/gameState"
import { useGameState } from "@/state/gameState"
import { createMemo, Show } from "solid-js"
import { Button } from "@/components/button"
import { Shop } from "@/components/icon"
import { GameOver } from "@/components/game/gameOver"
import { useRound, useRunState } from "@/state/runState"

export function GameOverRun() {
  const gameState = useGameState()
  const run = useRunState()
  const player = createMemo(() => gameState.players.byId[userId()]!)
  const round = useRound()
  const time = createMemo(() => calculateSeconds(gameState))
  const points = createMemo(() => player().points - time())
  const win = createMemo(() => {
    const enoughPoints = points() >= round().pointObjective
    if (!enoughPoints) return false

    if (round().challengeType === "suddenDeath") {
      return gameState.game.get().endCondition === "empty-board"
    }

    return true
  })

  function onShop() {
    run.set({
      roundStage: "shop",
      reroll: 0,
      money: run.get().money + round().reward,
    })
  }

  return (
    <GameOver win={win()}>
      <div class={pointsContainerClass({ multiplayer: false })}>
        <div>Round objective: {round().pointObjective}</div>
        <GameOver.Points points={points()} />
        <GameOver.Time />
      </div>
      <Show when={win()} fallback={"TODO: screen for loss"}>
        <Button
          hue={win() ? "bamboo" : "character"}
          kind="dark"
          onClick={() => onShop()}
        >
          <Shop />
          Go to shop
        </Button>
      </Show>
      <GameOver.BouncingCards />
    </GameOver>
  )
}
