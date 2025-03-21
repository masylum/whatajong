import { createEffect, createSignal, Match, Show, Switch } from "solid-js"
import { Portal } from "solid-js/web"
import {
  tooltipClass,
  tileClass,
  detailTermClass,
  detailDescriptionClass,
  detailListClass,
  miniTileClass,
  detailFreedomClass,
  detailFreedomTitleClass,
  detailInfoClass,
} from "./tileHover.css"
import type { Card, Material } from "@/lib/game"
import {
  cardName,
  getMaterialCoins,
  getRawMultiplier,
  getRawPoints,
  isDragon,
  isWind,
} from "@/lib/game"
import type { JSX } from "solid-js"
import { useRunState } from "@/state/runState"
import { BasicTile } from "./basicTile"

type TileHoverProps = {
  mousePosition: { x: number; y: number }
  card: Card
  material: Material
}

const VERTICAL_OFFSET = 30

export function TileHover(props: TileHoverProps) {
  const [tooltipEl, setTooltipEl] = createSignal<HTMLDivElement>()

  const initialStyle: JSX.CSSProperties = {
    position: "fixed" as const,
    top: "0",
    left: "0",
    transition: "opacity 0.15s ease-out",
  }

  createEffect(() => {
    const tooltip = tooltipEl()
    if (!tooltip) return

    const { x, y } = props.mousePosition

    const rect = tooltip.getBoundingClientRect()
    let newX = x - rect.width / 2
    let newY = y - rect.height - VERTICAL_OFFSET

    const viewportWidth = window.innerWidth

    if (newX < 0) {
      newX = 0
    } else if (newX + rect.width > viewportWidth) {
      newX = viewportWidth - rect.width
    }

    if (newY < 0) {
      newY = y + VERTICAL_OFFSET
    }

    tooltip.style.transform = `translate3d(${newX}px, ${newY}px, 1px)`
  })

  const run = useRunState()

  return (
    <Portal>
      <div ref={setTooltipEl} class={tooltipClass} style={initialStyle}>
        <div class={tileClass}>
          <div class={miniTileClass}>
            <BasicTile card={props.card} material={props.material} />
          </div>
          <span>{cardName(props.card)}</span>
        </div>

        <dl class={detailListClass({ type: "bam" })}>
          <dt class={detailTermClass}>Points:</dt>
          <dd class={detailDescriptionClass}>
            {getRawPoints({ card: props.card, material: props.material, run })}
          </dd>
        </dl>
        <Show
          when={getRawMultiplier({
            card: props.card,
            material: props.material,
            run,
          })}
        >
          {(mult) => (
            <dl class={detailListClass({ type: "crack" })}>
              <dt class={detailTermClass}>Mult:</dt>
              <dd class={detailDescriptionClass}>{mult()}</dd>
            </dl>
          )}
        </Show>
        <MaterialFreedom material={props.material} />
        <Show when={getMaterialCoins(props.material)}>
          {(coins) => (
            <dl class={detailListClass({ type: "gold" })}>
              <dt class={detailTermClass}>{props.material} coins:</dt>{" "}
              <dd class={detailDescriptionClass}>{coins()}</dd>
            </dl>
          )}
        </Show>
        <Explanation card={props.card} />
      </div>
    </Portal>
  )
}

function MaterialFreedom(props: { material: Material }) {
  return (
    <div class={detailFreedomClass}>
      <span class={detailFreedomTitleClass}>Freedom</span>
      <Switch>
        <Match when={props.material === "glass"}>
          Glass tiles are free if at least 1 side is open.
        </Match>
        <Match when={props.material === "jade"}>
          Jade tiles are always free.
        </Match>
        <Match when={props.material === "bone"}>
          Bone tiles are free if left or right is open.
        </Match>
        <Match when={props.material === "bronze"}>
          Bronze tiles are free if at least 2 sides are open.
        </Match>
        <Match when={props.material === "gold"}>
          Gold tiles are free if at least 3 sides are open.
        </Match>
      </Switch>
    </div>
  )
}

function Explanation(props: { card: Card }) {
  return (
    <Switch>
      <Match when={isWind(props.card)}>
        <div class={detailInfoClass}>
          Wind tiles move the pieces in the direction of the wind.
        </div>
      </Match>
      <Match when={isDragon(props.card)}>
        <div class={detailInfoClass}>
          Dragon tiles start a "dragon run". Chain pairs of the dragon suit to
          increase the multiplier.
        </div>
      </Match>
    </Switch>
  )
}
