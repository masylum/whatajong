import { MATERIALS } from "./defs"
import { createMemo, mergeProps } from "solid-js"
import { isTransparent, type Material } from "@/lib/game"

type Props = {
  material?: Material
  d?: string
}
export function TileSide(iProps: Props) {
  const props = mergeProps({ material: "bone" } as const, iProps)
  const sideGradientId = createMemo(() => MATERIALS[props.material].side)

  return (
    <path
      d={props.d}
      fill-opacity={isTransparent(props.material) ? 0.6 : 1}
      fill={`url(#${sideGradientId()})`}
    />
  )
}
