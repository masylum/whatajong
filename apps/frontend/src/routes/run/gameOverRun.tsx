import { calculateSeconds } from "@/state/gameState"
import { useGameState } from "@/state/gameState"
import { batch, createMemo, Show } from "solid-js"
import { Button, LinkButton } from "@/components/button"
import { Rotate, Shop } from "@/components/icon"
import { GameOver } from "@/components/game/gameOver"
import {
  calculatePassiveIncome,
  passiveIncome,
  useRound,
  useRunState,
} from "@/state/runState"
import {
  pointsContainerClass,
  detailListClass,
  detailDescriptionClass,
  detailTermClass,
} from "./gameOverRun.css"
import { nanoid } from "nanoid"
import { useTileState } from "@/state/tileState"
import { sumBy } from "remeda"

export function GameOverRun() {
  const game = useGameState()
  const run = useRunState()
  const tiles = useTileState()

  const round = useRound()
  const time = createMemo(() => calculateSeconds(game))
  const penalty = createMemo(() => Math.floor(time() * round().timerPoints))
  const points = createMemo(() => game.points)
  const totalPoints = createMemo(() => points() - penalty())
  const win = createMemo(() => {
    if (game.endCondition !== "empty-board") return false
    const enoughPoints = totalPoints() >= round().pointObjective
    if (!enoughPoints) return false

    return true
  })
  const achievement = createMemo(() => totalPoints() / round().pointObjective)

  const tileCoins = createMemo(() =>
    sumBy(tiles.filterBy({ deleted: true }), (tile) => tile.coins ?? 0),
  )
  const overAchievementCoins = createMemo(() => {
    const overAchievement = achievement() - 1
    if (overAchievement <= 0) return 0

    return Math.min(Math.floor((overAchievement * 10) / 2), 100)
  })

  const passiveIncomePercentage = createMemo(() => passiveIncome(run))
  const passiveIncomeCoins = createMemo(() => calculatePassiveIncome(run))
  const reward = createMemo(() => round().reward)

  function onShop() {
    batch(() => {
      run.stage = "shop"
      run.money =
        run.money +
        reward() +
        tileCoins() +
        passiveIncomeCoins() +
        overAchievementCoins()
    })
  }

  return (
    <GameOver win={win()}>
      <div class={pointsContainerClass}>
        <Show when={win()}>
          <dl class={detailListClass({ hue: "gold" })}>
            <dt class={detailTermClass}>Round Reward</dt>
            <dd class={detailDescriptionClass}>+ ${reward()}</dd>
            <Show when={tileCoins()}>
              {(coins) => (
                <>
                  <dt class={detailTermClass}>Tile coins</dt>
                  <dd class={detailDescriptionClass}>+ ${coins()}</dd>
                </>
              )}
            </Show>
            <Show when={passiveIncomeCoins()}>
              {(coins) => (
                <>
                  <dt class={detailTermClass}>
                    Passive income ({passiveIncomePercentage() * 100}%)
                  </dt>
                  <dd class={detailDescriptionClass}>+ ${coins()}</dd>
                </>
              )}
            </Show>
            <Show when={overAchievementCoins()}>
              {(coins) => (
                <>
                  <dt class={detailTermClass}>
                    Over achiever ({Math.round(achievement() * 100)} %)
                  </dt>
                  <dd class={detailDescriptionClass}>+ ${coins()}</dd>
                </>
              )}
            </Show>
          </dl>
        </Show>

        <dl class={detailListClass({ hue: "bamb" })}>
          <dt class={detailTermClass}>Points</dt>
          <dd class={detailDescriptionClass}>{points()}</dd>
        </dl>

        <Show when={round().timerPoints}>
          <dl class={detailListClass({ hue: "crack" })}>
            <dt class={detailTermClass}>Time Penalty ({time()} s)</dt>
            <dd class={detailDescriptionClass}>{penalty()}</dd>
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
            <LinkButton hue="crack" kind="dark" href={`/run/${nanoid()}`}>
              <Rotate />
              Try again
            </LinkButton>
          }
        >
          <Button hue="bam" kind="dark" onClick={() => onShop()}>
            <Shop />
            Go to shop
          </Button>
        </Show>
      </div>
      <GameOver.BouncingCards />
    </GameOver>
  )
}
