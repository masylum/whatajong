import { type CardId, type Material, getCard } from "@/lib/game"
import { TILE_RATIO, useTileSize } from "@/state/constants"
import {
  type AccentHue,
  getHueColor,
  hueFromColor,
  hueFromMaterial,
} from "@/styles/colors"
import { type JSX, Show, createMemo, splitProps } from "solid-js"
import { pulseClass, tileClass } from "./basicTile.css"
import { TileBody } from "./tileBody"
import { strokePath } from "./tileComponent"
import { TileImage } from "./tileImage"
import { TileSide } from "./tileSide"

type Props = {
  cardId?: CardId
  highlighted?: AccentHue | "white"
  material?: Material
  width?: number
  pulse?: boolean
} & JSX.SvgSVGAttributes<SVGSVGElement>

export function BasicTile(props: Props) {
  const [local, other] = splitProps(props, [
    "cardId",
    "highlighted",
    "material",
  ])
  const tileSize = useTileSize()
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
      <Show when={local.cardId}>
        {(cardId) => (
          <>
            <TileImage
              width={width()}
              height={height()}
              cardId={cardId()}
              material={local.material}
            />
            {getCard(cardId())!.colors[0] as any}
            <Show when={props.pulse}>
              <path
                d={dPath()}
                fill={getHueColor(
                  hueFromColor(getCard(cardId())!.colors[0] as any),
                )(60)}
                class={pulseClass}
                stroke="none"
              />
            </Show>
          </>
        )}
      </Show>
      <Show when={local.highlighted}>
        {(color) => (
          <path
            d={dPath()}
            fill={
              color() === "white" ? "white" : getHueColor(color() as any)(60)
            }
            opacity="0.4"
            stroke="none"
          />
        )}
      </Show>
      <path
        d={dPath()}
        fill="none"
        stroke={getHueColor(hueFromMaterial(local.material ?? "bone"))(40)}
        stroke-width="1"
      />
    </svg>
  )
}
