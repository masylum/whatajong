import { TILE_RATIO, TILE_WIDTH } from "@/state/constants"
import { color, getHueColor, type AccentHue } from "@/styles/colors"
import { TileBody } from "./tileBody"
import { TileSide } from "./tileSide"
import type { Card, Suit } from "@repo/game/deck"
import { createMemo, Show, splitProps, type JSX } from "solid-js"
import { TileImage } from "./tileImage"
import { strokePath } from "./tileComponent"
import type { Material } from "@repo/game/tile"
import { tileClass } from "./basicTile.css"

type Props = {
  card?: Card | Suit
  highlighted?: AccentHue | "white"
  material?: Material
  width?: number
} & JSX.SvgSVGAttributes<SVGSVGElement>
export function BasicTile(props: Props) {
  const [local, other] = splitProps(props, ["card", "highlighted", "material"])
  const width = createMemo(() => props.width ?? TILE_WIDTH)
  const height = createMemo(() => width() * TILE_RATIO)
  const dPath = createMemo(() =>
    strokePath({ width: width(), height: height() }),
  )

  return (
    <svg
      width={width()}
      height={height()}
      {...other}
      class={[tileClass, other.class].filter(Boolean).join(" ")}
    >
      <TileSide d={dPath()} material={local.material} />
      <TileBody material={local.material} width={width()} height={height()} />
      <Show when={local.card}>
        {(card) => (
          <TileImage width={width()} height={height()} card={card()} />
        )}
      </Show>
      <Show when={local.highlighted}>
        {(color) => (
          <path
            d={dPath()}
            fill={
              color() === "white" ? "white" : getHueColor(color() as any)(30)
            }
            opacity="0.4"
            stroke="none"
          />
        )}
      </Show>
      <path d={dPath()} fill="none" stroke={color.tile30} stroke-width="1" />
    </svg>
  )
}
