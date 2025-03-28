import { createStore } from "solid-js/store"
import { For } from "solid-js"

export const SOUNDS = {
  CLICK: "click",
  CLICK2: "click2",
  CLACK: "clack",
  RATTLE: "rattle",
  DING: "ding",
  COIN: "coin",
  COIN2: "coin2",
  DRAGON: "dragon",
  GONG: "gong",
  WIND: "wind",
  SHAKE: "shake",
  EARTHQUAKE: "earthquake",
  GREAT: "great",
  GRUNT: "grunt",
  NICE: "nice",
  SUPER: "super",
  AWESOME: "awesome",
  AMAZING: "amazing",
  UNREAL: "unreal",
  FANTASTIC: "fantastic",
  LEGENDARY: "legendary",
  ALARM1: "alarm1",
  ALARM2: "alarm2",
  ALARM3: "alarm3",
  "321": "321",
  PHOENIX: "phoenix",
  FLOWER: "flower",
  SEASON: "season",
  RABBIT: "rabbit",
  MUTATION: "mutation",
  METAL_DING: "metal_ding",
  GLASS_DING: "glass_ding",
  STONE_DING: "stone_ding",
  FREEZE: "freeze",
  DICE: "dice",
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
  [SOUNDS.CLICK2]: undefined,
  [SOUNDS.CLACK]: undefined,
  [SOUNDS.RATTLE]: undefined,
  [SOUNDS.DING]: undefined,
  [SOUNDS.COIN]: undefined,
  [SOUNDS.DRAGON]: undefined,
  [SOUNDS.GONG]: undefined,
  [SOUNDS.WIND]: undefined,
  [SOUNDS.SHAKE]: undefined,
  [SOUNDS.EARTHQUAKE]: undefined,
  [SOUNDS.GREAT]: undefined,
  [SOUNDS.GRUNT]: undefined,
  [SOUNDS.NICE]: undefined,
  [SOUNDS.SUPER]: undefined,
  [SOUNDS.AWESOME]: undefined,
  [SOUNDS.AMAZING]: undefined,
  [SOUNDS.UNREAL]: undefined,
  [SOUNDS.FANTASTIC]: undefined,
  [SOUNDS.LEGENDARY]: undefined,
  [SOUNDS.ALARM1]: undefined,
  [SOUNDS.ALARM2]: undefined,
  [SOUNDS.ALARM3]: undefined,
  [SOUNDS["321"]]: undefined,
  [SOUNDS.PHOENIX]: undefined,
  [SOUNDS.FLOWER]: undefined,
  [SOUNDS.SEASON]: undefined,
  [SOUNDS.MUTATION]: undefined,
  [SOUNDS.RABBIT]: undefined,
  [SOUNDS.METAL_DING]: undefined,
  [SOUNDS.GLASS_DING]: undefined,
  [SOUNDS.STONE_DING]: undefined,
  [SOUNDS.FREEZE]: undefined,
  [SOUNDS.COIN2]: undefined,
  [SOUNDS.DICE]: undefined,
})

function play(track: Track, muted: boolean, volume = 1) {
  const audio = audioStore[track]
  if (audio) {
    audio.volume = muted ? 0 : volume
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
    <div style={{ display: "none" }}>
      <For each={soundEntries}>
        {(track) => (
          <audio preload="auto" ref={setRef(track)}>
            <source src={`/sounds/${track}.mp3`} />
          </audio>
        )}
      </For>
    </div>
  )
}

export { play }
