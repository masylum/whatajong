import { Howl } from "howler"
import { fromEntries } from "remeda"

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
music.volume(0, musicIds.game)
music.volume(0, musicIds.shop)
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

export function toggleMusic(track: keyof typeof musicIds) {
  const id = musicIds[track]
  if (id === currentId) return

  music.fade(1, 0, 1000, currentId)
  currentId = id
  music.fade(0, 1, 1000, id)
}

export function musicVolume(volume: number) {
  music.volume(volume)
}

export { play }
