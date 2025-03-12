import { createStore } from "solid-js/store"
import { For } from "solid-js"
import { muted } from "@/state/gameState"

export const SOUNDS = {
  CLICK: "click",
  CLACK: "clack",
  RATTLE: "rattle",
  DING: "ding",
  COIN: "coin",
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
  [SOUNDS.COIN]: undefined,
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

function play(track: Track, volume = 1) {
  const audio = audioStore[track]
  if (audio) {
    audio.volume = muted() ? 0 : volume
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
