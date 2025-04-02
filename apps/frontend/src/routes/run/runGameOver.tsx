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
  pointsContainerClass,
  detailListClass,
  detailDescriptionClass,
  detailTermClass,
  gameOverButtonsClass,
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
import { useTileSize, getSideSize } from "@/state/constants"

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
          <div class={pointsContainerClass}>
            <Show when={win()}>
              <dl class={detailListClass({ hue: "gold" })}>
                <dt class={detailTermClass}>Deck income</dt>
                <dd class={detailDescriptionClass}>+ ${income()}</dd>
                <Show when={tileCoins()}>
                  {(coins) => (
                    <>
                      <dt class={detailTermClass}>Tile coins</dt>
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
                <div class={gameOverButtonsClass}>
                  <LinkButton hue="crack" kind="dark" href={`/run/${id()}`}>
                    <Rotate />
                    Try same run
                  </LinkButton>
                  <LinkButton hue="bam" kind="dark" href={`/run/${nanoid()}`}>
                    Start new run
                    <ArrowRight />
                  </LinkButton>
                </div>
              }
            >
              <Button hue="bam" kind="dark" onClick={() => onShop()}>
                <Shop />
                Go to shop
              </Button>
            </Show>
          </div>
          <Show when={!win()}>
            <div class={gameOverInfoClass}>
              <h3 class={titleClass}>
                Your Trasure <span class={moneyClass}>${run.money}</span>
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
  const tileSize = useTileSize()
  const sideSize = createMemo(() => getSideSize(tileSize().height))

  return (
    <div class={deckClass}>
      <div class={titleClass}>Your Deck</div>
      <div
        class={deckRowsClass}
        style={{
          "padding-bottom": `${sideSize() * 2}px`,
          "padding-right": `${sideSize() * 2}px`,
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
                    />
                    <BasicTile
                      class={pairClass}
                      style={{
                        transform: `translate(${sideSize()}px, ${sideSize()}px)`,
                      }}
                      material={deckTile.material}
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
