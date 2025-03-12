import { MATERIALS } from "./defs"
import { createMemo, mergeProps } from "solid-js"
import type { Material } from "@repo/game/tile"

type Props = {
  material?: Material
  d?: string
}
export function TileSide(iProps: Props) {
  const props = mergeProps({ material: "bone" } as const, iProps)
  const sideGradientId = createMemo(() => MATERIALS[props.material].side)
  const isGlass = createMemo(() => props.material === "glass")

  return (
    <path
      d={props.d}
      fill-opacity={isGlass() ? 0.2 : 1}
      fill={`url(#${sideGradientId()})`}
    />
  )
}
