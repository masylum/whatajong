import { useTranslation } from "@/i18n/useTranslation"
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
import type { AccentHue } from "@/styles/colors"
import { Match, Show, Switch, createMemo, mergeProps } from "solid-js"
import { Description } from "../description"
import {
  detailDescriptionClass,
  detailFreedomClass,
  detailInfoClass,
  detailListClass,
  detailTermClass,
} from "./tileDetails.css"

export function MaterialFreedom(iProps: {
  material: Material
  hue?: AccentHue
}) {
  const props = mergeProps({ hue: "bronze" as const }, iProps)
  const t = useTranslation()

  return (
    <div class={detailFreedomClass({ hue: props.hue })}>
      <Switch>
        <Match when={props.material === "glass" || props.material === "wood"}>
          {t.tileDetails.freedom.relaxed()}
        </Match>
        <Match when={props.material === "diamond"}>
          {t.tileDetails.freedom.diamond()}
        </Match>
        <Match
          when={
            props.material === "bone" ||
            props.material === "ivory" ||
            props.material === "bronze"
          }
        >
          {t.tileDetails.freedom.standard()}
        </Match>
        <Match when={props.material === "gold" || props.material === "jade"}>
          {t.tileDetails.freedom.gold()}
        </Match>
      </Switch>
    </div>
  )
}

export function Explanation(props: { card: Card }) {
  const t = useTranslation()

  return (
    <Switch>
      <Match when={isWind(props.card)}>
        <div class={detailInfoClass}>
          <p>{t.tileDetails.explanation.wind()}</p>
        </div>
      </Match>
      <Match when={isRabbit(props.card)}>
        <div class={detailInfoClass}>
          <p innerHTML={t.tileDetails.explanation.rabbit1()} />
          <p>
            <Description str={t.tileDetails.explanation.rabbit2()} />
          </p>
        </div>
      </Match>
      <Match when={isFlower(props.card)}>
        <div class={detailInfoClass}>
          <p>{t.tileDetails.explanation.flower1()}</p>
          <p>{t.tileDetails.explanation.flower2()}</p>
        </div>
      </Match>
      <Match when={isSeason(props.card)}>
        <div class={detailInfoClass}>
          <p>{t.tileDetails.explanation.season1()}</p>
          <p>{t.tileDetails.explanation.season2()}</p>
        </div>
      </Match>
      <Match when={isDragon(props.card)}>
        {(dragonCard) => (
          <div class={detailInfoClass}>
            <p innerHTML={t.tileDetails.explanation.dragon1()} />
            <p>
              <Description
                str={t.tileDetails.explanation.dragon2({
                  suitName: t.suit[getRank(dragonCard())](),
                  suit: getRank(dragonCard()),
                })}
              />
            </p>
          </div>
        )}
      </Match>
      <Match when={isPhoenix(props.card)}>
        <div class={detailInfoClass}>
          <p innerHTML={t.tileDetails.explanation.phoenix1()} />
          <p>{t.tileDetails.explanation.phoenix2()}</p>
        </div>
      </Match>
      <Match when={isMutation(props.card)}>
        {(mutationCard) => (
          <div class={detailInfoClass}>
            <Switch fallback={<MutationExplanation card={mutationCard()} />}>
              <Match when={getRank(props.card) === "4"}>
                <p>{t.tileDetails.explanation.mutation1()}</p>
              </Match>
              <Match when={getRank(props.card) === "5"}>
                <p>{t.tileDetails.explanation.mutation2()}</p>
              </Match>
            </Switch>
          </div>
        )}
      </Match>
      <Match when={isJoker(props.card)}>
        <div class={detailInfoClass}>
          <p>{t.tileDetails.explanation.joker1()}</p>
          <p>{t.tileDetails.explanation.joker2()}</p>
        </div>
      </Match>
    </Switch>
  )
}

export function MaterialCoins(props: { material: Material }) {
  const t = useTranslation()

  return (
    <Show when={getMaterialCoins(props.material)}>
      {(coins) => (
        <dl class={detailListClass({ type: "gold" })}>
          <dt class={detailTermClass}>{t.common.coins()}:</dt>
          <dd class={detailDescriptionClass}>{coins()}</dd>
        </dl>
      )}
    </Show>
  )
}

export function CardMultiplier(props: { material: Material; card: Card }) {
  const run = useRunState()
  const t = useTranslation()

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
          <dt class={detailTermClass}>{t.common.multiplier()}:</dt>
          <dd class={detailDescriptionClass}>{mult()}</dd>
        </dl>
      )}
    </Show>
  )
}

export function CardPoints(props: { card: Card; material: Material }) {
  const run = useRunState()
  const t = useTranslation()

  return (
    <dl class={detailListClass({ type: "bam" })}>
      <dt class={detailTermClass}>{t.common.points()}:</dt>
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
  const t = useTranslation()

  return (
    <p>
      <Description
        str={t.tileDetails.explanation.mutation3({
          fromSuitName: suitName(from()),
          fromSuit: from(),
          toSuitName: suitName(to()),
          toSuit: to(),
        })}
      />
    </p>
  )
}
