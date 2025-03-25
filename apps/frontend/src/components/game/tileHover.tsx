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
  getMaterialCoins,
  getRank,
  getRawMultiplier,
  getRawPoints,
  isDragon,
  isFlower,
  isPhoenix,
  isRabbit,
  isSeason,
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

    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    if (newX < 0) {
      newX = 0
    } else if (newX + rect.width > viewportWidth) {
      newX = viewportWidth - rect.width
    }

    if (newY < 0) {
      newY = y + VERTICAL_OFFSET
    } else if (newY + rect.height > viewportHeight) {
      newY = viewportHeight - rect.height
    }

    tooltip.style.transform = `translate3d(${newX}px, ${newY}px, 1px)`
  })

  return (
    <Portal>
      <div ref={setTooltipEl} class={tooltipClass} style={initialStyle}>
        <div class={tileClass}>
          <div class={miniTileClass}>
            <BasicTile card={props.card} material={props.material} />
          </div>
          <span>{cardName(props.card)}</span>
        </div>

        <CardPoints card={props.card} material={props.material} />
        <CardMultiplier card={props.card} material={props.material} />
        <MaterialFreedom material={props.material} />
        <MaterialCoins material={props.material} />
        <Explanation card={props.card} />
      </div>
    </Portal>
  )
}

export function MaterialFreedom(props: { material: Material }) {
  return (
    <div class={detailFreedomClass}>
      <span class={detailFreedomTitleClass}>Freedom</span>
      <Switch>
        <Match when={props.material === "glass"}>
          These tiles can be selected if at least 1 side is open.
        </Match>
        <Match when={props.material === "jade"}>
          These tiles can always be selected.
        </Match>
        <Match when={props.material === "bone"}>
          These tiles can be selected if the left or right side is open.
        </Match>
        <Match when={props.material === "bronze"}>
          These tiles can be selected if the left or right side is open.
        </Match>
        <Match when={props.material === "gold"}>
          These tiles can be selected if at least 3 sides are open.
        </Match>
      </Switch>
    </div>
  )
}

function getDragonTiles(card: Card) {
  switch (getRank(card)) {
    case "c":
      return cracks
    case "b":
      return bams
    case "o":
      return dots
  }
}

export function Explanation(props: { card: Card }) {
  return (
    <Switch>
      <Match when={isWind(props.card)}>
        <div class={detailInfoClass}>
          Wind tiles move the pieces in the direction of the wind.
        </div>
      </Match>
      <Match when={isRabbit(props.card)}>
        <div class={detailInfoClass}>
          Rabbit tiles start a <strong>rabbit run</strong>: Chain consecutive
          pairs of rabbits to increase the multiplier.
          <br />
          <br />
          When the rabbit run ends, you will earn one coin per point scored.
        </div>
      </Match>
      <Match when={isFlower(props.card)}>
        <div class={detailInfoClass}>
          Flower tiles can be matched with other flower tiles even if their
          numbers don't match.
          <br />
          <br />
          When matching flower tiles, it converts all tiles to{" "}
          <strong>wood</strong>. Wood tiles can be matched if at least 1 side is
          open.
        </div>
      </Match>
      <Match when={isSeason(props.card)}>
        <div class={detailInfoClass}>
          Season tiles can be matched with other season tiles even if their
          numbers don't match.
          <br />
          <br />
          When matching season tiles, it converts all tiles to{" "}
          <strong>wood</strong>. Wood tiles can be matched if at least 1 side is
          open.
        </div>
      </Match>
      <Match when={isDragon(props.card)}>
        {(dragonCard) => (
          <div class={detailInfoClass}>
            Dragon tiles start a <strong>dragon run</strong>.
            <br />
            <br />
            Chain pairs of "{suitName(getRank(dragonCard()))}" tiles (
            <For each={getDragonTiles(dragonCard())}>
              {(card) => <MiniTile card={card} />}
            </For>
            ) to increase the multiplier.
          </div>
        )}
      </Match>
      <Match when={isPhoenix(props.card)}>
        <div class={detailInfoClass}>
          Phoenix tiles start a <strong>phoenix run</strong>
          <br />
          <br />
          Chain consecutive pairs of numbers, starting from the "1" to increase
          the multiplier.
        </div>
      </Match>
    </Switch>
  )
}

export function MaterialCoins(props: { material: Material }) {
  return (
    <Show when={getMaterialCoins(props.material)}>
      {(coins) => (
        <dl class={detailListClass({ type: "gold" })}>
          <dt class={detailTermClass}>{props.material} coins:</dt>{" "}
          <dd class={detailDescriptionClass}>{coins()}</dd>
        </dl>
      )}
    </Show>
  )
}

export function CardMultiplier(props: { material: Material; card: Card }) {
  const run = useRunState()

  return (
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
  )
}

export function CardPoints(props: { card: Card; material: Material }) {
  const run = useRunState()

  return (
    <dl class={detailListClass({ type: "bam" })}>
      <dt class={detailTermClass}>Points:</dt>
      <dd class={detailDescriptionClass}>
        {getRawPoints({ card: props.card, material: props.material, run }) * 2}
      </dd>
    </dl>
  )
}
