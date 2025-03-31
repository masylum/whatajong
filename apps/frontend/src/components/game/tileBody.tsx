import { createMemo, mergeProps } from "solid-js"
import { MATERIALS } from "./defs"
import { isTransparent, type Material } from "@/lib/game"
import { getHueColor } from "@/styles/colors"
import { getTileSize } from "@/state/constants"

type Props = {
  material?: Material
  width?: number
  height?: number
}

export function TileBody(iProps: Props) {
  const tileSize = getTileSize()
  const props = mergeProps(
    {
      material: "bone",
      width: tileSize().width,
      height: tileSize().height,
    } as const,
    iProps,
  )
  const fill = createMemo(() => MATERIALS[props.material].body)
  const corner = createMemo(() => tileSize().corner)

  return (
    <>
      <path
        d={`M ${corner()} 0
          h ${props.width - 2 * corner()}
          a ${corner()} ${corner()} 0 0 1 ${corner()} ${corner()}
          v ${props.height - 2 * corner()} 
          a ${corner()} ${corner()} 0 0 1 -${corner()} ${corner()}
          h ${-props.width + 2 * corner()}
          a ${corner()} ${corner()} 0 0 1 -${corner()} -${corner()}
          v ${-props.height + 2 * corner()}
          a ${corner()} ${corner()} 0 0 1 ${corner()} -${corner()}
          Z`}
        fill-opacity={isTransparent(props.material) ? 0.6 : 1}
        stroke={getHueColor(props.material)(90)}
        fill={`url(#${fill()})`}
      />
    </>
  )
}
