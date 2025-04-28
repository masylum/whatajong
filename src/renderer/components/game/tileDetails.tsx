import { useTranslation } from "@/i18n/useTranslation"
import type { CardId, Material, Suit } from "@/lib/game"
import {
  getCard,
  getMaterialCoins,
  getMaterialPoints,
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
import { type AccentHue, hueFromMaterial } from "@/styles/colors"
import { Match, Show, Switch, createMemo, mergeProps } from "solid-js"
import {
  detailDescriptionClass,
  detailInfoClass,
  detailInfoTitleClass,
  detailListClass,
  detailTermClass,
} from "./tileDetails.css"

export function MaterialExplanation(iProps: {
  material: Material
  hue?: AccentHue
}) {
  const props = mergeProps({ hue: "bone" as const }, iProps)
  const t = useTranslation()
  const hue = createMemo(() => hueFromMaterial(props.material))

  return (
    <Show when={props.material !== "bone"}>
      <div class={detailInfoClass({ hue: hue() })}>
        <div class={detailInfoTitleClass({ hue: hue() })}>
          {t.material[props.material]()}
        </div>
        <MaterialExplanationDescription material={props.material} />
      </div>
    </Show>
  )
}

export function MaterialExplanationDescription(props: { material: Material }) {
  const t = useTranslation()

  return (
    <>
      <Switch>
        <Match
          when={props.material === "topaz" || props.material === "sapphire"}
        >
          <p>{t.tileDetails.materialExplanation.blue()}</p>
        </Match>
        <Match when={props.material === "garnet" || props.material === "ruby"}>
          <p>
            +{getMaterialCoins(props.material)} {t.common.coins()}
          </p>
        </Match>
        <Match
          when={props.material === "quartz" || props.material === "obsidian"}
        >
          <p>{t.tileDetails.materialExplanation.black()}</p>
        </Match>
      </Switch>
      <p>
        +{getMaterialPoints(props.material)} {t.common.points()}
      </p>
    </>
  )
}

export function Explanation(props: { cardId: CardId }) {
  const t = useTranslation()

  return (
    <Switch>
      <Match when={isWind(props.cardId)}>
        <div class={detailInfoClass({ hue: "bone" })}>
          <p>{t.tileDetails.explanation.wind()}</p>
        </div>
      </Match>
      <Match when={isRabbit(props.cardId)}>
        <div class={detailInfoClass({ hue: "bone" })}>
          <p innerHTML={t.tileDetails.explanation.rabbit()} />
        </div>
      </Match>
      <Match when={isFlower(props.cardId)}>
        <div class={detailInfoClass({ hue: "bone" })}>
          <p innerHTML={t.tileDetails.explanation.flower()} />
        </div>
      </Match>
      <Match when={isDragon(props.cardId)}>
        <div class={detailInfoClass({ hue: "bone" })}>
          <p innerHTML={t.tileDetails.explanation.dragon()} />
        </div>
      </Match>
      <Match when={isPhoenix(props.cardId)}>
        <div class={detailInfoClass({ hue: "bone" })}>
          <p innerHTML={t.tileDetails.explanation.phoenix()} />
        </div>
      </Match>
      <Match when={isMutation(props.cardId)}>
        <div class={detailInfoClass({ hue: "bone" })}>
          <p innerHTML={t.tileDetails.explanation.mutation()} />
        </div>
      </Match>
      <Match when={isJoker(props.cardId)}>
        <div class={detailInfoClass({ hue: "bone" })}>
          <p innerHTML={t.tileDetails.explanation.joker()} />
        </div>
      </Match>
      <Match when={isElement(props.cardId)}>
        <div class={detailInfoClass({ hue: "bone" })}>
          <p innerHTML={t.tileDetails.explanation.element()} />
        </div>
      </Match>
      <Match when={isTrigram(props.cardId)}>
        <div class={detailInfoClass({ hue: "bone" })}>
          <p innerHTML={t.tileDetails.explanation.trigram()} />
        </div>
      </Match>
    </Switch>
  )
}

export function CardPoints(props: { cardId: CardId; material: Material }) {
  const t = useTranslation()

  return (
    <dl class={detailListClass({ hue: "bone" })}>
      <dt class={detailTermClass}>{t.common.points()}:</dt>
      <dd class={detailDescriptionClass}>{getCard(props.cardId).points}</dd>
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
