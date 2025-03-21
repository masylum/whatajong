import { CORNER_RADIUS, TILE_HEIGHT, TILE_WIDTH } from "@/state/constants"
import { createMemo, mergeProps } from "solid-js"
import { MATERIALS } from "./defs"
import { isTransparent, type Material } from "@/lib/game"
import { getHueColor } from "@/styles/colors"

type Props = {
  material?: Material
  width?: number
  height?: number
}

export function TileBody(iProps: Props) {
  const props = mergeProps(
    { material: "bone", width: TILE_WIDTH, height: TILE_HEIGHT } as const,
    iProps,
  )
  const fill = createMemo(() => MATERIALS[props.material].body)

  return (
    <>
      <path
        d={`M ${CORNER_RADIUS} 0
          h ${props.width - 2 * CORNER_RADIUS}
          a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 ${CORNER_RADIUS} ${CORNER_RADIUS}
          v ${props.height - 2 * CORNER_RADIUS} 
          a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS} ${CORNER_RADIUS}
          h ${-props.width + 2 * CORNER_RADIUS}
          a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS} -${CORNER_RADIUS}
          v ${-props.height + 2 * CORNER_RADIUS}
          a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 ${CORNER_RADIUS} -${CORNER_RADIUS}
          Z`}
        fill-opacity={isTransparent(props.material) ? 0.6 : 1}
        stroke={getHueColor(props.material)(90)}
        fill={`url(#${fill()})`}
      />
    </>
  )
}
