import type { Card } from "@/lib/game"
import { TILE_RATIO, useImageSrc, useTileSize } from "@/state/constants"
import { mergeProps } from "solid-js"

type Props = {
  width?: number
  height?: number
  card: Card
}
const PADDING = 2
export function TileImage(iProps: Props) {
  const tileSize = useTileSize()
  const props = mergeProps(
    { width: tileSize().width, height: tileSize().height },
    iProps,
  )
  const href = useImageSrc()

  return (
    <image
      href={`${href()}/${iProps.card}.webp`}
      x={PADDING}
      y={PADDING * TILE_RATIO}
      width={props.width - PADDING * 2}
      height={props.height - PADDING * 2 * TILE_RATIO}
    />
  )
}
