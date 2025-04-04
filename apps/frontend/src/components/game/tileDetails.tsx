import { createMemo, Match, mergeProps, Show, Switch } from "solid-js"
import {
  detailTermClass,
  detailDescriptionClass,
  detailListClass,
  detailFreedomClass,
  detailInfoClass,
} from "./tileDetails.css"
import type { Card, Material, Mutation } from "@/lib/game"
import {
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
import { useRunState } from "@/state/runState"
import { MiniTiles } from "../miniTiles"
import type { AccentHue } from "@/styles/colors"

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
          Clearing Rabbit Tiles starts a <strong>Rabbit Run</strong>.
          <br />
          <br />
          Each pair of Rabbit Tiles (<MiniTiles suit="r" />) you clear in a row
          increases your multiplier, and when the run ends, you earn one coin
          for every point scored.
        </div>
      </Match>
      <Match when={isFlower(props.card)}>
        <div class={detailInfoClass}>
          Flower tiles can be cleared with other Flower tiles, regardless of
          their numbers.
          <br />
          <br />
          Clearing Flowers makes it easier to clear tiles on the next turn.
        </div>
      </Match>
      <Match when={isSeason(props.card)}>
        <div class={detailInfoClass}>
          Season tiles can be cleared with other Season tiles, regardless of
          their numbers.
          <br />
          <br />
          Clearing Seasons makes it easier to clear tiles on the next turn.
        </div>
      </Match>
      <Match when={isDragon(props.card)}>
        {(dragonCard) => (
          <div class={detailInfoClass}>
            Clearing Dragon Tiles starts a <strong>Dragon Run</strong>.
            <br />
            <br />
            Clear {suitName(getRank(dragonCard()))} (
            <MiniTiles suit={getRank(dragonCard())} />) tiles to get a
            multiplier bonus.
          </div>
        )}
      </Match>
      <Match when={isPhoenix(props.card)}>
        <div class={detailInfoClass}>
          Clearing Phoenix Tiles starts a <strong>Phoenix Run</strong>
          <br />
          <br />
          Clear tiles in consecutive number order (1, 2, 3...) to get a
          multiplier bonus.
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
          Clearing Joker Tiles shuffles your board.
          <br />
          <br />
          Score 1 point per shuffled tile.
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
