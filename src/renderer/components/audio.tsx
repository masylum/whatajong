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
  "flower",
  "season",
  "rabbit",
  "mutation",
  "metal_ding",
  "glass_ding",
  "stone_ding",
  "freeze",
  "discard",
  "joker",
  "dice",
] as const
export type Track = (typeof SoundFiles)[number]

const SOUNDS = fromEntries(
  SoundFiles.map((sound) => [
    sound,
    new Howl({ src: [`/sounds/${sound}.mp3`], preload: true }),
  ]),
)

function play(track: Track) {
  const audio = SOUNDS[track]
  if (audio) {
    audio.seek(0)
    audio.play()
  }
}

export { play }
