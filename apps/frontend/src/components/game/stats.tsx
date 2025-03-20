import { createEffect, createMemo, createSignal, Show } from "solid-js"
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

export function Points(props: { timerPoints: number }) {
  const game = useGameState()

  return (
    <div class={pointsContainerClass}>
      <div class={pointsClass}>
        <span class={statLabel}>Points</span>
        <div class={pillClass({ hue: "bamboo" })}>{game.points}</div>
      </div>
      <Show when={props.timerPoints}>
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
    <div class={penaltyClass}>
      <span class={statLabel}>Penalty</span>
      <div class={pillClass({ hue: "character" })}>
        {Math.floor(time() * props.timerPoints)}
      </div>
    </div>
  )
}

export function Moves() {
  const tiles = useTileState()
  const pairs = createMemo(() => getAvailablePairs(tiles).length)

  createEffect((prevPairs: number) => {
    const newPairs = pairs()
    const tilesAlive = tiles.filterBy({ deleted: false })

    // do not alarm for the last few moves
    if (tilesAlive.length <= 6) {
      return newPairs
    }

    if (prevPairs > 1 && newPairs === 1) {
      play(SOUNDS.ALARM3)
    } else if (prevPairs > 2 && newPairs === 2) {
      play(SOUNDS.ALARM2)
    } else if (prevPairs > 3 && newPairs === 3) {
      play(SOUNDS.ALARM1)
    }

    return newPairs
  }, pairs())

  return (
    <div class={movesClass}>
      <span class={statLabel}>Moves</span>
      <div class={pillClass({ hue: "circle" })}>{pairs()}</div>
    </div>
  )
}
