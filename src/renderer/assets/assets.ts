const tiles = import.meta.glob("/assets/tiles/*.webp", {
  eager: true,
  import: "default",
})

export function getTileSrc(image: string) {
  return tiles[`/assets/tiles/${image}.webp`] as string
}

const textures = import.meta.glob("/assets/textures/*.webp", {
  eager: true,
  import: "default",
})

export function getTextureSrc(image: string) {
  return textures[`/assets/textures/${image}.webp`] as string
}

const backgrounds = import.meta.glob("/assets/backgrounds/*.webp", {
  eager: true,
  import: "default",
})

export function getBackgroundSrc(image: string) {
  return backgrounds[`/assets/backgrounds/${image}.webp`] as string
}

const sounds = import.meta.glob("/assets/sounds/*.mp3", {
  eager: true,
  import: "default",
})

export function getSoundSrc(sound: string) {
  return sounds[`/assets/sounds/${sound}.mp3`] as string
}
