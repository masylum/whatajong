import { mapGetHeight, mapGetWidth } from "@/lib/game"
import { breakpoints } from "@/styles/breakpoints"
import { createBreakpoints } from "@solid-primitives/media"
import { useWindowSize } from "@solid-primitives/resize-observer"
import { createSingletonRoot } from "@solid-primitives/rootless"
import { createMemo } from "solid-js"

const BOARD_RATIO = (45 * mapGetWidth()) / (65 * mapGetHeight())
export const TILE_RATIO = 13 / 9

export function getSideSize(height: number) {
  return Math.floor(height / 10)
}

type Layout = {
  width: number
  height: number
  orientation: "landscape" | "portrait"
}

export const useLayoutSize = createSingletonRoot(() => {
  const size = useWindowSize()

  return createMemo<Layout>(() => {
    const uiPadding = 0.8 // 50% padding
    const uiPaddingFixed = 90 * 2
    const mainPadding = 0.9
    const maxHeight = 600

    const widthConstraint1 = Math.min(
      size.width * uiPadding,
      size.width - uiPaddingFixed,
    )
    const heightConstraint1 = Math.min(size.height * mainPadding, maxHeight)
    const option1Height = Math.min(
      heightConstraint1,
      widthConstraint1 / BOARD_RATIO,
    )
    const option1Width = option1Height * BOARD_RATIO

    const widthConstraint2 = size.width * mainPadding
    const heightConstraint2 = Math.min(
      size.height * uiPadding,
      size.height - uiPaddingFixed,
      maxHeight,
    )
    const option2Height = Math.min(
      heightConstraint2,
      widthConstraint2 / BOARD_RATIO,
    )
    const option2Width = option2Height * BOARD_RATIO

    if (option1Width * option1Height > option2Width * option2Height) {
      return {
        width: option1Width,
        height: option1Height,
        orientation: "portrait",
      }
    }
    return {
      width: option2Width,
      height: option2Height,
      orientation: "landscape",
    }
  })
})

function deriveSizeFromWidth(width: number) {
  const height = width * TILE_RATIO
  const corner = Math.floor(width / 10)
  const sideSize = getSideSize(height)

  return { width, height, corner, sideSize }
}

export const useTileSize = createSingletonRoot(() => {
  return createMemo(() => {
    const layout = useLayoutSize()
    const width = layout().width / (mapGetWidth() / 2)
    return deriveSizeFromWidth(width)
  })
})

export function useSmallerTileSize(ratio: number) {
  return createMemo(() => {
    const tileSize = useTileSize()
    const width = tileSize().width * ratio

    return deriveSizeFromWidth(width)
  })
}

export const useImageSrc = createSingletonRoot(() => {
  const match = createBreakpoints(breakpoints)

  return createMemo(() => {
    const sizes = {
      xxs: "xs",
      xs: "xs",
      s: "xs",
      m: "m",
      l: "m",
      xl: "m",
      xxl: "m",
    }
    const size = sizes[match.key]
    return `/tiles/${size}`
  })
})
