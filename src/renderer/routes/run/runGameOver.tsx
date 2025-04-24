import { Button, LinkButton } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import { ArrowRight, Rotate, Shop } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { type Card, type CardId, getAllTiles, getCard } from "@/lib/game"
import { captureEvent } from "@/lib/observability"
import { pick, shuffle } from "@/lib/rand"
import { useSmallerTileSize } from "@/state/constants"
import { useDeckState } from "@/state/deckState"
import {
  GameStateProvider,
  calculateSeconds,
  createGameState,
} from "@/state/gameState"
import {
  REWARDS,
  calculateIncome,
  runGameWin,
  useRound,
  useRunState,
} from "@/state/runState"
import { buyTile, generateTileItems, useShopState } from "@/state/shopState"
import { createTileState } from "@/state/tileState"
import type { AccentHue } from "@/styles/colors"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import { nanoid } from "nanoid"
import Rand from "rand-seed"
import { sumBy } from "remeda"
import {
  For,
  type ParentProps,
  Show,
  batch,
  createMemo,
  onMount,
} from "solid-js"
import {
  bouncingCardClass,
  buttonsClass,
  deckClass,
  deckItemClass,
  deckRowsClass,
  detailDescriptionClass,
  detailListClass,
  detailTermClass,
  duration,
  endX,
  gameOverClass,
  gameOverInfoClass,
  moneyClass,
  pairClass,
  rotation,
  scoreClass,
  screenClass,
  startX,
  titleClass,
} from "./runGameOver.css"

export default function RunGameOver() {
  const run = useRunState()
  const round = useRound()
  const id = createMemo(() => `${run.runId}-${round().id}`)
  const game = createGameState({ id })
  const deck = useDeckState()
  const tiles = createTileState({ id, deck: deck.all })
  const shop = useShopState()

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
  const income = createMemo(() => calculateIncome(run))

  function onShop() {
    batch(() => {
      run.round += 1
      run.stage = run.round in REWARDS ? "reward" : "shop"

      // rewards
      const items = generateTileItems({ i: 0, level: run.round, strict: true })
      for (const item of items) {
        buyTile({ run, shop, item, deck, reward: true })
      }

      run.money += income() + tileCoins() + overAchievementCoins()
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
          <Score>
            <Show when={win()}>
              <List hue="gold">
                <Item label={t.gameOver.roundReward()}>+ ${income()}</Item>
                <Show when={tileCoins()}>
                  {(coins) => (
                    <Item label={t.gameOver.tileCoins()}>+ ${coins()}</Item>
                  )}
                </Show>
                <Show when={overAchievementCoins()}>
                  {(coins) => (
                    <Item
                      label={t.gameOver.overachiever({
                        percent: Math.round(achievement() * 100),
                      })}
                    >
                      + ${coins()}
                    </Item>
                  )}
                </Show>
              </List>
            </Show>

            <List hue="bam">
              <Item label={t.common.points()}>{points()}</Item>
            </List>

            <Show when={round().timerPoints}>
              <List hue="crack">
                <Item label={t.gameOver.timePenalty({ time: time() })}>
                  {penalty()}
                </Item>
              </List>
            </Show>

            <List hue="dot">
              <Item label={t.gameOver.totalPoints()}>{totalPoints()}</Item>
              <Item label={t.common.objective()}>{round().pointObjective}</Item>
            </List>

            <Buttons>
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
            </Buttons>
          </Score>
          <Show when={!win()}>
            <div class={gameOverInfoClass}>
              <span class={moneyClass}>${run.money}</span>
              <Deck />
            </div>
          </Show>
        </div>
        <FallingTiles />
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

// biome-ignore format:
const WIN_TITLES = [ "victory", "success", "champion", "awesome", "winner", "glorious", "wellPlayed" ] as const
// biome-ignore format:
const DEFEAT_TITLES = [ "defeat", "gameOver", "oops", "failed", "crushed", "wasted" ] as const

function GameOver(props: { win: boolean; round?: number } & ParentProps) {
  return (
    <div class={gameOverClass}>
      <div class={screenClass({ win: props.win })}>
        <Title win={props.win} round={props.round} />
        {props.children}
      </div>
    </div>
  )
}

function FallingTile(props: { cardId: CardId }) {
  const cardStartX = createMemo(() => Math.random() * window.innerWidth)
  const cardEndX = createMemo(() => cardStartX() + (Math.random() - 0.5) * 400)
  const cardRotation = createMemo(() => (Math.random() - 0.5) * 720)
  const cardDuration = createMemo(() => 7 + Math.random() * 12)
  const delay = createMemo(() => Math.random() * 10)
  const tileSize = useSmallerTileSize(0.8)

  return (
    <div
      style={{
        ...assignInlineVars({
          [startX]: `${cardStartX()}px`,
          [endX]: `${cardEndX()}px`,
          [rotation]: `${cardRotation()}deg`,
          [duration]: `${cardDuration()}s`,
        }),
        "animation-delay": `${delay()}s`,
      }}
      class={bouncingCardClass}
    >
      <BasicTile width={tileSize().width} cardId={props.cardId} />
    </div>
  )
}

export function FallingTiles() {
  const cards = createMemo<Card[]>(() => {
    const rng = new Rand()
    return shuffle(getAllTiles(), rng).slice(0, 10)
  })
  return <For each={cards()}>{(card) => <FallingTile cardId={card.id} />}</For>
}

function Title(props: { win: boolean; round?: number }) {
  const t = useTranslation()
  const round = createMemo(() =>
    props.round ? `${t.common.roundN({ round: props.round })}: ` : "",
  )

  return (
    <Show
      when={props.win}
      fallback={
        <h1 class={titleClass}>
          {round()} {t.gameOver.defeat[pick(DEFEAT_TITLES)]()}
        </h1>
      }
    >
      <h1 class={titleClass}>
        {round()}
        {t.gameOver.win[pick(WIN_TITLES)]()}
      </h1>
    </Show>
  )
}

function List(props: { hue: AccentHue } & ParentProps) {
  return <dl class={detailListClass({ hue: props.hue })}>{props.children}</dl>
}

function Item(props: { label: string } & ParentProps) {
  return (
    <>
      <dt class={detailTermClass}>{props.label}</dt>
      <dd class={detailDescriptionClass}>{props.children}</dd>
    </>
  )
}

function Score(props: ParentProps) {
  return <div class={scoreClass}>{props.children}</div>
}

function Buttons(props: ParentProps) {
  return <div class={buttonsClass}>{props.children}</div>
}
