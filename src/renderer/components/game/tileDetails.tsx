import { useTranslation } from "@/i18n/useTranslation"
import type { Material } from "@/lib/game"
import { getMaterialCoins, getMaterialPoints } from "@/lib/game"
import { Match, Switch } from "solid-js"

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
