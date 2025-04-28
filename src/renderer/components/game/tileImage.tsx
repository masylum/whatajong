import {
  type CardId,
  type Material,
  isElement,
  isShiny,
  isTrigram,
} from "@/lib/game"
import { TILE_RATIO, useImageSrc, useTileSize } from "@/state/constants"
import { createMemo, mergeProps } from "solid-js"

type Props = {
  width?: number
  height?: number
  cardId: CardId
  material?: Material
  free?: boolean
}
const PADDING = 2
export function TileImage(iProps: Props) {
  const tileSize = useTileSize()
  const props = mergeProps(
    { width: tileSize().width, height: tileSize().height, free: true },
    iProps,
  )
  const href = useImageSrc()
  const image = createMemo(() => {
    const card = isTrigram(props.cardId) ?? isElement(props.cardId)
    if (card) {
      return `${props.cardId}${props.free ? 1 : 2}`
    }

    return props.cardId
  })

  const filter = createMemo(() => {
    if (!props.material || !isShiny(props.material)) {
      return undefined
    }

    return "invert(1) sepia(0.3) brightness(1.05) hue-rotate(180deg)"
  })

  return (
    <image
      href={`${href()}/${image()}.webp`}
      x={PADDING}
      y={PADDING * TILE_RATIO}
      width={props.width - PADDING * 2}
      height={props.height - PADDING * 2 * TILE_RATIO}
      style={{ filter: filter() }}
    />
  )
}
