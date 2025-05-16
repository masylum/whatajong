import { play, useMusic } from "@/components/audio"
import { Button } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import { Reward, Rotate, Shop, Star } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import type { CardId } from "@/lib/game"
import { getPenalty } from "@/lib/game"
import { captureEvent } from "@/lib/observability"
import { pick, shuffle } from "@/lib/rand"
import { useSmallerTileSize } from "@/state/constants"
import { useDeckState } from "@/state/deckState"
import { initialGameState, useGameState } from "@/state/gameState"
import { setMutable } from "@/state/persistantMutable"
import {
  type RoundStage,
  calculateIncome,
  roundPersistentKey,
  useLevels,
  useRound,
  useRunState,
} from "@/state/runState"
import { initializeTileState, useTileState } from "@/state/tileState"
import type { AccentHue } from "@/styles/colors"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import Rand from "rand-seed"
import {
  For,
  Match,
  type ParentProps,
  Show,
  Switch,
  batch,
  createMemo,
  onMount,
} from "solid-js"
import {
  buttonsClass,
  detailListClass,
  duration,
  endX,
  fallingTileClass,
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
  const penalty = createMemo(() => getPenalty(time(), round()))
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
  const levels = useLevels()
  const level = createMemo(() =>
    levels().find((level) => level.level === run.round),
  )
  const nextRoundStage = createMemo<RoundStage>(() => {
    const l = level()
    if (!l) return "end"

    return l.rewards > 0 ? "reward" : "shop"
  })

  onMount(() => {
    play(win() ? "won" : "lost")
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

  useMusic("music")

  function goToNextRound() {
    batch(() => {
      run.money += income() + tileCoins() + overAchievementCoins()
      run.stage = nextRoundStage()
      run.totalPoints += totalPoints()
      captureEvent("next_round", { round: round().id, runId: run.runId })
    })
  }

  function retrySameRound() {
    batch(() => {
      run.retries += 1
      const key = roundPersistentKey(run)
      setMutable(game, initialGameState(run.runId))
      initializeTileState(key, deck.all, tiles)
      captureEvent("retry_run", { runId: run.runId, round: round().id })
    })
  }

  return (
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
          <Item label={t.common.points()}>+{points()}</Item>
        </List>

        <Show when={round().timerPoints}>
          <List hue="black">
            <Item label={t.gameOver.timePenalty({ time: time() })}>
              -{penalty()}
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
            <Button hue="crack" onPointerDown={retrySameRound}>
              {t.gameOver.trySameRun()}
              <Rotate />
            </Button>
          }
        >
          <Button hue="bam" onPointerDown={() => goToNextRound()}>
            <Switch>
              <Match when={nextRoundStage() === "shop"}>
                <Shop />
                {t.common.goToShop()}
              </Match>
              <Match when={nextRoundStage() === "reward"}>
                <Reward />
                {t.common.next()}
              </Match>
              <Match when={nextRoundStage() === "end"}>
                <Star />
                {t.common.celebrate()}
              </Match>
            </Switch>
          </Button>
        </Show>
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
      class={fallingTileClass}
    >
      <BasicTile width={tileSize().width} cardId={props.cardId} />
    </div>
  )
}

function FallingTiles() {
  const run = useRunState()
  const levels = useLevels()
  const cardIds = createMemo<CardId[]>(() => {
    const rng = new Rand()
    const cardIds = levels()
      .filter((l) => l.level <= run.round)
      .flatMap((l) => l.tileItems.map((i) => i.cardId))
    return shuffle(cardIds, rng).slice(0, 10)
  })

  return (
    <For each={cardIds()}>{(cardId) => <FallingTile cardId={cardId} />}</For>
  )
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
