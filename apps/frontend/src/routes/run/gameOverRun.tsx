import { calculateSeconds, userId } from "@/state/gameState"
import { useGameState } from "@/state/gameState"
import { createMemo, Show } from "solid-js"
import { Button, LinkButton } from "@/components/button"
import { Rotate, Shop } from "@/components/icon"
import { GameOver } from "@/components/game/gameOver"
import { useRound, useRunState } from "@/state/runState"
import { getCoins } from "@repo/game/game"
import {
  pointsContainerClass,
  detailListClass,
  detailDescriptionClass,
  detailTermClass,
} from "./gameOverRun.css"
import { nanoid } from "nanoid"

export function GameOverRun() {
  const gameState = useGameState()
  const run = useRunState()
  const player = createMemo(() => gameState.players.byId[userId()]!)
  const round = useRound()
  const time = createMemo(() => calculateSeconds(gameState))
  const penalty = createMemo(() => time() * round().timerPoints)
  const bonus = createMemo(() => {
    const isEmpty = gameState.game.get().endCondition === "empty-board"
    if (!isEmpty) return 0

    return round().emptyBoardBonus
  })
  const points = createMemo(() => player().points)
  const totalPoints = createMemo(() => points() - penalty() + bonus())
  const win = createMemo(() => {
    const enoughPoints = totalPoints() >= round().pointObjective
    if (!enoughPoints) return false

    return true
  })
  const achievement = createMemo(() => totalPoints() / round().pointObjective)

  const tileCoins = createMemo(() => {
    return gameState.tiles.all
      .filter((tile) => tile.deletedBy)
      .map((tile) => getCoins(tile.material))
      .reduce((a, b) => a + b, 0)
  })
  const overAchievementCoins = createMemo(() => {
    const overAchievement = achievement() - 1
    if (overAchievement <= 0) return 0

    return Math.floor((overAchievement * 10) / 3)
  })

  const passiveIncome = createMemo(() => run.get().shopLevel - 1)
  const reward = createMemo(() => round().reward)

  function onShop() {
    run.set({
      stage: "shop",
      money:
        run.get().money +
        reward() +
        tileCoins() +
        passiveIncome() +
        overAchievementCoins(),
    })
  }

  return (
    <GameOver win={win()}>
      <div class={pointsContainerClass}>
        <dl class={detailListClass({ hue: "gold" })}>
          <dt class={detailTermClass}>Round Reward</dt>
          <dd class={detailDescriptionClass}>+{reward()}</dd>
          <Show when={tileCoins()}>
            {(coins) => (
              <>
                <dt class={detailTermClass}>Tile coins</dt>
                <dd class={detailDescriptionClass}>+{coins()}</dd>
              </>
            )}
          </Show>
          <Show when={passiveIncome()}>
            {(coins) => (
              <>
                <dt class={detailTermClass}>Passive income</dt>
                <dd class={detailDescriptionClass}>+{coins()}</dd>
              </>
            )}
          </Show>
          <Show when={overAchievementCoins()}>
            {(coins) => (
              <>
                <dt class={detailTermClass}>
                  Over achiever ({Math.round(achievement() * 100)} %)
                </dt>
                <dd class={detailDescriptionClass}>+{coins()}</dd>
              </>
            )}
          </Show>
        </dl>

        <dl class={detailListClass({ hue: "bamb" })}>
          <dt class={detailTermClass}>Points</dt>
          <dd class={detailDescriptionClass}>{points()}</dd>
          <Show when={round().emptyBoardBonus}>
            <dt class={detailTermClass}>Bonus</dt>
            <dd class={detailDescriptionClass}>{round().emptyBoardBonus}</dd>
          </Show>
        </dl>

        <Show when={round().timerPoints}>
          <dl class={detailListClass({ hue: "crack" })}>
            <dt class={detailTermClass}>Penalty</dt>
            <dd class={detailDescriptionClass}>{time()}</dd>
          </dl>
        </Show>

        <dl class={detailListClass({ hue: "dot" })}>
          <dt class={detailTermClass}>Total Points</dt>
          <dd class={detailDescriptionClass}>{totalPoints()}</dd>
          <dt class={detailTermClass}>Objective</dt>
          <dd class={detailDescriptionClass}>{round().pointObjective}</dd>
        </dl>

        <Show
          when={win()}
          fallback={
            <LinkButton hue="character" kind="dark" href={`/run/${nanoid()}`}>
              <Rotate />
              Try again
            </LinkButton>
          }
        >
          <Button hue="bamboo" kind="dark" onClick={() => onShop()}>
            <Shop />
            Go to shop
          </Button>
        </Show>
      </div>
      <GameOver.BouncingCards />
    </GameOver>
  )
}
