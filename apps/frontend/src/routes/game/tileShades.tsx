import { createMemo, Show } from "solid-js"
import { getTile, getPosition } from "@repo/game/map"
import type { Tile } from "@repo/game/types"
import { gameState, SIDE_SIZES } from "../state"
import { TILE_HEIGHT, TILE_WIDTH } from "./tileComponent"

export const SOFT_SHADE_FILTER_ID = "softShade"
export const TOP_SHADE_GRADIENT_ID = "topShadeGradient"
export const RIGHT_SHADE_GRADIENT_ID = "rightShadeGradient"
export const TOP_HALF_SHADE_GRADIENT_ID = "topHalfShadeGradient"
export const RIGHT_HALF_SHADE_GRADIENT_ID = "rightHalfShadeGradient"

type Props = {
  tile: Tile
}
export function TileShades(props: Props) {
  const shadeVariants = createMemo(() => {
    const { x, y, z } = getPosition(gameState(), props.tile)
    const topLeft = !!getTile(gameState(), x, y - 1, z)
    const top = !!getTile(gameState(), x + 1, y - 1, z)
    const topRight = !!getTile(gameState(), x + 2, y - 1, z)
    const right = !!getTile(gameState(), x + 2, y, z)
    const bottomRight = !!getTile(gameState(), x + 2, y + 1, z)

    return { topLeft, top, topRight, right, bottomRight }
  })
  return (
    <>
      <TopShade shadeVariants={shadeVariants()} />
      <RightShade shadeVariants={shadeVariants()} />
    </>
  )
}

type SideShadeProps = {
  shadeVariants: {
    topLeft: boolean
    top: boolean
    topRight: boolean
    right: boolean
    bottomRight: boolean
  }
}

export function TopShade(props: SideShadeProps) {
  const topShadePath = createMemo(() => {
    const { topLeft, top, topRight } = props.shadeVariants

    if (topLeft && !top) {
      return `
        M ${TILE_WIDTH / 2} 0
        l ${-SIDE_SIZES.xSide} ${-SIDE_SIZES.ySide}
        h ${TILE_WIDTH / 2 + SIDE_SIZES.xSide}
        l ${SIDE_SIZES.xSide} ${SIDE_SIZES.ySide}
        Z
      `
    }

    if (!topLeft && top) {
      return `
        M 0 0
        l ${-SIDE_SIZES.xSide} ${-SIDE_SIZES.ySide}
        h ${TILE_WIDTH / 2 + SIDE_SIZES.xSide}
        l ${-SIDE_SIZES.xSide} ${-SIDE_SIZES.ySide}
        v ${SIDE_SIZES.ySide * 2}
        Z
      `
    }

    if (!topLeft && !top && topRight) {
      return `
        M 0 0
        l ${-SIDE_SIZES.xSide} ${-SIDE_SIZES.ySide}
        h ${TILE_WIDTH + SIDE_SIZES.xSide * 2}
        l ${-SIDE_SIZES.xSide} ${-SIDE_SIZES.ySide}
        v ${SIDE_SIZES.ySide * 2}
        Z
      `
    }

    if (!topLeft && !top && !topRight) {
      return `
        M 0 0
        l ${-SIDE_SIZES.xSide} ${-SIDE_SIZES.ySide}
        h ${TILE_WIDTH}
        l ${SIDE_SIZES.xSide} ${SIDE_SIZES.ySide}
        Z
      `
    }
  })

  const topGradient = createMemo(() => {
    const { topLeft, top, topRight } = props.shadeVariants
    if (!topLeft && top) return TOP_HALF_SHADE_GRADIENT_ID
    if (!top && topRight) return TOP_HALF_SHADE_GRADIENT_ID

    return TOP_SHADE_GRADIENT_ID
  })

  return (
    <Show when={topShadePath()}>
      <path
        d={topShadePath()}
        fill={`url(#${topGradient()})`}
        filter={`url(#${SOFT_SHADE_FILTER_ID})`}
      />
    </Show>
  )
}

export function RightShade(props: SideShadeProps) {
  const rightGradient = createMemo(() => {
    const { bottomRight, right, topRight } = props.shadeVariants
    if (!bottomRight && right) return RIGHT_HALF_SHADE_GRADIENT_ID
    if (!right && topRight) return RIGHT_HALF_SHADE_GRADIENT_ID

    return RIGHT_SHADE_GRADIENT_ID
  })

  const rightShadePath = createMemo(() => {
    const { topRight, right, bottomRight } = props.shadeVariants

    if (bottomRight && !right) {
      return `
        M ${TILE_WIDTH} 0
        l ${-SIDE_SIZES.xSide} ${-SIDE_SIZES.ySide}
        v ${TILE_HEIGHT / 2}
        l ${SIDE_SIZES.xSide} ${SIDE_SIZES.ySide}
        Z
      `
    }

    if (!bottomRight && right) {
      return `
        M ${TILE_WIDTH} ${TILE_HEIGHT / 2}
        h ${-SIDE_SIZES.xSide * 2}
        l ${SIDE_SIZES.xSide} ${SIDE_SIZES.ySide}
        v ${TILE_HEIGHT / 2 - 2 * SIDE_SIZES.ySide}
        l ${SIDE_SIZES.xSide} ${SIDE_SIZES.ySide}
        Z
      `
    }

    if (!bottomRight && !right && topRight) {
      return `
        M ${TILE_WIDTH} 0
        h ${-SIDE_SIZES.xSide * 2}
        l ${SIDE_SIZES.xSide} ${SIDE_SIZES.ySide}
        v ${TILE_HEIGHT - SIDE_SIZES.ySide * 2}
        l ${SIDE_SIZES.xSide} ${SIDE_SIZES.ySide}
        Z
      `
    }

    if (!bottomRight && !right && !topRight) {
      return `
        M ${TILE_WIDTH} 0
        l ${-SIDE_SIZES.xSide} ${-SIDE_SIZES.ySide}
        v ${TILE_HEIGHT}
        l ${SIDE_SIZES.xSide} ${SIDE_SIZES.ySide}
        Z
      `
    }
  })

  return (
    <Show when={rightShadePath()}>
      <path
        d={rightShadePath()}
        fill={`url(#${rightGradient()})`}
        filter={`url(#${SOFT_SHADE_FILTER_ID})`}
      />
    </Show>
  )
}
