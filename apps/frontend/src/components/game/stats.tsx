import { createMemo, createSignal, Show } from "solid-js"
import { db, game, muted, setMuted } from "@/state/db"
import { nanoid } from "nanoid"
import { makeTimer } from "@solid-primitives/timer"
import {
  statsContainer,
  statLabel,
  movesClass,
  timerClass,
  menuContainer,
  menuItem,
} from "./stats.css"
import { getAvailablePairs } from "@repo/game/game"
import { useParams } from "@solidjs/router"

export function Stats() {
  const params = useParams()
  const [time, setTimer] = createSignal(0)

  const random = createMemo(() => {
    params.id // force a random id re-generation
    return nanoid()
  })

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
        <div>{time()}</div>
      </div>
      <nav class={menuContainer}>
        <a class={menuItem({ hue: "bamboo" })} href="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-arrow-left"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          back
        </a>
        <a class={menuItem({ hue: "character" })} href={`/play/${random()}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-rotate-ccw"
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          restart
        </a>
        <button
          type="button"
          class={menuItem({ hue: "circle" })}
          title="silence"
          onClick={() => setMuted(!muted())}
        >
          <Show
            when={muted()}
            fallback={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-bell"
              >
                <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
              </svg>
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-bell-off"
            >
              <path d="M10.268 21a2 2 0 0 0 3.464 0" />
              <path d="M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742" />
              <path d="m2 2 20 20" />
              <path d="M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05" />
            </svg>
          </Show>
        </button>
      </nav>
      <div class={movesClass}>
        <span class={statLabel}>Moves</span>
        <div>{getAvailablePairs(db.tiles).length}</div>
      </div>
    </div>
  )
}
