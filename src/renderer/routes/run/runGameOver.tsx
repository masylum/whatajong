import { Button } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import { ArrowRight, Rotate, Shop } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { type Card, type CardId, getAllTiles } from "@/lib/game"
import { captureEvent } from "@/lib/observability"
import { pick, shuffle } from "@/lib/rand"
import { useSmallerTileSize } from "@/state/constants"
import { useDeckState } from "@/state/deckState"
import {
  GAME_STATE_NAMESPACE,
  initialGameState,
  useGameState,
} from "@/state/gameState"
import { cleanMutable, setMutable } from "@/state/persistantMutable"
import { cleanPersistentDatabase } from "@/state/persistentDatabase"
import {
  REWARDS,
  calculateIncome,
  roundPersistentKey,
  useRound,
  useRunState,
} from "@/state/runState"
import {
  TILE_STATE_NAMESPACE,
  initializeTileState,
  useTileState,
} from "@/state/tileState"
import type { AccentHue } from "@/styles/colors"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import Rand from "rand-seed"
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
  detailListClass,
  duration,
  endX,
  gameOverClass,
  itemKeyClass,
  itemValueClass,
  rotation,
  scoreClass,
  screenClass,
  startX,
  subtitleClass,
  titleClass,
} from "./runGameOver.css"

// biome-ignore format:
const WIN_TITLES = [ "victory", "success", "champion", "awesome", "winner", "glorious", "wellPlayed" ] as const
// biome-ignore format:
const DEFEAT_TITLES = [ "defeat", "gameOver", "oops", "failed", "crushed", "wasted" ] as const

export default function RunGameOver() {
  const run = useRunState()
  const round = useRound()
  const game = useGameState()
  const deck = useDeckState()
  const tiles = useTileState()

  const time = createMemo(() => game.time)
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
  const t = useTranslation()

  const tileCoins = createMemo(() => game.coins)
  const overAchievementCoins = createMemo(() => {
    const overAchievement = achievement() - 1
    if (overAchievement <= 0) return 0

    return Math.min(Math.floor(overAchievement * 2), 12)
  })
  const income = createMemo(() => calculateIncome(run))
  const isRewardRound = createMemo(() => run.round in REWARDS)

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

  function goToNextRound() {
    batch(() => {
      run.money += income() + tileCoins() + overAchievementCoins()
      run.round += 1
      run.stage = isRewardRound() ? "reward" : "shop"
      run.totalPoints += totalPoints()

      const key = roundPersistentKey(run)
      cleanMutable(GAME_STATE_NAMESPACE, key)
      cleanPersistentDatabase(TILE_STATE_NAMESPACE, key)
    })
  }

  function retrySameRound() {
    batch(() => {
      run.retries += 1
      const key = roundPersistentKey(run)
      setMutable(game, initialGameState())
      initializeTileState(key, deck.all, tiles)
    })
  }

  return (
    <div class={gameOverClass}>
      <div class={screenClass({ win: win() })}>
        <div>
          <Title win={win()} round={run.round} />
          <Show when={!win()}>
            <div class={subtitleClass}>
              <Show
                when={game.endCondition === "no-pairs"}
                fallback={t.gameOver.notEnoughPoints()}
              >
                {t.gameOver.noPairs()}
              </Show>
            </div>
          </Show>
        </div>
        <div class={scoreClass}>
          <Show when={win()}>
            <List hue="crack">
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
            <List hue="black">
              <Item label={t.gameOver.timePenalty({ time: time() })}>
                {penalty()}
              </Item>
            </List>
          </Show>

          <List hue="dot">
            <Item label={t.gameOver.totalPoints()}>{totalPoints()}</Item>
            <Item label={t.common.objective()}>{round().pointObjective}</Item>
          </List>
        </div>
        <div class={buttonsClass}>
          <Show
            when={win()}
            fallback={
              <Button hue="crack" onClick={retrySameRound}>
                {t.gameOver.trySameRun()}
                <Rotate />
              </Button>
            }
          >
            <Button hue="bam" onClick={() => goToNextRound()}>
              <Show
                when={isRewardRound()}
                fallback={
                  <>
                    <Shop />
                    {t.common.goToShop()}
                  </>
                }
              >
                <>
                  {t.common.next()}
                  <ArrowRight />
                </>
              </Show>
            </Button>
          </Show>
        </div>
      </div>
      <FallingTiles />
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

function FallingTiles() {
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
      <dt class={itemKeyClass}>{props.label}</dt>
      <dd class={itemValueClass}>{props.children}</dd>
    </>
  )
}
