import type { Card } from "@repo/game/deck"
import {
  TILE_WIDTH,
  TILE_HEIGHT,
  SIDE_SIZES,
  INNER_PADING,
} from "@/state/constants"

export function TileImage(props: { card: Card }) {
  return (
    <image
      href={`/tiles3/${props.card}.webp`}
      x={INNER_PADING - SIDE_SIZES.xSide * 2}
      y={INNER_PADING + SIDE_SIZES.ySide * 2}
      width={TILE_WIDTH - 2 * INNER_PADING}
      height={TILE_HEIGHT - 2 * INNER_PADING}
    />
  )
}
