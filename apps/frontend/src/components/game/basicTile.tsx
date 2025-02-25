import { SIDE_SIZES, TILE_HEIGHT, TILE_WIDTH } from "@/state/constants"
import { color } from "@/styles/colors"
import { TileBody } from "./tileBody"
import { TileSide } from "./tileSide"
import type { Card } from "@repo/game/deck"
import type { JSX } from "solid-js"
import { TileImage } from "./tileImage"
import { strokePath } from "./tileComponent"

type Props = {
  card: Card
} & JSX.SvgSVGAttributes<SVGSVGElement>
export function BasicTile(props: Props) {
  return (
    <svg
      width={TILE_WIDTH + 4 * Math.abs(SIDE_SIZES.xSide)}
      height={TILE_HEIGHT + 4 * Math.abs(SIDE_SIZES.ySide)}
      {...props}
    >
      <TileSide card={props.card} />
      <TileBody card={props.card} />
      <TileImage card={props.card} />
      <path d={strokePath} fill="none" stroke={color.tile30} stroke-width="1" />
    </svg>
  )
}
