import { getSoundSrc } from "@/assets/assets"
import musicSprite from "@/assets/music/sprite.mp3"
import { useGlobalState } from "@/state/globalState"
import { Howl } from "howler"
import { fromEntries } from "remeda"
import { onMount } from "solid-js"

// biome-ignore format:
const SoundFiles = [
  "click", "click2", "clack", "ding", "coin", "coin2", "dragon", "gong", "wind", "shake", "earthquake", "great", "grunt", "screech", "nice",
  "super", "awesome", "amazing", "unreal", "fantastic", "legendary", "alarm1", "alarm2", "alarm3", "phoenix", "mutation", 'thunder',
  "freeze", "joker", "dice", "gemstone", "end_phoenix", "end_dragon", "tiles", "reward", "won", "lost", "frog", "lotus", "gong2", "sparrow",
] as const
type Track = (typeof SoundFiles)[number]

const SOUNDS = fromEntries(
  SoundFiles.map((sound) => [
    sound,
    new Howl({ src: [getSoundSrc(sound)], preload: true }),
  ]),
)

const SONGS = { music: "music", game: "game" } as const
const music = new Howl({
  src: [musicSprite],
  preload: true,
  volume: 0,
  sprite: {
    music: [0, 352052.2448979592, true],
    game: [354000, 352052.2448979591, true],
  },
})
let MUSIC_IDS: Record<keyof typeof SONGS, number> | undefined
let currentId: number | undefined

function play(track: Track) {
  if (process.env.NODE_ENV === "test") return
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
      const musicId = music.play(SONGS.music)

      MUSIC_IDS = { game: gameId, music: musicId }

      currentId = MUSIC_IDS[track]
      music.on("load", () => {
        music.volume(globalState.musicVolume)
        music.fade(0, globalState.musicVolume, 5_000, currentId)
      })
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
