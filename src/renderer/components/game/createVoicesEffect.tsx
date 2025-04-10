import type { Tile } from "@/lib/game"
import { useTileState } from "@/state/tileState"
import { createEffect, createMemo, createSignal } from "solid-js"
import { play } from "../audio"

const EXPRESSIONS = [
  "great",
  "nice",
  "super",
  "awesome",
  "amazing",
  "unreal",
  "fantastic",
  "legendary",
] as const

const FAST_SELECTION_THRESHOLD = 3000

export function createVoicesEffect() {
  const tiles = useTileState()

  const [lastTileTime, setLastTileTime] = createSignal<number>(0)
  const [speedStreak, setSpeedStreak] = createSignal<number>(0)
  const userDeletions = createMemo(() => tiles.filterBy({ deleted: true }))

  createEffect((prevDeletions: Tile[]) => {
    const deletions = userDeletions()
    if (deletions.length === prevDeletions.length) return deletions

    // Only process if selection count has increased (a new selection was made)
    // We use the length as a proxy for a new selection being added
    const now = Date.now()
    const lastTime = lastTileTime()
    const timeDiff = now - lastTime

    if (lastTime === 0 || timeDiff > FAST_SELECTION_THRESHOLD) {
      setSpeedStreak(0)
    } else {
      const newStreak = speedStreak() + 1
      setSpeedStreak(newStreak)

      if (newStreak >= 3) {
        const expressionIndex = newStreak - 3
        const expressionSound = EXPRESSIONS[expressionIndex]
        if (expressionSound) {
          play(expressionSound)
        }
      }
    }

    setLastTileTime(now)
    return deletions
  }, userDeletions())
}
