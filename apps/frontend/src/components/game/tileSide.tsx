import { SIDE_SEASON_GRADIENT_ID } from "./defs"
import { SIDE_FLOWER_GRADIENT_ID } from "./defs"
import { isSeason, type Card } from "@repo/game/deck"
import { isFlower } from "@repo/game/deck"
import { strokePath } from "./tileComponent"
import { createMemo } from "solid-js"
import { SIDE_GRADIENT_ID } from "./defs"

type Props = {
  card: Card
}
export function TileSide(props: Props) {
  const sideGradientId = createMemo(() => {
    if (isFlower(props.card)) return SIDE_FLOWER_GRADIENT_ID
    if (isSeason(props.card)) return SIDE_SEASON_GRADIENT_ID

    return SIDE_GRADIENT_ID
  })

  return <path d={strokePath} fill={`url(#${sideGradientId()})`} />
}
