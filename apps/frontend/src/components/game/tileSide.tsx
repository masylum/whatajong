import { MATERIALS } from "./defs"
import { strokePath } from "./tileComponent"
import { createMemo, mergeProps } from "solid-js"
import type { Material } from "@repo/game/tile"

type Props = {
  material?: Material
}
export function TileSide(iProps: Props) {
  const props = mergeProps({ material: "bone" } as const, iProps)
  const sideGradientId = createMemo(() => MATERIALS[props.material].side)
  const isGlass = createMemo(() => props.material === "glass")

  return (
    <path
      d={strokePath}
      fill-opacity={isGlass() ? 0.2 : 1}
      fill={`url(#${sideGradientId()})`}
    />
  )
}
