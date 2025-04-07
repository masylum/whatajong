import { createEffect, createMemo, createSignal } from "solid-js"
import { useGameState } from "@/state/gameState"
import { makeTimer } from "@solid-primitives/timer"
import { movesClass, pointsClass, pillClass, penaltyClass } from "./stats.css"
import { getAvailablePairs } from "@/lib/game"
import { useTileState } from "@/state/tileState"
import { play } from "../audio"

export function PointsAndPenalty(props: { timerPoints: number }) {
  const game = useGameState()

  return (
    <>
      <Points points={game.points} />
      <Timer timerPoints={props.timerPoints} />
    </>
  )
}

export function Points(props: { points: number }) {
  return (
    <div data-tour="points" class={pointsClass}>
      <span>Points</span>
      <div class={pillClass({ hue: "bam" })}>{props.points}</div>
    </div>
  )
}

export function Penalty(props: { points: number }) {
  return (
    <div data-tour="penalty" class={penaltyClass}>
      <span>Penalty</span>
      <div class={pillClass({ hue: "crack" })}>{props.points}</div>
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

  return <Penalty points={Math.floor(time() * props.timerPoints)} />
}

type Urgency = "normal" | "mild" | "moderate" | "urgent"

export function Moves() {
  const tiles = useTileState()
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

  createEffect((prevPairs: number) => {
    const newPairs = pairs()
    const tilesAlive = tiles.filterBy({ deleted: false })

    // do not alarm for the last few moves
    if (tilesAlive.length <= 6) {
      return newPairs
    }

    if (prevPairs > 1 && newPairs === 1) {
      play("alarm3")
    } else if (prevPairs > 2 && newPairs === 2) {
      play("alarm2")
    } else if (prevPairs > 3 && newPairs === 3) {
      play("alarm1")
    }

    return newPairs
  }, pairs())

  return <MovesIndicator urgency={urgencyLevel()} pairs={pairs()} />
}

export function MovesIndicator(props: {
  urgency: Urgency
  pairs: number
}) {
  const hueForUrgency = createMemo(() => {
    switch (props.urgency) {
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

  return (
    <div data-tour="moves" class={movesClass({ urgency: props.urgency })}>
      <span>Moves</span>
      <div class={pillClass({ hue: hueForUrgency() })}>{props.pairs}</div>
    </div>
  )
}
