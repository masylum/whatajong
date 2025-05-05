import { useGlobalState } from "@/state/globalState"
import { Howl } from "howler"
import { fromEntries } from "remeda"
import { onMount } from "solid-js"

const SoundFiles = [
  "click",
  "click2",
  "clack",
  "ding",
  "coin",
  "coin2",
  "dragon",
  "gong",
  "wind",
  "shake",
  "earthquake",
  "great",
  "grunt",
  "screech",
  "nice",
  "super",
  "awesome",
  "amazing",
  "unreal",
  "fantastic",
  "legendary",
  "alarm1",
  "alarm2",
  "alarm3",
  "phoenix",
  "mutation",
  "freeze",
  "joker",
  "dice",
  "gemstone",
  "end_phoenix",
  "end_dragon",
  "tiles",
  "reward",
  "won",
  "lost",
] as const
export type Track = (typeof SoundFiles)[number]

const SOUNDS = fromEntries(
  SoundFiles.map((sound) => [
    sound,
    new Howl({ src: [`/sounds/${sound}.mp3`], preload: true }),
  ]),
)

const music = new Howl({
  src: ["/sounds/sprite.mp3"],
  preload: true,
  sprite: {
    "music-shop": [100000, 355239.18367346935],
    music: [457000, 353697.95918367343],
  },
})

const musicIds = {
  game: music.play("music"),
  shop: music.play("music-shop"),
} as const

let currentId = musicIds.game
music.loop(true)
music.rate(0.95)
music.fade(0, 1, 1000, currentId)

function play(track: Track) {
  const audio = SOUNDS[track]
  if (audio) {
    audio.seek(0)
    audio.play()
  }
}

export function useMusic(track: keyof typeof musicIds) {
  const globalState = useGlobalState()

  onMount(() => {
    const id = musicIds[track]

    music.fade(globalState.musicVolume, 0, 1000, currentId)
    currentId = id
    music.fade(0, globalState.musicVolume, 1000, id)
  })
}

export function musicVolume(volume: number) {
  music.volume(volume)
}

export { play }
