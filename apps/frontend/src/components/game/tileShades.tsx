import { createMemo, mergeProps, Show } from "solid-js"
import { useTileState } from "@/state/tileState"
import { getFinder, type Tile } from "@/lib/game"
import { getSideSize, getTileSize } from "@/state/constants"
import { shadeClass } from "./tileShades.css"
import { SOFT_SHADE_FILTER_ID } from "./defs"

type Props = {
  tile: Tile
  width?: number
  height?: number
}
export function TileShades(iProps: Props) {
  const tiles = useTileState()
  const tileSize = getTileSize()
  const props = mergeProps(
    { width: tileSize().width, height: tileSize().height },
    iProps,
  )
  const sideSize = createMemo(() => getSideSize(props.height))

  const shadeVariants = createMemo(() => {
    const find = getFinder(tiles, props.tile)
    const pos1 = !!find(1, -2)
    const pos2 = !!find(0, -2)
    const pos3 = !!find(-1, -2)
    const pos4 = !!find(-2, -2)
    const pos5 = !!find(-2, -1)
    const pos6 = !!find(-2, 0)
    const pos7 = !!find(-2, 1)

    const topRight = pos1 || pos2
    const top = pos2 || pos3
    const topLeft = pos3 || pos4 || pos5
    const left = pos5 || pos6
    const bottomLeft = pos6 || pos7

    return { topLeft, top, topRight, left, bottomLeft }
  })
  return (
    <>
      <TopShade
        height={props.height}
        width={props.width}
        sideSize={sideSize()}
        shadeVariants={shadeVariants()}
      />
      <RightShade
        height={props.height}
        width={props.width}
        sideSize={sideSize()}
        shadeVariants={shadeVariants()}
      />
    </>
  )
}

type SideShadeProps = {
  height: number
  width: number
  sideSize: number
  shadeVariants: {
    topLeft: boolean
    top: boolean
    topRight: boolean
    left: boolean
    bottomLeft: boolean
  }
}

export function TopShade(props: SideShadeProps) {
  const topShadePath = createMemo(() => {
    const { topLeft, top, topRight } = props.shadeVariants

    if (topRight && !top) {
      return `
        M ${props.width / 2} 0
        l ${-props.sideSize} ${-props.sideSize}
        h ${-props.width / 2 + props.sideSize}
        l ${props.sideSize} ${props.sideSize}
        Z
      `
    }

    if (!topRight && top) {
      return `
        M ${props.width} 0
        l ${-props.sideSize} ${-props.sideSize}
        h ${-props.width / 2 + props.sideSize}
        l ${-props.sideSize} ${-props.sideSize}
        v ${props.sideSize * 2}
        Z
      `
    }

    if (!topRight && !top && topLeft) {
      return `
        M ${props.width} 0
        l ${-props.sideSize} ${-props.sideSize}
        h ${-props.width + props.sideSize * 2}
        l ${-props.sideSize} ${-props.sideSize}
        v ${props.sideSize * 2}
        Z
      `
    }

    if (!topRight && !top && !topLeft) {
      return `
        M ${props.width} 0
        l ${-props.sideSize} ${-props.sideSize}
        h ${-props.width}
        l ${props.sideSize} ${props.sideSize}
        Z
      `
    }
  })

  return (
    <Show when={topShadePath()}>
      <path
        d={topShadePath()}
        class={shadeClass}
        fill="rgba(0,0,0,0.1)"
        filter={`url(#${SOFT_SHADE_FILTER_ID})`}
      />
    </Show>
  )
}

export function RightShade(props: SideShadeProps) {
  const tileSize = getTileSize()
  const rightShadePath = createMemo(() => {
    const { topLeft, left, bottomLeft } = props.shadeVariants

    if (bottomLeft && !left) {
      return `
        M 0 0
        l ${-props.sideSize} ${-props.sideSize}
        v ${tileSize().height / 2}
        l ${props.sideSize} ${props.sideSize}
        Z
      `
    }

    if (!bottomLeft && left) {
      return `
        M 0 ${tileSize().height / 2}
        h ${-props.sideSize * 2}
        l ${props.sideSize} ${props.sideSize}
        v ${tileSize().height / 2 - 2 * props.sideSize}
        l ${props.sideSize} ${props.sideSize}
        Z
      `
    }

    if (!bottomLeft && !left && topLeft) {
      return `
        M 0 0
        h ${-props.sideSize * 2}
        l ${props.sideSize} ${props.sideSize}
        v ${tileSize().height - props.sideSize * 2}
        l ${props.sideSize} ${props.sideSize}
        Z
      `
    }

    if (!bottomLeft && !left && !topLeft) {
      return `
        M 0 0
        l ${-props.sideSize} ${-props.sideSize}
        v ${tileSize().height}
        l ${props.sideSize} ${props.sideSize}
        Z
      `
    }
  })

  return (
    <Show when={rightShadePath()}>
      <path
        data-variants={JSON.stringify(props.shadeVariants)}
        d={rightShadePath()}
        class={shadeClass}
        fill="rgba(0,0,0,0.1)"
        filter={`url(#${SOFT_SHADE_FILTER_ID})`}
        data-shade={JSON.stringify(props.shadeVariants)}
      />
    </Show>
  )
}
