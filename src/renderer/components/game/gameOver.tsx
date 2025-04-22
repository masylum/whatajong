import { useTranslation } from "@/i18n/useTranslation"
import { type Card, type CardId, getAllTiles } from "@/lib/game"
import { shuffle } from "@/lib/rand"
import { useSmallerTileSize } from "@/state/constants"
import type { AccentHue } from "@/styles/colors"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import Rand from "rand-seed"
import { For, type ParentProps, Show, createMemo } from "solid-js"
import { BasicTile } from "./basicTile"
import {
  bouncingCardClass,
  buttonsClass,
  detailDescriptionClass,
  detailListClass,
  detailTermClass,
  duration,
  endX,
  gameOverClass,
  rotation,
  scoreClass,
  screenClass,
  startX,
  titleClass,
} from "./gameOver.css"

// biome-ignore format:
const WIN_TITLES = [ "victory", "success", "champion", "awesome", "winner", "glorious", "wellPlayed" ] as const
// biome-ignore format:
const DEFEAT_TITLES = [ "defeat", "gameOver", "oops", "failed", "crushed", "wasted" ] as const

function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)]!
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

function FallingTile(props: { cardId: CardId }) {
  const cardStartX = createMemo(() => Math.random() * window.innerWidth)
  const cardEndX = createMemo(() => cardStartX() + (Math.random() - 0.5) * 400)
  const cardRotation = createMemo(() => (Math.random() - 0.5) * 720)
  const cardDuration = createMemo(() => 2 + Math.random() * 15)
  const delay = createMemo(() => Math.random() * 10)
  const tileSize = useSmallerTileSize(0.8)

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
      width={tileSize().width}
      class={bouncingCardClass}
      cardId={props.cardId}
    />
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

GameOver.BouncingCards = FallingTiles
GameOver.List = List
GameOver.Item = Item
GameOver.Score = Score
GameOver.Buttons = Buttons

export { GameOver }
