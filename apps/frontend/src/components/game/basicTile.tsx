import { getHueColor, type AccentHue } from "@/styles/colors"
import { TileBody } from "./tileBody"
import { TileSide } from "./tileSide"
import type { Card, Material } from "@/lib/game"
import { createMemo, Show, splitProps, type JSX } from "solid-js"
import { TileImage } from "./tileImage"
import { strokePath } from "./tileComponent"
import { tileClass } from "./basicTile.css"
import { getTileSize, TILE_RATIO } from "@/state/constants"

type Props = {
  card?: Card
  highlighted?: AccentHue | "white"
  material?: Material
  width?: number
} & JSX.SvgSVGAttributes<SVGSVGElement>
export function BasicTile(props: Props) {
  const [local, other] = splitProps(props, ["card", "highlighted", "material"])
  const tileSize = getTileSize()
  const width = createMemo(() => props.width ?? tileSize().width)
  const height = createMemo(() => width() * TILE_RATIO)
  const dPath = createMemo(() =>
    strokePath({ width: width(), height: height() }),
  )

  return (
    <svg
      {...other}
      width={width()}
      height={height()}
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
      <path
        d={dPath()}
        fill="none"
        stroke={getHueColor(local.material ?? "bone")(40)}
        stroke-width="1"
      />
    </svg>
  )
}
