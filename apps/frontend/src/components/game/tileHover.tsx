import {
  createEffect,
  createMemo,
  createSignal,
  Match,
  mergeProps,
  Show,
  Switch,
} from "solid-js"
import { Portal } from "solid-js/web"
import {
  tooltipClass,
  tileClass,
  detailTermClass,
  detailDescriptionClass,
  detailListClass,
  detailFreedomClass,
  detailInfoClass,
} from "./tileHover.css"
import type { Card, Material, Mutation } from "@/lib/game"
import {
  cardName,
  getMaterialCoins,
  getMutationRanks,
  getRank,
  getRawMultiplier,
  getRawPoints,
  isDragon,
  isFlower,
  isJoker,
  isMutation,
  isPhoenix,
  isRabbit,
  isSeason,
  isWind,
  suitName,
} from "@/lib/game"
import type { JSX } from "solid-js"
import { useRunState } from "@/state/runState"
import { BasicTile } from "./basicTile"
import { MiniTiles } from "../miniTiles"
import type { AccentHue } from "@/styles/colors"

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
        <BasicTile card={props.card} material={props.material} />
        <div class={tileClass}>
          <span>
            {cardName(props.card)}
            <Show when={props.material !== "bone"}>({props.material})</Show>
          </span>

          <CardPoints card={props.card} material={props.material} />
          <CardMultiplier card={props.card} material={props.material} />
          <MaterialFreedom material={props.material} />
          <MaterialCoins material={props.material} />
          <Explanation card={props.card} />
        </div>
      </div>
    </Portal>
  )
}

export function MaterialFreedom(iProps: {
  material: Material
  hue?: AccentHue
}) {
  const props = mergeProps({ hue: "bronze" as const }, iProps)

  return (
    <div class={detailFreedomClass({ hue: props.hue })}>
      <Switch>
        <Match when={props.material === "glass" || props.material === "wood"}>
          Free if at least 1 side is open.
        </Match>
        <Match when={props.material === "diamond"}>Always free.</Match>
        <Match
          when={
            props.material === "bone" ||
            props.material === "ivory" ||
            props.material === "bronze"
          }
        >
          Free if the left or right side is open.
        </Match>
        <Match when={props.material === "gold" || props.material === "jade"}>
          Free if at least 3 sides are open.
        </Match>
      </Switch>
    </div>
  )
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
          Matching Rabbit Tiles starts a <strong>Rabbit Run</strong>.
          <br />
          <br />
          Each pair of Rabbit Tiles you match in a row increases your
          multiplier, and when the run ends, you earn one coin for every point
          scored.
        </div>
      </Match>
      <Match when={isFlower(props.card)}>
        <div class={detailInfoClass}>
          Flower Tiles match with any other Flower Tile, no matter the numbers.
          <br />
          <br />
          When you match them, all tiles become wooden, which only needs one
          open side to match.
        </div>
      </Match>
      <Match when={isSeason(props.card)}>
        <div class={detailInfoClass}>
          Season Tiles match with any other Season Tile, no matter the numbers.
          <br />
          <br />
          When you match them, all tiles become wooden, which only needs one
          open side to match.
        </div>
      </Match>
      <Match when={isDragon(props.card)}>
        {(dragonCard) => (
          <div class={detailInfoClass}>
            Matching Dragon Tiles starts a <strong>Dragon Run</strong>, where
            you chain {suitName(getRank(dragonCard()))} (
            <MiniTiles suit={getRank(dragonCard())} />) tile pairs in a row to
            build your multiplier.
          </div>
        )}
      </Match>
      <Match when={isPhoenix(props.card)}>
        <div class={detailInfoClass}>
          Phoenix Tiles begin a <strong>Phoenix Run</strong>, where you match
          number pairs in a row starting with “1” to increase your multiplier.
        </div>
      </Match>
      <Match when={isMutation(props.card)}>
        {(mutationCard) => (
          <div class={detailInfoClass}>
            <Switch fallback={<MutationExplanation card={mutationCard()} />}>
              <Match when={getRank(props.card) === "4"}>
                Increase the number of all the bam/crack/dot cards on your
                board.
              </Match>
              <Match when={getRank(props.card) === "5"}>
                Decrease the number of all the bam/crack/dot cards on your
                board.
              </Match>
            </Switch>
          </div>
        )}
      </Match>
      <Match when={isJoker(props.card)}>
        <div class={detailInfoClass}>
          Matching Joker Tiles shuffles your board. They score 1 point per
          shuffled tile.
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

function MutationExplanation(props: { card: Mutation }) {
  const ranks = createMemo(() => getMutationRanks(props.card)!)
  const from = createMemo(() => ranks()[0]!)
  const to = createMemo(() => ranks()[1]!)

  return (
    <p>
      Swap all the {suitName(from())} (<MiniTiles suit={from()} />) and{" "}
      {suitName(to())} (
      <MiniTiles suit={to()} />) cards on your board.
    </p>
  )
}
