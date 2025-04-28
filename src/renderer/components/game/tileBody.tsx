import { type Material, isShiny, opacity } from "@/lib/game"
import { useTileSize } from "@/state/constants"
import { getHueColor, hueFromMaterial } from "@/styles/colors"
import { createMemo, mergeProps } from "solid-js"
import { MATERIALS } from "./defs"

type Props = {
  material?: Material
  width?: number
  height?: number
}

export function TileBody(iProps: Props) {
  const tileSize = useTileSize()
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
  const shiny = createMemo(() => isShiny(props.material))
  const strokeShade = createMemo(() => {
    if (props.material === "bone") return 90
    if (shiny()) return 60
    return 80
  })

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
        fill-opacity={opacity(props.material)}
        stroke={getHueColor(hueFromMaterial(props.material))(strokeShade())}
        fill={`url(#${fill()})`}
      />
    </>
  )
}
