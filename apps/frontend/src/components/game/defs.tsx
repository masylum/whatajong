import { SIDE_SIZES, TILE_HEIGHT, TILE_WIDTH } from "@/state/constants"
import { materials } from "@repo/game/tile"
import { entries, fromEntries, map } from "remeda"
import { For } from "solid-js"
import { materialColors } from "@/styles/materialColors"

export const SOFT_SHADE_FILTER_ID = "soft-shade"
export const VISIBILITY_MASK_ID = "visibility-mask"

export const MATERIALS = fromEntries(
  map(
    materials,
    (material) =>
      [
        material,
        {
          body: `${material}-body-gradient`,
          side: `${material}-side-gradient`,
        },
      ] as const,
  ),
)

const VISIBILITY_GRADIENT_ID = "visibility-gradient"

export function Defs() {
  return (
    <svg style={{ position: "absolute" }}>
      <defs>
        <filter id={SOFT_SHADE_FILTER_ID}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
        </filter>

        <For each={entries(MATERIALS)}>
          {([material, ids]) => (
            <>
              <linearGradient id={ids.body} gradientTransform="rotate(-45)">
                <stop offset="0%" stop-color={materialColors[material][60]} />
                <stop offset="100%" stop-color={materialColors[material][50]} />
              </linearGradient>
              <linearGradient id={ids.side} gradientTransform="rotate(45)">
                <stop offset="0%" stop-color={materialColors[material][40]} />
                <stop offset="73%" stop-color={materialColors[material][30]} />
                <stop offset="73%" stop-color={materialColors[material][20]} />
                <stop offset="100%" stop-color={materialColors[material][10]} />
              </linearGradient>
            </>
          )}
        </For>

        <linearGradient id={`${VISIBILITY_GRADIENT_ID}`}>
          <stop offset="0%" stop-color="white" stop-opacity="1" />
          <stop offset="30%" stop-color="white" stop-opacity="1" />
          <stop offset="70%" stop-color="white" stop-opacity="0.2" />
        </linearGradient>

        <mask id={VISIBILITY_MASK_ID}>
          <rect
            x={0}
            y={0}
            width={TILE_WIDTH + Math.abs(SIDE_SIZES.xSide) * 4}
            height={TILE_HEIGHT + Math.abs(SIDE_SIZES.ySide) * 4}
            fill={`url(#${VISIBILITY_GRADIENT_ID})`}
          />
        </mask>
      </defs>
    </svg>
  )
}
