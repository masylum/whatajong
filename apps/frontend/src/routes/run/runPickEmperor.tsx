import { createMemo, For } from "solid-js"
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
import { useRunState } from "@/state/runState"
import { pickFromArray } from "@/lib/rand"
import { generateEmperorItem } from "@/state/shopState"
import Rand from "rand-seed"
import { emperorName, getEmperors, type Emperor } from "@/state/emperors"
import type { AccentHue } from "@/styles/colors"
import { suitName } from "@/lib/game"
import { ArrowLeft } from "@/components/icon"
import { LinkButton } from "@/components/button"
import { captureEvent } from "@/lib/observability"
import { assignInlineVars } from "@vanilla-extract/dynamic"

export function RunPickEmperor() {
  const run = useRunState()
  const emperors = createMemo(() => {
    const rng = new Rand(`emperors-choice-${run.runId}`)
    const candidates = getEmperors().filter((emperor) => emperor.level === 1)
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
        <h1 class={titleClass}>Pick your first crew member</h1>
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
              <img
                srcset={`/occupations/m/${emperor.name}.webp 300w, /occupations/l/${emperor.name}.webp 514w`}
                sizes="(min-width: 1024px) 514px, 300px"
                src={`/occupations/m/${emperor.name}.webp`}
                class={buttonImageClass}
                alt={emperor.name}
              />
              <div class={buttonTextClass}>
                {emperorName(emperor.name)}
                <div class={buttonDescriptionTextClass}>
                  {emperor.description()}
                </div>
              </div>
            </button>
          )}
        </For>
      </div>
    </div>
  )
}
