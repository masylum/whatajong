import { SIDE_SIZES, TILE_HEIGHT, TILE_WIDTH } from "@/state/constants"
import { color, getHueColor, type AccentHue } from "@/styles/colors"
import { TileBody } from "./tileBody"
import { TileSide } from "./tileSide"
import type { Card } from "@repo/game/deck"
import { Show, type JSX } from "solid-js"
import { TileImage } from "./tileImage"
import { strokePath } from "./tileComponent"

type Props = {
  card: Card
  highlighted?: AccentHue | "white"
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
      <Show when={props.highlighted}>
        {(color) => (
          <path
            d={strokePath}
            fill={
              color() === "white" ? "white" : getHueColor(color() as any)(30)
            }
            opacity="0.4"
            stroke="none"
          />
        )}
      </Show>
      <path d={strokePath} fill="none" stroke={color.tile30} stroke-width="1" />
    </svg>
  )
}
