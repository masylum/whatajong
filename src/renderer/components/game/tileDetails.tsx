import { useTranslation } from "@/i18n/useTranslation"
import type { CardId, Material } from "@/lib/game"
import {
  getMaterialCoins,
  getRawPoints,
  isDragon,
  isFlower,
  isJoker,
  isMutation,
  isPhoenix,
  isRabbit,
  isWind,
} from "@/lib/game"
import type { AccentHue } from "@/styles/colors"
import { Match, Show, Switch, mergeProps } from "solid-js"
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
    <Show when={props.material === "glass" || props.material === "diamond"}>
      <div class={detailFreedomClass({ hue: props.hue })}>
        {t.tileDetails.freedom.relaxed()}
      </div>
    </Show>
  )
}

export function Explanation(props: { cardId: CardId }) {
  const t = useTranslation()

  return (
    <Switch>
      <Match when={isWind(props.cardId)}>
        <div class={detailInfoClass}>
          <p>{t.tileDetails.explanation.wind()}</p>
        </div>
      </Match>
      <Match when={isRabbit(props.cardId)}>
        <div class={detailInfoClass}>
          <p>
            <Description str={t.tileDetails.explanation.rabbit1()} />
          </p>
        </div>
      </Match>
      <Match when={isFlower(props.cardId)}>
        <div class={detailInfoClass}>
          <p>{t.tileDetails.explanation.flower1()}</p>
          <p>{t.tileDetails.explanation.flower2()}</p>
        </div>
      </Match>
      <Match when={isDragon(props.cardId)}>
        {(dragonCard) => (
          <div class={detailInfoClass}>
            <p innerHTML={t.tileDetails.explanation.dragon1()} />
            <p>
              <Description
                str={t.tileDetails.explanation.dragon2({
                  color: dragonCard().rank,
                })}
              />
            </p>
          </div>
        )}
      </Match>
      <Match when={isPhoenix(props.cardId)}>
        <div class={detailInfoClass}>
          <p innerHTML={t.tileDetails.explanation.phoenix1()} />
          <p>{t.tileDetails.explanation.phoenix2()}</p>
        </div>
      </Match>
      <Match when={isMutation(props.cardId)}>
        {(mutationCard) => (
          <div class={detailInfoClass}>
            <p>{t.tileDetails.explanation[mutationCard().id]()}</p>
          </div>
        )}
      </Match>
      <Match when={isJoker(props.cardId)}>
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

export function CardPoints(props: { cardId: CardId; material: Material }) {
  const t = useTranslation()

  return (
    <dl class={detailListClass({ type: "bam" })}>
      <dt class={detailTermClass}>{t.common.points()}:</dt>
      <dd class={detailDescriptionClass}>
        {getRawPoints({ cardId: props.cardId, material: props.material })}
      </dd>
    </dl>
  )
}
