import { SIDE_SIZES, TILE_HEIGHT, TILE_WIDTH } from "@/state/constants"
import { color, getHueColor, type AccentHue } from "@/styles/colors"
import { TileBody } from "./tileBody"
import { TileSide } from "./tileSide"
import type { Card } from "@repo/game/deck"
import { Show, splitProps, type JSX } from "solid-js"
import { TileImage } from "./tileImage"
import { strokePath } from "./tileComponent"
import type { Material } from "@repo/game/tile"

type Props = {
  card?: Card
  highlighted?: AccentHue | "white"
  material?: Material
} & JSX.SvgSVGAttributes<SVGSVGElement>
export function BasicTile(props: Props) {
  const [local, other] = splitProps(props, ["card", "highlighted", "material"])

  return (
    <svg
      width={TILE_WIDTH + 4 * Math.abs(SIDE_SIZES.xSide)}
      height={TILE_HEIGHT + 4 * Math.abs(SIDE_SIZES.ySide)}
      {...other}
    >
      <TileSide material={local.material} />
      <TileBody material={local.material} />
      <Show when={local.card}>{(card) => <TileImage card={card()} />}</Show>
      <Show when={local.highlighted}>
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
