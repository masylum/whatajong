import { Button, LinkButton } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import { GameOver } from "@/components/game/gameOver"
import { ArrowRight, Rotate, Shop } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { getCard } from "@/lib/game"
import { captureEvent } from "@/lib/observability"
import { useSmallerTileSize } from "@/state/constants"
import { useDeckState } from "@/state/deckState"
import {
  GameStateProvider,
  calculateSeconds,
  createGameState,
} from "@/state/gameState"
import { runGameWin, useRound, useRunState } from "@/state/runState"
import { createTileState } from "@/state/tileState"
import { nanoid } from "nanoid"
import { sumBy } from "remeda"
import { For, Show, batch, createMemo, onMount } from "solid-js"
import {
  deckClass,
  deckItemClass,
  deckRowsClass,
  gameOverClass,
  gameOverInfoClass,
  moneyClass,
  pairClass,
} from "./runGameOver.css"

export default function RunGameOver() {
  const run = useRunState()
  const round = useRound()
  const id = createMemo(() => `${run.runId}-${round().id}`)
  const game = createGameState({ id })
  const deck = useDeckState()
  const tiles = createTileState({ id, deck: deck.all })

  const time = createMemo(() => calculateSeconds(game))
  const penalty = createMemo(() => Math.floor(time() * round().timerPoints))
  const points = createMemo(() => game.points)
  const totalPoints = createMemo(() => points() - penalty())
  const win = createMemo(() => runGameWin(game, run))
  const achievement = createMemo(() => totalPoints() / round().pointObjective)
  const t = useTranslation()

  const tileCoins = createMemo(() =>
    sumBy(tiles().filterBy({ deleted: true }), (tile) => tile.coins ?? 0),
  )
  const overAchievementCoins = createMemo(() => {
    const overAchievement = achievement() - 1
    if (overAchievement <= 0) return 0

    return Math.min(Math.floor(overAchievement * 2), 12)
  })

  const income = createMemo(() => run.round * 3)

  function onShop() {
    batch(() => {
      run.stage = "shop"
      run.money = run.money + income() + tileCoins() + overAchievementCoins()
    })
  }

  onMount(() => {
    captureEvent("game_over", {
      win: win(),
      points: totalPoints(),
      round: round().id,
      roundObjective: round().pointObjective,
      roundTimerPoints: round().timerPoints,
      tileCoins: tileCoins(),
      overAchievementCoins: overAchievementCoins(),
      income: income(),
      time: time(),
    })
  })

  return (
    <GameStateProvider game={game}>
      <GameOver win={win()} round={run.round}>
        <div class={gameOverClass}>
          <GameOver.Score>
            <Show when={win()}>
              <GameOver.List hue="gold">
                <GameOver.Item
                  label={t.gameOver.deckIncome({ deckSize: deck.size })}
                >
                  + ${income()}
                </GameOver.Item>
                <Show when={tileCoins()}>
                  {(coins) => (
                    <GameOver.Item label={t.gameOver.tileCoins()}>
                      + ${coins()}
                    </GameOver.Item>
                  )}
                </Show>
                <Show when={overAchievementCoins()}>
                  {(coins) => (
                    <GameOver.Item
                      label={t.gameOver.overachiever({
                        percent: Math.round(achievement() * 100),
                      })}
                    >
                      + ${coins()}
                    </GameOver.Item>
                  )}
                </Show>
              </GameOver.List>
            </Show>

            <GameOver.List hue="bam">
              <GameOver.Item label={t.common.points()}>
                {points()}
              </GameOver.Item>
            </GameOver.List>

            <Show when={round().timerPoints}>
              <GameOver.List hue="crack">
                <GameOver.Item label={t.gameOver.timePenalty({ time: time() })}>
                  {penalty()}
                </GameOver.Item>
              </GameOver.List>
            </Show>

            <GameOver.List hue="dot">
              <GameOver.Item label={t.gameOver.totalPoints()}>
                {totalPoints()}
              </GameOver.Item>
              <GameOver.Item label={t.common.objective()}>
                {round().pointObjective}
              </GameOver.Item>
            </GameOver.List>

            <GameOver.Buttons>
              <Show
                when={win()}
                fallback={
                  <>
                    <LinkButton hue="crack" kind="dark" href={`/run/${id()}`}>
                      <Rotate />
                      {t.gameOver.trySameRun()}
                    </LinkButton>
                    <LinkButton hue="bam" kind="dark" href={`/run/${nanoid()}`}>
                      {t.gameOver.startNewRun()}
                      <ArrowRight />
                    </LinkButton>
                  </>
                }
              >
                <Button hue="bam" kind="dark" onClick={() => onShop()}>
                  <Shop />
                  {t.common.goToShop()}
                </Button>
              </Show>
            </GameOver.Buttons>
          </GameOver.Score>
          <Show when={!win()}>
            <div class={gameOverInfoClass}>
              <span class={moneyClass}>${run.money}</span>
              <Deck />
            </div>
          </Show>
        </div>
        <GameOver.BouncingCards />
      </GameOver>
    </GameStateProvider>
  )
}

function Deck() {
  const deck = useDeckState()

  const sortedDeck = createMemo(() =>
    deck.all.sort((a, b) => {
      const aCard = getCard(a.cardId)
      const bCard = getCard(b.cardId)
      if (aCard.suit !== bCard.suit) {
        const suitOrder = ["b", "c", "o", "d", "w", "f", "s"]
        return suitOrder.indexOf(aCard.suit) - suitOrder.indexOf(bCard.suit)
      }
      return aCard.rank.localeCompare(bCard.rank)
    }),
  )
  const tileSize = useSmallerTileSize(0.5)

  return (
    <div class={deckClass}>
      <div
        class={deckRowsClass}
        style={{
          "padding-bottom": `${tileSize().sideSize * 2}px`,
          "padding-right": `${tileSize().sideSize * 2}px`,
        }}
      >
        <For each={sortedDeck()}>
          {(deckTile, i) => (
            <div
              class={deckItemClass}
              style={{
                "z-index": i(),
              }}
            >
              <BasicTile
                cardId={deckTile.cardId}
                material={deckTile.material}
                width={tileSize().width}
              />
              <BasicTile
                class={pairClass}
                style={{
                  transform: `translate(${tileSize().sideSize}px, ${tileSize().sideSize}px)`,
                }}
                material={deckTile.material}
                width={tileSize().width}
              />
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
