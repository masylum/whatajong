import { createSignal, Show } from "solid-js"
import { useGameState } from "@/state/gameState"
import { makeTimer } from "@solid-primitives/timer"
import {
  statLabel,
  movesClass,
  pointsClass,
  pointsContainerClass,
} from "./stats.css"
import { getAvailablePairs } from "@repo/game/game"
import type { Player } from "@repo/game/player"
import { useRound } from "@/state/runState"

export function Points(props: { player: Player }) {
  const round = useRound()

  return (
    <div class={pointsContainerClass}>
      <div class={pointsClass}>
        <span class={statLabel}>Points</span>
        <div>{props.player.points}</div>
      </div>
      <Show when={round().timerPoints}>
        {(timerPoints) => <Timer timerPoints={timerPoints()} />}
      </Show>
    </div>
  )
}

function Timer(props: { timerPoints: number }) {
  const gameState = useGameState()
  const [time, setTimer] = createSignal(0)

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
    <div class={pointsClass}>
      <span class={statLabel}>Penalty</span>
      <div>{time() * props.timerPoints}</div>
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
