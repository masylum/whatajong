import { getStandardPairs, type Card } from "@/lib/game"
import {
  bouncingCardClass,
  titleClass,
  startX,
  endX,
  rotation,
  duration,
  gameOverClass,
  screenClass,
  detailListClass,
  detailTermClass,
  detailDescriptionClass,
  scoreClass,
  buttonsClass,
} from "./gameOver.css"
import { shuffle } from "@/lib/rand"
import { For, Show, createMemo, type ParentProps } from "solid-js"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import { BasicTile } from "./basicTile"
import Rand from "rand-seed"
import type { AccentHue } from "@/styles/colors"
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

function FallingTile(props: { card: Card }) {
  const cardStartX = createMemo(() => Math.random() * window.innerWidth)
  const cardEndX = createMemo(() => cardStartX() + (Math.random() - 0.5) * 400)
  const cardRotation = createMemo(() => (Math.random() - 0.5) * 720)
  const cardDuration = createMemo(() => 2 + Math.random() * 15)
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

export function FallingTiles() {
  const cards = createMemo<Card[]>(() => {
    const rng = new Rand()
    return shuffle(getStandardPairs(), rng)
      .slice(0, 10)
      .flatMap(([p, _]) => p)
  })
  return <For each={cards()}>{(card) => <FallingTile card={card} />}</For>
}

function Title(props: { win: boolean; round?: number }) {
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

GameOver.BouncingCards = FallingTiles
GameOver.List = List
GameOver.Item = Item
GameOver.Score = Score
GameOver.Buttons = Buttons

export { GameOver }
