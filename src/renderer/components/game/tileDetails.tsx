import { useTranslation } from "@/i18n/useTranslation"
import type { CardId, Material, Suit } from "@/lib/game"
import {
  getMaterialCoins,
  getRawPoints,
  isDragon,
  isElement,
  isFlower,
  isJoker,
  isMutation,
  isPhoenix,
  isRabbit,
  isTrigram,
  isWind,
} from "@/lib/game"
import type { AccentHue } from "@/styles/colors"
import { Match, Show, Switch, mergeProps } from "solid-js"
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
  const props = mergeProps({ hue: "bone" as const }, iProps)
  const t = useTranslation()

  return (
    <Show when={props.material === "quartz" || props.material === "obsidian"}>
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
          <p innerHTML={t.tileDetails.explanation.rabbit()} />
        </div>
      </Match>
      <Match when={isFlower(props.cardId)}>
        <div class={detailInfoClass}>
          <p innerHTML={t.tileDetails.explanation.flower()} />
        </div>
      </Match>
      <Match when={isDragon(props.cardId)}>
        <div class={detailInfoClass}>
          <p innerHTML={t.tileDetails.explanation.dragon()} />
        </div>
      </Match>
      <Match when={isPhoenix(props.cardId)}>
        <div class={detailInfoClass}>
          <p innerHTML={t.tileDetails.explanation.phoenix()} />
        </div>
      </Match>
      <Match when={isMutation(props.cardId)}>
        <div class={detailInfoClass}>
          <p innerHTML={t.tileDetails.explanation.mutation()} />
        </div>
      </Match>
      <Match when={isJoker(props.cardId)}>
        <div class={detailInfoClass}>
          <p innerHTML={t.tileDetails.explanation.joker()} />
        </div>
      </Match>
      <Match when={isElement(props.cardId)}>
        <div class={detailInfoClass}>
          <p innerHTML={t.tileDetails.explanation.element()} />
        </div>
      </Match>
      <Match when={isTrigram(props.cardId)}>
        <div class={detailInfoClass}>
          <p innerHTML={t.tileDetails.explanation.trigram()} />
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

const NO_VIDEO = ["o", "b", "c"]
export function CardVideo(props: { suit: Suit; class: string }) {
  if (NO_VIDEO.includes(props.suit)) {
    return null
  }

  return (
    <video
      src={`/videos/${props.suit}.mp4`}
      autoplay
      muted
      loop
      playsinline
      width="100%"
      class={props.class}
    />
  )
}
