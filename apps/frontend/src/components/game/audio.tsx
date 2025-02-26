import { createStore } from "solid-js/store"
import { For, createSignal, createEffect, createMemo } from "solid-js"
import { muted, db, userId } from "@/state/db"
import type { Tile } from "@repo/game/tile"

export const SOUNDS = {
  CLICK: "click",
  CLACK: "clack",
  RATTLE: "rattle",
  DING: "ding",
  DRAGON: "dragon",
  GONG: "gong",
  WIND: "wind",
  SHAKE: "shake",
  COMBO: "combo",
  GREAT: "great",
  NICE: "nice",
  SUPER: "super",
  AWESOME: "awesome",
  AMAZING: "amazing",
  UNREAL: "unreal",
  FANTASTIC: "fantastic",
  LEGENDARY: "legendary",
  "321": "321",
} as const

// sorted by intensity
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

type Track = (typeof SOUNDS)[keyof typeof SOUNDS]

type AudioStore = Record<Track, HTMLAudioElement | undefined>

const [audioStore, setAudioStore] = createStore<AudioStore>({
  [SOUNDS.CLICK]: undefined,
  [SOUNDS.CLACK]: undefined,
  [SOUNDS.RATTLE]: undefined,
  [SOUNDS.DING]: undefined,
  [SOUNDS.DRAGON]: undefined,
  [SOUNDS.GONG]: undefined,
  [SOUNDS.WIND]: undefined,
  [SOUNDS.SHAKE]: undefined,
  [SOUNDS.COMBO]: undefined,
  [SOUNDS.GREAT]: undefined,
  [SOUNDS.NICE]: undefined,
  [SOUNDS.SUPER]: undefined,
  [SOUNDS.AWESOME]: undefined,
  [SOUNDS.AMAZING]: undefined,
  [SOUNDS.UNREAL]: undefined,
  [SOUNDS.FANTASTIC]: undefined,
  [SOUNDS.LEGENDARY]: undefined,
  [SOUNDS["321"]]: undefined,
})

const FAST_SELECTION_THRESHOLD = 3000

function play(track: Track) {
  const audio = audioStore[track]
  if (audio) {
    audio.volume = muted() ? 0 : 1
    audio.currentTime = 0
    audio.play()
  }
}

export function Audio() {
  const setRef = (track: Track) => (el: HTMLAudioElement) => {
    setAudioStore(track, el)
  }

  const soundEntries = Object.entries(SOUNDS).map(
    ([_, value]) => value as Track,
  )

  const [lastTileTime, setLastTileTime] = createSignal<number>(0)
  const [speedStreak, setSpeedStreak] = createSignal<number>(0)
  const userDeletions = createMemo(() =>
    db.tiles.filterBy({ deletedBy: userId() }),
  )

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

  return (
    <>
      <For each={soundEntries}>
        {(track) => (
          <audio preload="auto" ref={setRef(track)}>
            <source src={`/sounds/${track}.mp3`} />
          </audio>
        )}
      </For>
    </>
  )
}

export { play }
