import { createSignal } from "solid-js"
import { db, timer } from "../state"
import { makeTimer } from "@solid-primitives/timer"
import NumberFlow from "solid-number-flow"
import { statsContainer, statItem, statLabel, statValue } from "./stats.css"
import { getAvailablePairs } from "@repo/game/tile"

export function Stats() {
  const [time, setTimer] = createSignal(0)
  makeTimer(
    () => {
      const now = new Date()
      const diff = Math.floor((now.getTime() - timer()) / 1000)

      setTimer(diff)
    },
    1000,
    setInterval,
  )

  return (
    <div class={statsContainer}>
      <div class={statItem}>
        <span class={statLabel}>Timer</span>
        <div class={statValue}>
          <span>{time()}</span>
        </div>
      </div>
      <div class={statItem}>
        <span class={statLabel}>moves</span>
        <div class={statValue}>
          <NumberFlow value={getAvailablePairs(db.tiles).length} />
        </div>
      </div>
    </div>
  )
}
