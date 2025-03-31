import { TILE_RATIO, getImageSrc, getTileSize } from "@/state/constants"
import { mergeProps } from "solid-js"
import type { Card } from "@/lib/game"

type Props = {
  width?: number
  height?: number
  card: Card
}
const PADDING = 2
export function TileImage(iProps: Props) {
  const tileSize = getTileSize()
  const props = mergeProps(
    { width: tileSize().width, height: tileSize().height },
    iProps,
  )
  const href = getImageSrc(props.card)

  return (
    <image
      href={href()}
      x={PADDING}
      y={PADDING * TILE_RATIO}
      width={props.width - PADDING * 2}
      height={props.height - PADDING * 2 * TILE_RATIO}
    />
  )
}
