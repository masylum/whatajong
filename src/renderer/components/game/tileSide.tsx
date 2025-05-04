import { type Material, opacity } from "@/lib/game"
import { createMemo, mergeProps } from "solid-js"
import { MATERIALS } from "./defs"

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
      fill-opacity={opacity(props.material) * 1.7}
      fill={`url(#${sideGradientId()})`}
    />
  )
}
