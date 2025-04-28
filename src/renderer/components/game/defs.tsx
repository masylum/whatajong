import { type Material, isShiny, materials } from "@/lib/game"
import {
  type AccentHue,
  type ShadeTypes,
  getHueColor,
  hueFromMaterial,
} from "@/styles/colors"
import { entries, fromEntries, map } from "remeda"
import { For, createMemo } from "solid-js"

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
    <svg style={{ position: "absolute", "pointer-events": "none" }}>
      <defs>
        <filter id={SOFT_SHADE_FILTER_ID}>
          <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" result="blur" />
        </filter>

        <For each={entries(MATERIALS)}>
          {([material, ids]) => <MaterialBody material={material} ids={ids} />}
        </For>
      </defs>
    </svg>
  )
}

function MaterialBody(props: {
  material: Material
  ids: { body: string; side: string }
}) {
  const hue = createMemo(() => hueFromMaterial(props.material))
  const shiny = createMemo(() => isShiny(props.material))

  function colorize(shade: ShadeTypes<AccentHue>) {
    return getHueColor(hue())(shade)
  }

  return (
    <>
      <linearGradient
        id={props.ids.body}
        gradientTransform="rotate(45, 0.5, 0.5)"
      >
        <stop offset="50%" stop-color={colorize(shiny() ? 30 : 90)} />
        <stop offset="100%" stop-color={colorize(shiny() ? 20 : 80)} />
      </linearGradient>
      <linearGradient
        id={props.ids.side}
        gradientTransform="rotate(-45, 0.5, 0.5)"
      >
        <stop offset="0%" stop-color={colorize(shiny() ? 10 : 50)} />
        <stop offset="50%" stop-color={colorize(shiny() ? 10 : 50)} />
        <stop offset="50%" stop-color={colorize(shiny() ? 20 : 60)} />
        <stop offset="100%" stop-color={colorize(shiny() ? 30 : 70)} />
      </linearGradient>
    </>
  )
}
