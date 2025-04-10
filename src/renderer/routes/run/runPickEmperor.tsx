import { LinkButton } from "@/components/button"
import { BasicEmperor } from "@/components/emperor"
import { ArrowLeft } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { suitName } from "@/lib/game"
import { captureEvent } from "@/lib/observability"
import { pickFromArray } from "@/lib/rand"
import {
  EMPERORS,
  type Emperor,
  EmperorDescription,
  EmperorTitle,
} from "@/state/emperors"
import { useRunState } from "@/state/runState"
import { generateEmperorItem } from "@/state/shopState"
import type { AccentHue } from "@/styles/colors"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import Rand from "rand-seed"
import { For, createMemo } from "solid-js"
import {
  backButtonClass,
  buttonAnimationDelayVar,
  buttonClass,
  buttonContainerClass,
  buttonDescriptionTextClass,
  buttonImageClass,
  buttonTextClass,
  containerClass,
  titleClass,
  titleContainerClass,
} from "./runPickEmperor.css"

export function RunPickEmperor() {
  const t = useTranslation()
  const run = useRunState()
  const emperors = createMemo(() => {
    const rng = new Rand(`emperors-choice-${run.runId}`)
    const candidates = EMPERORS.filter((emperor) => emperor.level === 1)
    const first = pickFromArray(
      candidates.filter(
        (emperor) => emperor.type === "discard" && emperor.suit,
      ),
      rng,
    )!
    const second = pickFromArray(
      candidates.filter(
        (emperor) => emperor.type === "tile" && emperor.suit !== first.suit,
      ),
      rng,
    )!
    const third = pickFromArray(
      candidates.filter(
        (emperor) =>
          emperor.type === "tile" &&
          emperor.suit !== first.suit &&
          emperor.suit !== second.suit,
      ),
      rng,
    )!

    return [third, second, first]
  })

  function onSelectEmperor(emperor: Emperor) {
    run.items = [generateEmperorItem(emperor)]
    captureEvent("picked_emperor", run)
  }

  return (
    <div class={containerClass}>
      <div class={backButtonClass}>
        <LinkButton href="/" hue="dot" kind="dark">
          <ArrowLeft />
        </LinkButton>
      </div>
      <div class={titleContainerClass}>
        <h1 class={titleClass}>{t.pickEmperor.title()}</h1>
      </div>
      <div class={buttonContainerClass}>
        <For each={emperors()}>
          {(emperor, index) => (
            <button
              type="button"
              class={buttonClass({
                hue: suitName(emperor.suit!) as AccentHue,
              })}
              style={{
                ...assignInlineVars({
                  [buttonAnimationDelayVar]: `${100 + index() * 100}ms`,
                }),
              }}
              onClick={() => onSelectEmperor(emperor)}
            >
              <BasicEmperor name={emperor.name} class={buttonImageClass} />
              <div class={buttonTextClass}>
                <EmperorTitle name={emperor.name} />
                <div class={buttonDescriptionTextClass}>
                  <EmperorDescription name={emperor.name} />
                </div>
              </div>
            </button>
          )}
        </For>
      </div>
    </div>
  )
}
