import { useGlobalState } from "@/state/globalState"
import { Howl } from "howler"
import { fromEntries } from "remeda"
import { onMount } from "solid-js"

// biome-ignore format:
const SoundFiles = [
  "click", "click2", "clack", "ding", "coin", "coin2", "dragon", "gong", "wind", "shake", "earthquake", "great", "grunt", "screech", "nice",
  "super", "awesome", "amazing", "unreal", "fantastic", "legendary", "alarm1", "alarm2", "alarm3", "phoenix", "mutation",
  "freeze", "joker", "dice", "gemstone", "end_phoenix", "end_dragon", "tiles", "reward", "won", "lost", "frog", "lotus", "gong2", "sparrow",
] as const
export type Track = (typeof SoundFiles)[number]

const SOUNDS = fromEntries(
  SoundFiles.map((sound) => [
    sound,
    new Howl({ src: [`/sounds/${sound}.mp3`], preload: true }),
  ]),
)

const SONGS = { game: "music", shop: "music-shop" } as const
const music = new Howl({
  src: ["/sounds/sprite.mp3"],
  preload: true,
  volume: 0,
  loop: true,
  sprite: {
    "music-shop": [100000, 355239.18367346935],
    music: [457000, 353697.95918367343],
  },
})
let MUSIC_IDS: Record<keyof typeof SONGS, number> | undefined
let currentId: number | undefined

function play(track: Track) {
  const audio = SOUNDS[track]
  if (audio) {
    audio.seek(0)
    audio.play()
  }
}

export function useMusic(track: keyof typeof SONGS) {
  const globalState = useGlobalState()

  onMount(() => {
    if (!MUSIC_IDS) {
      const gameId = music.play(SONGS.game)
      const shopId = music.play(SONGS.shop)

      MUSIC_IDS = { game: gameId, shop: shopId }

      currentId = MUSIC_IDS[track]
      music.on(
        "play",
        () => {
          music.fade(0, globalState.musicVolume, 4000, currentId)
        },
        currentId,
      )
    } else {
      const newId = MUSIC_IDS[track]

      if (currentId !== newId) {
        music.fade(globalState.musicVolume, 0, 1000, currentId)
        music.fade(0, globalState.musicVolume, 1000, newId)
        currentId = newId
      }
    }
  })
}

export function musicVolume(volume: number) {
  music.volume(volume)
}

export { play }
