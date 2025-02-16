import { createMemo, Show } from "solid-js"
import { db, SIDE_SIZES } from "../state"
import { TILE_HEIGHT, TILE_WIDTH } from "./tileComponent"
import { getFinder, type Tile } from "@repo/game/tile"

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
    const find = getFinder(db.tiles, props.tile)
    const pos1 = !!find(-1, -2)
    const pos2 = !!find(0, -2)
    const pos3 = !!find(1, -2)
    const pos4 = !!find(2, -2)
    const pos5 = !!find(2, -1)
    const pos6 = !!find(2, 0)
    const pos7 = !!find(2, 1)

    const topLeft = pos1 || pos2
    const top = pos2 || pos3
    const topRight = pos3 || pos4 || pos5
    const right = pos5 || pos6
    const bottomRight = pos6 || pos7

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
