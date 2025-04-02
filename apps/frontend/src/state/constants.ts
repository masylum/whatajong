import { mapGetWidth, type Card } from "@/lib/game"
import { breakpoints } from "@/styles/breakpoints"
import { createBreakpoints } from "@solid-primitives/media"
import { createMemo, type Accessor } from "solid-js"
import { useWindowSize } from "@solid-primitives/resize-observer"

const BOARD_RATIO = (45 * 15) / (65 * 8)

export const TILE_RATIO = 13 / 9

export function getSideSize(height: number) {
  return Math.floor(height / 10)
}

export function useBreakpoint() {
  return createBreakpoints(breakpoints)
}

type Layout = {
  width: number
  height: number
  orientation: "portrait" | "landscape"
}

export function useLayoutSize(): Accessor<Layout> {
  const size = useWindowSize()

  return createMemo(() => {
    const uiPadding = 0.7
    const normalPadding = 0.9
    const maxWidth = 900
    const screenRatio = size.width / size.height

    if (screenRatio > BOARD_RATIO) {
      const desiredWidth = Math.min(size.width * uiPadding, maxWidth)
      const height = Math.min(
        desiredWidth / BOARD_RATIO,
        size.height * normalPadding,
      )

      return {
        width: height * BOARD_RATIO,
        height,
        orientation: "portrait" as const,
      }
    }

    const desiredHeight = size.height * uiPadding
    const width = Math.min(
      desiredHeight * BOARD_RATIO,
      size.width * normalPadding,
      maxWidth,
    )
    return {
      width,
      height: width / BOARD_RATIO,
      orientation: "landscape" as const,
    }
  })
}

export function useTileSize(ratio = 1) {
  return createMemo(() => {
    const layout = useLayoutSize()
    const width = (layout().width / (mapGetWidth() / 2)) * ratio
    const height = width * TILE_RATIO
    const corner = Math.floor(width / 10)
    const sideSize = getSideSize(height)

    return { width, height, corner, sideSize }
  })
}

export function useImageSrc(card: Card) {
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
