import { createSignal, createEffect, createMemo } from "solid-js"
import type { Tile } from "@/lib/game"
import { play, SOUNDS } from "../audio"
import { useTileState } from "@/state/tileState"

export const EXPRESSIONS = [
  SOUNDS.GREAT,
  SOUNDS.NICE,
  SOUNDS.SUPER,
  SOUNDS.AWESOME,
  SOUNDS.AMAZING,
  SOUNDS.UNREAL,
  SOUNDS.FANTASTIC,
  SOUNDS.LEGENDARY,
]

export const FAST_SELECTION_THRESHOLD = 3000

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
        const expressionIndex = Math.min(newStreak - 3, EXPRESSIONS.length - 1)
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
