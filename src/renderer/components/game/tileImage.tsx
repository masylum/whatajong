import { getTileSrc } from "@/assets/assets"
import {
  type CardId,
  type Material,
  isElement,
  isShiny,
  isTaijitu,
} from "@/lib/game"
import { TILE_RATIO, useTileSize } from "@/state/constants"
import { createMemo, mergeProps } from "solid-js"

type Props = {
  width?: number
  height?: number
  cardId: CardId
  material?: Material
  free?: boolean
  taijituActive?: boolean
  isShadow?: boolean
}
const PADDING = 2
export function TileImage(iProps: Props) {
  const tileSize = useTileSize()
  const props = mergeProps(
    { width: tileSize().width, height: tileSize().height, free: true },
    iProps,
  )
  const image = createMemo(() => {
    const elementCard = isElement(props.cardId)
    if (elementCard) {
      return `${props.cardId}${props.free ? 1 : 2}`
    }
    const taijituCard = isTaijitu(props.cardId)
    if (taijituCard) {
      return `${props.cardId}${props.taijituActive ? 2 : 1}`
    }

    return props.cardId
  })
  const imageSrc = getTileSrc(image())

  const filter = createMemo(() => {
    if (props.material && isShiny(props.material)) {
      return "invert(1) sepia(0) saturate(1.2) brightness(0.8) hue-rotate(180deg)"
    }

    if (props.isShadow) {
      return "brightness(0)"
    }

    return undefined
  })

  return (
    <image
      href={imageSrc}
      x={PADDING}
      y={PADDING * TILE_RATIO}
      width={props.width - PADDING * 2}
      height={props.height - PADDING * 2 * TILE_RATIO}
      style={{ filter: filter() }}
    />
  )
}
