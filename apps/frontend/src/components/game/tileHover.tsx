import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js"
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
  bams,
  cardName,
  cracks,
  dots,
  DRAGON_SUIT,
  getMaterialCoins,
  getRank,
  getRawMultiplier,
  getRawPoints,
  isDragon,
  isWind,
  suitName,
} from "@/lib/game"
import type { JSX } from "solid-js"
import { useRunState } from "@/state/runState"
import { BasicTile } from "./basicTile"
import { MiniTile } from "../miniTile"

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
            {getRawPoints({ card: props.card, material: props.material, run }) *
              2}
          </dd>
        </dl>
        <Show
          when={
            getRawMultiplier({
              card: props.card,
              material: props.material,
              run,
            }) * 2
          }
        >
          {(mult) => (
            <dl class={detailListClass({ type: "crack" })}>
              <dt class={detailTermClass}>Mult:</dt>
              <dd class={detailDescriptionClass}>{mult()}</dd>
            </dl>
          )}
        </Show>
        <MaterialFreedom material={props.material} />
        <Show when={getMaterialCoins(props.material) * 2}>
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
          This tiles can be selected if at least 1 side is open.
        </Match>
        <Match when={props.material === "jade"}>
          This tiles can always be selected.
        </Match>
        <Match when={props.material === "bone"}>
          This tiles can be selected if the left or right side is open.
        </Match>
        <Match when={props.material === "bronze"}>
          This tiles can be selected if the left or right side is open.
        </Match>
        <Match when={props.material === "gold"}>
          This tiles can be selected if at least 3 sides are open.
        </Match>
      </Switch>
    </div>
  )
}

function getDragonTiles(card: Card) {
  switch (getRank(card)) {
    case "c":
      return cracks
    case "f":
      return bams
    case "p":
      return dots
  }
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
        {(dragonCard) => (
          <div class={detailInfoClass}>
            Dragon tiles start a "dragon run".
            <br />
            <br />
            Chain consecutive pairs of "
            {suitName(DRAGON_SUIT[getRank(dragonCard())])}" tiles (
            <For each={getDragonTiles(dragonCard())}>
              {(card) => <MiniTile card={card} />}
            </For>
            ) to increase the multiplier.
          </div>
        )}
      </Match>
    </Switch>
  )
}
