import { getStandardPairs, type Card } from "@/lib/game"
import {
  bouncingCardClass,
  pointsClass,
  timeClass,
  titleClass,
  startX,
  endX,
  rotation,
  duration,
  gameOverClass,
  screenClass,
} from "./gameOver.css"
import { shuffle } from "@/lib/rand"
import { For, Show, createMemo, type ParentProps } from "solid-js"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import { calculateSeconds, useGameState } from "@/state/gameState"
import { BasicTile } from "./basicTile"
import Rand from "rand-seed"
import { formatDuration, intervalToDuration } from "date-fns"

// biome-ignore format:
const WIN_TITLES = [ "Victory!", "Success!", "Champion!", "Awesome!", "Winner!", "Glorious!", "Well Played!" ]
// biome-ignore format:
const DEFEAT_TITLES = [ "Defeat!", "Game Over", "Oooops...", "You Failed", "Crushed!", "Wasted!" ]

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

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

function BouncingCard(props: { card: Card }) {
  const cardStartX = createMemo(() => Math.random() * window.innerWidth)
  const cardEndX = createMemo(() => cardStartX() + (Math.random() - 0.5) * 400)
  const cardRotation = createMemo(() => (Math.random() - 0.5) * 720)
  const cardDuration = createMemo(() => 2 + Math.random() * 10)
  const delay = createMemo(() => Math.random() * 10)

  return (
    <BasicTile
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
      card={props.card}
    />
  )
}

export function BouncingCards() {
  const cards = createMemo<Card[]>(() => {
    const rng = new Rand()
    return shuffle(getStandardPairs(), rng)
      .slice(0, 10)
      .flatMap(([p, _]) => p)
  })
  return <For each={cards()}>{(card) => <BouncingCard card={card} />}</For>
}

export function Title(props: { win: boolean; round?: number }) {
  const round = createMemo(() => (props.round ? `Round ${props.round}: ` : ""))
  return (
    <Show
      when={props.win}
      fallback={
        <h1 class={titleClass}>
          {round()}
          {pick(DEFEAT_TITLES)}
        </h1>
      }
    >
      <h1 class={titleClass}>
        {round()}
        {pick(WIN_TITLES)}
      </h1>
    </Show>
  )
}

function Time() {
  const gameState = useGameState()
  const duration = createMemo(() => {
    const seconds = calculateSeconds(gameState) * 1000
    const duration = intervalToDuration({ start: 0, end: seconds })
    return formatDuration(duration, {
      format: ["hours", "minutes", "seconds"],
      zero: true,
      delimiter: ":",
      locale: {
        formatDistance: (_token, count) => String(count).padStart(2, "0"),
      },
    })
  })

  return <h3 class={timeClass}>time: {duration()}</h3>
}

function Points(props: { points: number }) {
  return <h3 class={pointsClass}>points: {props.points}</h3>
}

GameOver.Time = Time
GameOver.Points = Points
GameOver.BouncingCards = BouncingCards

export { GameOver }
