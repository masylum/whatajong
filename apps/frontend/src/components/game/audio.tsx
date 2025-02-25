import { createStore } from "solid-js/store"
import { For } from "solid-js"
import { muted } from "@/state/db"

export const SOUNDS = {
  CLICK: "click",
  CLACK: "clack",
  RATTLE: "rattle",
  DING: "ding",
  DRAGON: "dragon",
  GONG: "gong",
  DENG: "deng",
  WIND: "wind",
  SHAKE: "shake",
  BAMBOO: "bamboo",
} as const

type Track = (typeof SOUNDS)[keyof typeof SOUNDS]

type AudioStore = Record<Track, HTMLAudioElement | undefined>

const [audioStore, setAudioStore] = createStore<AudioStore>({
  [SOUNDS.CLICK]: undefined,
  [SOUNDS.CLACK]: undefined,
  [SOUNDS.RATTLE]: undefined,
  [SOUNDS.DING]: undefined,
  [SOUNDS.DRAGON]: undefined,
  [SOUNDS.GONG]: undefined,
  [SOUNDS.DENG]: undefined,
  [SOUNDS.WIND]: undefined,
  [SOUNDS.SHAKE]: undefined,
  [SOUNDS.BAMBOO]: undefined,
})

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
