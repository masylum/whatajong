import { TILE_WIDTH, TILE_HEIGHT, TILE_RATIO } from "@/state/constants"
import { mergeProps } from "solid-js"
import type { Card, Suit } from "@/lib/game"

type Props = {
  width?: number
  height?: number
  card: Card | Suit
}
const PADDING = 2
export function TileImage(iProps: Props) {
  const props = mergeProps({ width: TILE_WIDTH, height: TILE_HEIGHT }, iProps)

  return (
    <image
      href={`/tiles2/${props.card}.webp`}
      x={PADDING}
      y={PADDING * TILE_RATIO}
      width={props.width - PADDING * 2}
      height={props.height - PADDING * 2 * TILE_RATIO}
    />
  )
}
