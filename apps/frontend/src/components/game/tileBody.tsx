import {
  SIDE_SIZES,
  CORNER_RADIUS,
  TILE_HEIGHT,
  TILE_WIDTH,
} from "@/state/constants"
import { createMemo, mergeProps } from "solid-js"
import { MATERIALS } from "./defs"
import type { Material } from "@repo/game/tile"

type Props = {
  material?: Material
}

export function TileBody(iProps: Props) {
  const props = mergeProps({ material: "bone" } as const, iProps)
  const fill = createMemo(() => MATERIALS[props.material].body)
  const isGlass = createMemo(() => props.material === "glass")

  return (
    <>
      <path
        d={`M ${-SIDE_SIZES.xSide * 2 + CORNER_RADIUS} ${SIDE_SIZES.ySide * 2}
          h ${TILE_WIDTH - 2 * CORNER_RADIUS}
          a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 ${CORNER_RADIUS} ${CORNER_RADIUS}
          v ${TILE_HEIGHT - 2 * CORNER_RADIUS} 
          a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS} ${CORNER_RADIUS}
          h ${-TILE_WIDTH + 2 * CORNER_RADIUS}
          a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS} -${CORNER_RADIUS}
          v ${-TILE_HEIGHT + 2 * CORNER_RADIUS}
          a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 ${CORNER_RADIUS} -${CORNER_RADIUS}
          Z`}
        fill-opacity={isGlass() ? 0.5 : 1}
        fill={`url(#${fill()})`}
      />
    </>
  )
}
