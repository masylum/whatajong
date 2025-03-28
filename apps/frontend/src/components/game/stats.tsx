import { createEffect, createMemo, createSignal } from "solid-js"
import { useGameState } from "@/state/gameState"
import { makeTimer } from "@solid-primitives/timer"
import {
  statLabel,
  movesClass,
  pointsClass,
  pointsContainerClass,
  pillClass,
  penaltyClass,
} from "./stats.css"
import { getAvailablePairs } from "@/lib/game"
import { useTileState } from "@/state/tileState"
import { play, SOUNDS } from "../audio"
import { useGlobalState } from "@/state/globalState"

export function Points(props: { timerPoints: number }) {
  const game = useGameState()

  return (
    <div class={pointsContainerClass}>
      <div data-tour="points" class={pointsClass}>
        <span class={statLabel}>Points</span>
        <div class={pillClass({ hue: "bam" })}>{game.points}</div>
      </div>
      <Timer timerPoints={props.timerPoints} />
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
    <div data-tour="penalty" class={penaltyClass}>
      <span class={statLabel}>Penalty</span>
      <div class={pillClass({ hue: "crack" })}>
        {Math.floor(time() * props.timerPoints)}
      </div>
    </div>
  )
}

export function Moves() {
  const tiles = useTileState()
  const globalState = useGlobalState()
  const pairs = createMemo(() => getAvailablePairs(tiles).length)

  const urgencyLevel = createMemo(() => {
    const pairsCount = pairs()
    const tilesAlive = tiles.filterBy({ deleted: false })

    if (tilesAlive.length <= 6) {
      return "normal"
    }

    if (pairsCount <= 1) {
      return "urgent"
    }

    if (pairsCount <= 2) {
      return "moderate"
    }

    if (pairsCount <= 3) {
      return "mild"
    }

    return "normal"
  })

  const hueForUrgency = createMemo(() => {
    switch (urgencyLevel()) {
      case "mild":
        return "gold"
      case "moderate":
        return "bone"
      case "urgent":
        return "crack"
      default:
        return "dot"
    }
  })

  createEffect((prevPairs: number) => {
    const newPairs = pairs()
    const tilesAlive = tiles.filterBy({ deleted: false })

    // do not alarm for the last few moves
    if (tilesAlive.length <= 6) {
      return newPairs
    }

    if (prevPairs > 1 && newPairs === 1) {
      play(SOUNDS.ALARM3, globalState.muted)
    } else if (prevPairs > 2 && newPairs === 2) {
      play(SOUNDS.ALARM2, globalState.muted)
    } else if (prevPairs > 3 && newPairs === 3) {
      play(SOUNDS.ALARM1, globalState.muted)
    }

    return newPairs
  }, pairs())

  return (
    <div data-tour="moves" class={movesClass({ urgency: urgencyLevel() })}>
      <span class={statLabel}>Moves</span>
      <div class={pillClass({ hue: hueForUrgency() })}>{pairs()}</div>
    </div>
  )
}
