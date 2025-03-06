import { getStandardPairs, type Card } from "@repo/game/deck"
import {
  bouncingCardClass,
  pointsClass,
  pointsContainerClass,
  timeClass,
  titleClass,
  startX,
  endX,
  rotation,
  duration,
  playerTitleClass,
  playerNameClass,
  wreathClass,
  gameOverClass,
  screenClass,
} from "./gameOver.css"
import { shuffle } from "@repo/game/lib/rand"
import { For, Show, createMemo, type ParentProps } from "solid-js"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import { calculateSeconds, useGameState, userId } from "@/state/gameState"
import { Avatar } from "@/components/avatar"
import type { Player } from "@repo/game/player"
import { BasicTile } from "./basicTile"
import { huesAndShades } from "@/styles/colors"
import Rand from "rand-seed"
import { formatDuration, intervalToDuration } from "date-fns"

// biome-ignore format:
const WIN_TITLES = [ "Victory!", "Success!", "Champion!", "You Did It!", "Mission Accomplished!", "Winner!", "Glorious!", "Well Played!" ]
// biome-ignore format:
const DEFEAT_TITLES = [ "Defeat!", "Game Over", "Oooops...", "You Failed", "You Fell Short", "Crushed!", "Wasted!" ]

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function GameOver(props: { win: boolean } & ParentProps) {
  return (
    <div class={gameOverClass}>
      <div class={screenClass({ win: props.win })}>
        <Title win={props.win} />
        {props.children}
      </div>
    </div>
  )
}

function PlayerPoints(props: {
  player: Player
  winningPlayer: Player
}) {
  const win = createMemo(() => props.winningPlayer === props.player)

  return (
    <div
      class={pointsContainerClass({
        multiplayer: true,
        win: win(),
      })}
    >
      <Show when={win()}>
        <img
          class={wreathClass}
          src="/wreath.svg"
          alt="winner"
          width="80"
          height="80"
        />
      </Show>
      <PlayerTitle
        player={props.player}
        win={props.winningPlayer.id === userId()}
      />
      <div>
        <Points points={props.player.points} />
        <Time />
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

export function Title(props: { win: boolean }) {
  return (
    <Show
      when={props.win}
      fallback={<h1 class={titleClass}>{pick(DEFEAT_TITLES)}</h1>}
    >
      <h1 class={titleClass}>{pick(WIN_TITLES)}</h1>
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

function PlayerTitle(props: { player: Player; win: boolean }) {
  const colors = createMemo(() =>
    Object.values(props.win ? huesAndShades.bamboo : huesAndShades.character),
  )
  return (
    <div class={playerTitleClass}>
      <Avatar name={props.player.id} colors={colors()} />
      <h2 class={playerNameClass}>{props.player.id}</h2>
    </div>
  )
}

GameOver.Time = Time
GameOver.Points = Points
GameOver.PlayerPoints = PlayerPoints
GameOver.BouncingCards = BouncingCards

export { GameOver }
