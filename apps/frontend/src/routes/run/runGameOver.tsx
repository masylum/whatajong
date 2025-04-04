import {
  calculateSeconds,
  createGameState,
  GameStateProvider,
} from "@/state/gameState"
import { batch, createMemo, For, onMount, Show } from "solid-js"
import { Button, LinkButton } from "@/components/button"
import { ArrowRight, Rotate, Shop } from "@/components/icon"
import { GameOver } from "@/components/game/gameOver"
import { getIncome, runGameWin, useRound, useRunState } from "@/state/runState"
import {
  gameOverClass,
  deckRowClass,
  deckRowsClass,
  titleClass,
  deckClass,
  pairClass,
  deckItemClass,
  ownedEmperorsClass,
  ownedEmperorsListClass,
  emperorClass,
  gameOverInfoClass,
  moneyClass,
} from "./runGameOver.css"
import { nanoid } from "nanoid"
import { createTileState } from "@/state/tileState"
import { sumBy } from "remeda"
import { useDeckState } from "@/state/deckState"
import { getRank, getSuit, type DeckTile } from "@/lib/game"
import { splitIntoRows } from "@/lib/splitIntoRows"
import { BasicTile } from "@/components/game/basicTile"
import { BasicEmperor } from "@/components/emperor"
import type { EmperorItem } from "@/state/shopState"
import { captureEvent } from "@/lib/observability"
import { useTileSize } from "@/state/constants"

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

  const tileCoins = createMemo(() =>
    sumBy(tiles().filterBy({ deleted: true }), (tile) => tile.coins ?? 0),
  )
  const overAchievementCoins = createMemo(() => {
    const overAchievement = achievement() - 1
    if (overAchievement <= 0) return 0

    return Math.min(Math.floor((overAchievement * 10) / 2), 100)
  })

  const income = createMemo(() => getIncome(deck, run))

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
                <GameOver.Item label={`Deck inc‌ome (${deck.size})`}>
                  + ${income()}
                </GameOver.Item>
                <Show when={tileCoins()}>
                  {(coins) => (
                    <GameOver.Item label="Tile c‌oins">
                      + ${coins()}
                    </GameOver.Item>
                  )}
                </Show>
                <Show when={overAchievementCoins()}>
                  {(coins) => (
                    <GameOver.Item
                      label={`Over achiever (${Math.round(achievement() * 100)} %)`}
                    >
                      + ${coins()}
                    </GameOver.Item>
                  )}
                </Show>
              </GameOver.List>
            </Show>

            <GameOver.List hue="bam">
              <GameOver.Item label="Points">{points()}</GameOver.Item>
            </GameOver.List>

            <Show when={round().timerPoints}>
              <GameOver.List hue="crack">
                <GameOver.Item label={`Time penalty (${time()} s)`}>
                  {penalty()}
                </GameOver.Item>
              </GameOver.List>
            </Show>

            <GameOver.List hue="dot">
              <GameOver.Item label="Total Points">
                {totalPoints()}
              </GameOver.Item>
              <GameOver.Item label="Objective">
                {round().pointObjective}
              </GameOver.Item>
            </GameOver.List>

            <Show
              when={win()}
              fallback={
                <GameOver.Buttons>
                  <LinkButton hue="crack" kind="dark" href={`/run/${id()}`}>
                    <Rotate />
                    Try same run
                  </LinkButton>
                  <LinkButton hue="bam" kind="dark" href={`/run/${nanoid()}`}>
                    Start new run
                    <ArrowRight />
                  </LinkButton>
                </GameOver.Buttons>
              }
            >
              <Button hue="bam" kind="dark" onClick={() => onShop()}>
                <Shop />
                Go to shop
              </Button>
            </Show>
          </GameOver.Score>
          <Show when={!win()}>
            <div class={gameOverInfoClass}>
              <h3 class={titleClass}>
                Your Treasure <span class={moneyClass}>${run.money}</span>
              </h3>
              <OwnedEmperors />
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

  const deckByRows = createMemo(() => {
    function sortDeckTiles(tiles: DeckTile[]) {
      return tiles.sort((a, b) => {
        const suitA = getSuit(a.card)
        const suitB = getSuit(b.card)
        if (suitA !== suitB) {
          const suitOrder = ["b", "c", "o", "d", "w", "f", "s"]
          return suitOrder.indexOf(suitA) - suitOrder.indexOf(suitB)
        }
        return getRank(a.card).localeCompare(getRank(b.card))
      })
    }

    return splitIntoRows(sortDeckTiles(deck.all), {
      minCols: 9,
      maxCols: 12,
      minRows: 4,
    })
  })
  const tileSize = useTileSize(0.7)

  return (
    <div class={deckClass}>
      <div class={titleClass}>Your Deck</div>
      <div
        class={deckRowsClass}
        style={{
          "padding-bottom": `${tileSize().sideSize * 2}px`,
          "padding-right": `${tileSize().sideSize * 2}px`,
        }}
      >
        <For each={deckByRows()}>
          {(deckTiles, i) => (
            <div class={deckRowClass}>
              <For each={deckTiles}>
                {(deckTile, j) => (
                  <div
                    class={deckItemClass}
                    style={{
                      "z-index": i() * 9 + j(),
                    }}
                  >
                    <BasicTile
                      card={deckTile.card}
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
          )}
        </For>
      </div>
    </div>
  )
}

function OwnedEmperors() {
  const run = useRunState()

  const ownedEmperors = createMemo(
    () => run.items.filter((item) => item.type === "emperor") as EmperorItem[],
  )

  return (
    <div class={ownedEmperorsClass}>
      <div class={titleClass}>Your Crew</div>
      <div class={ownedEmperorsListClass}>
        <For each={ownedEmperors()}>
          {(emperor) => (
            <div class={emperorClass}>
              <BasicEmperor name={emperor.name} />
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
