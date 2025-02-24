import { isFlower, type Card } from "@repo/game/deck"
import { isSeason } from "@repo/game/deck"
import { SIDE_SIZES } from "../../routes/state"
import { CORNER_RADIUS, TILE_HEIGHT, TILE_WIDTH } from "../../routes/state"
import { createMemo } from "solid-js"
import {
  BODY_GRADIENT_ID,
  FLOWER_BODY_GRADIENT_ID,
  SEASON_BODY_GRADIENT_ID,
} from "./defs"

type Props = {
  card: Card
}

export function TileBody(props: Props) {
  const fill = createMemo(() => {
    if (isFlower(props.card)) return `url(#${FLOWER_BODY_GRADIENT_ID})`
    if (isSeason(props.card)) return `url(#${SEASON_BODY_GRADIENT_ID})`

    return `url(#${BODY_GRADIENT_ID})`
  })

  return (
    <path
      d={`M ${-SIDE_SIZES.xSide * 2 + CORNER_RADIUS} ${SIDE_SIZES.ySide * 2}
        h ${TILE_WIDTH - 2 * CORNER_RADIUS}
        a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 ${CORNER_RADIUS} ${CORNER_RADIUS}
        v ${TILE_HEIGHT - 2 * CORNER_RADIUS} 
        a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS} ${CORNER_RADIUS}
        h ${-TILE_WIDTH + 2 * CORNER_RADIUS}
        a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 -${CORNER_RADIUS} -${CORNER_RADIUS}
        v ${-TILE_HEIGHT + 2 * CORNER_RADIUS}
        a ${CORNER_RADIUS} ${CORNER_RADIUS} 0 0 1 ${CORNER_RADIUS} -${CORNER_RADIUS}
        Z`}
      fill={fill()}
    />
  )
}
