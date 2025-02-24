import { createSignal } from "solid-js"
import { db, game } from "../../routes/state"
import { makeTimer } from "@solid-primitives/timer"
import {
  statsContainer,
  statLabel,
  statValue,
  movesClass,
  timerClass,
} from "./stats.css"
import { getAvailablePairs } from "@repo/game/game"

export function Stats() {
  const [time, setTimer] = createSignal(0)

  makeTimer(
    () => {
      const now = new Date()
      const startedAt = game()?.started_at
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
        <div class={statValue}>
          <span>{time()}</span>
        </div>
      </div>
      <div class={movesClass}>
        <span class={statLabel}>Moves</span>
        <div class={statValue}>{getAvailablePairs(db.tiles).length}</div>
      </div>
    </div>
  )
}
