import { createMemo } from "solid-js"
import type { Tile } from "@repo/game/types"
import { getSuit, getNumber } from "@repo/game/deck"
import { TILE_WIDTH, TILE_HEIGHT } from "./tileComponent"

export const SIDE_GRADIENT_ID = "sideGradient"

const INNER_PADING = 2

type Props = {
  tile: Tile
}
export function TileImage(props: Props) {
  const imageLoc = createMemo(() => {
    const cardface = props.tile.card
    const type = getSuit(cardface)
    const number = getNumber(cardface)
    const height = TILE_HEIGHT - 2 * INNER_PADING
    const width = TILE_WIDTH - 2 * INNER_PADING

    switch (type) {
      case "b":
        return { y: 0, x: (Number(number) - 1) * width }
      case "c":
        return { y: height, x: (Number(number) - 1) * width }
      case "o":
        return { y: 2 * height, x: (Number(number) - 1) * width }
      case "f":
        return { y: 3 * height, x: (Number(number) - 1) * width }
      case "s":
        return { y: 3 * height, x: (Number(number) + 3) * width }
      case "w":
        switch (number) {
          case "n":
            return { y: 4 * height, x: 3 * width }
          case "w":
            return { y: 4 * height, x: 4 * width }
          case "s":
            return { y: 4 * height, x: 5 * width }
          case "e":
            return { y: 4 * height, x: 6 * width }
          default:
            throw new Error(`Invalid wind number: ${number}`)
        }
      case "d":
        switch (number) {
          case "c":
            return { y: 4 * height, x: 0 }
          case "f":
            return { y: 4 * height, x: width }
          case "p":
            return { y: 4 * height, x: 2 * width }
          default:
            throw new Error(`Invalid dragon number: ${number}`)
        }
    }
    return { x: 0, y: 0 }
  })

  return (
    <svg
      x={INNER_PADING}
      y={INNER_PADING}
      width={TILE_WIDTH - 2 * INNER_PADING}
      height={TILE_HEIGHT - 2 * INNER_PADING}
      viewBox={`0 0 ${TILE_WIDTH - 2 * INNER_PADING} ${TILE_HEIGHT - 2 * INNER_PADING}`}
    >
      <title>{props.tile.card}</title>
      <image
        href="/tiles2.webp"
        x={-imageLoc().x}
        y={-imageLoc().y}
        width={(TILE_WIDTH - 2 * INNER_PADING) * 9}
        height={(TILE_HEIGHT - 2 * INNER_PADING) * 5}
        preserveAspectRatio="none"
      />
    </svg>
  )
}
