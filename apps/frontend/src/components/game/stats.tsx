import { createMemo, createSignal, Show } from "solid-js"
import { useGameState, muted, setMuted } from "@/state/gameState"
import { nanoid } from "nanoid"
import { makeTimer } from "@solid-primitives/timer"
import {
  statsContainer,
  statLabel,
  movesClass,
  timerClass,
  menuContainer,
} from "./stats.css"
import { getAvailablePairs } from "@repo/game/game"
import { useParams } from "@solidjs/router"
import { ArrowLeft, Bell, BellOff, Rotate } from "../icon"
import { LinkButton, Button } from "../button"
import type { Player } from "@repo/game/player"

export function Stats() {
  const params = useParams()
  const gameState = useGameState()
  const [time, setTimer] = createSignal(0)
  const players = createMemo(() => gameState.players.all)

  const random = createMemo(() => {
    params.id // force a random id re-generation
    return nanoid()
  })

  makeTimer(
    () => {
      const now = new Date()
      const startedAt = gameState.game.get().startedAt
      if (!startedAt) return

      const diff = Math.floor((now.getTime() - startedAt) / 1000)

      setTimer(diff)
    },
    1000,
    setInterval,
  )

  return (
    <div class={statsContainer}>
      <div class={timerClass}>
        <span class={statLabel}>Timer</span>
        <div>{time()}</div>
      </div>
      <nav class={menuContainer}>
        <LinkButton href="/" hue="bamboo">
          <ArrowLeft />
          back
        </LinkButton>
        <Show when={players().length === 1}>
          <LinkButton href={`/play/${random()}`} hue="character">
            <Rotate />
            restart
          </LinkButton>
        </Show>
        <Button
          type="button"
          hue="circle"
          title="silence"
          onClick={() => setMuted(!muted())}
        >
          <Show when={muted()} fallback={<Bell />}>
            <BellOff />
          </Show>
        </Button>
      </nav>
      <div class={movesClass}>
        <span class={statLabel}>Moves</span>
        <div>{getAvailablePairs(gameState.tiles).length}</div>
      </div>
    </div>
  )
}

export function Points(props: { player: Player }) {
  const gameState = useGameState()
  const [time, setTimer] = createSignal(0)
  const points = createMemo(() => props.player.points - time())

  makeTimer(
    () => {
      const now = new Date()
      const startedAt = gameState.game.get().startedAt
      if (!startedAt) return

      const diff = Math.floor((now.getTime() - startedAt) / 1000)

      setTimer(diff)
    },
    1000,
    setInterval,
  )

  return (
    <div class={timerClass}>
      <span class={statLabel}>Points</span>
      <div>{points()}</div>
    </div>
  )
}

export function Moves() {
  const gameState = useGameState()

  return (
    <div class={movesClass}>
      <span class={statLabel}>Moves</span>
      <div>{getAvailablePairs(gameState.tiles).length}</div>
    </div>
  )
}
