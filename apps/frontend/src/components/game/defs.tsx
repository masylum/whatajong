import { materials } from "@/lib/game"
import { entries, fromEntries, map } from "remeda"
import { For } from "solid-js"
import { materialColors } from "@/styles/materialColors"

export const SOFT_SHADE_FILTER_ID = "soft-shade"

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

export function Defs() {
  return (
    <svg style={{ position: "absolute" }}>
      <defs>
        <filter id={SOFT_SHADE_FILTER_ID}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="blur" />
        </filter>

        <For each={entries(MATERIALS)}>
          {([material, ids]) => (
            <>
              <linearGradient id={ids.body} gradientTransform="rotate(-45)">
                <stop offset="0%" stop-color={materialColors[material][90]} />
                <stop offset="100%" stop-color={materialColors[material][70]} />
              </linearGradient>
              <linearGradient
                id={ids.side}
                gradientTransform="rotate(-45, 0.5, 0.5)"
              >
                <stop offset="0%" stop-color={materialColors[material][60]} />
                <stop offset="50%" stop-color={materialColors[material][50]} />
                <stop offset="50%" stop-color={materialColors[material][40]} />
                <stop offset="100%" stop-color={materialColors[material][30]} />
              </linearGradient>
            </>
          )}
        </For>
      </defs>
    </svg>
  )
}
