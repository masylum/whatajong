import { mapGetHeight, mapGetWidth, type Card } from "@/lib/game"
import { breakpoints } from "@/styles/breakpoints"
import { createBreakpoints } from "@solid-primitives/media"
import { createMemo } from "solid-js"
import { useWindowSize } from "@solid-primitives/resize-observer"

export function getCanvasWidth() {
  const tileSize = getTileSize()
  return (mapGetWidth() / 2) * tileSize().width
}

export function getCanvasHeight() {
  const tileSize = getTileSize()
  return (mapGetHeight() / 2) * tileSize().height
}

export const TILE_RATIO = 13 / 9

export function getSideSize(height: number) {
  return Math.floor(height / 10)
}

export function useBreakpoint() {
  return createBreakpoints(breakpoints)
}

export function getTileSize() {
  const size = useWindowSize()
  const isLandscape = createMemo(() => size.width > size.height)

  return createMemo(() => {
    const padding = 1
    let width
    let height

    if (isLandscape()) {
      height = size.height / (mapGetHeight() / 2 + padding)
      width = height / TILE_RATIO
    } else {
      width = size.width / (mapGetWidth() / 2 + padding)
      height = width * TILE_RATIO
    }
    const corner = Math.floor(width / 10)

    return { width, height, corner }
  })
}

export function getImageSrc(card: Card) {
  const match = useBreakpoint()

  return createMemo(() => {
    const sizes = {
      xxs: "xs",
      xs: "xs",
      s: "xs",
      m: "m",
      l: "m",
      xl: "l",
      xxl: "l",
    }
    const size = sizes[match.key]
    return `/tiles/${size}/${card}.webp`
  })
}
