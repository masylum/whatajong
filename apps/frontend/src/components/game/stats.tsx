import { createSignal, Show } from "solid-js"
import { useGameState } from "@/state/gameState"
import { makeTimer } from "@solid-primitives/timer"
import {
  statLabel,
  movesClass,
  pointsClass,
  pointsContainerClass,
} from "./stats.css"
import { getAvailablePairs } from "@/lib/game"
import { useRound } from "@/state/runState"
import { useTileState } from "@/state/tileState"

export function Points() {
  const game = useGameState()
  const round = useRound()

  return (
    <div class={pointsContainerClass}>
      <div class={pointsClass}>
        <span class={statLabel}>Points</span>
        <div>{game.points}</div>
      </div>
      <Show when={round().timerPoints}>
        {(timerPoints) => <Timer timerPoints={timerPoints()} />}
      </Show>
    </div>
  )
}

function Timer(props: { timerPoints: number }) {
  const game = useGameState()
  const [time, setTimer] = createSignal(0)

  makeTimer(
    () => {
      const now = new Date()
      const startedAt = game.startedAt
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
  const tiles = useTileState()

  return (
    <div class={movesClass}>
      <span class={statLabel}>Moves</span>
      <div>{getAvailablePairs(tiles).length}</div>
    </div>
  )
}
