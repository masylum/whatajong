import { Button, LinkButton } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import { ArrowLeft, ArrowRight } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { captureEvent } from "@/lib/observability"
import { type Difficulty, useRunState } from "@/state/runState"
import { batch } from "solid-js"
import {
  backButtonClass,
  containerClass,
  contentClass,
  subtitleClass,
  subtitleContainerClass,
  tileClass,
  titleClass,
} from "./runIntro.css"

export default function RunIntro() {
  const run = useRunState()

  function onSelectMode(mode: Difficulty) {
    batch(() => {
      run.difficulty = mode
      run.stage = "game"
    })

    captureEvent("run_started", run)
  }

  return (
    <div class={containerClass}>
      <TutorialIntro onSelectMode={onSelectMode} />
    </div>
  )
}

function TutorialIntro(props: { onSelectMode: (mode: Difficulty) => void }) {
  const t = useTranslation()

  return (
    <div class={contentClass}>
      <div class={backButtonClass}>
        <LinkButton href="/" hue="dot">
          <ArrowLeft />
        </LinkButton>
      </div>
      <h1 class={titleClass}>{t.mode.title()}</h1>
      <div class={subtitleContainerClass}>
        <div class={subtitleClass({ hue: "bam" })}>
          <div class={tileClass({ stagger: 1 })}>
            <BasicTile cardId="b1" />
          </div>
          {t.intro.goal()}
        </div>
        <div class={subtitleClass({ hue: "crack" })}>
          <div class={tileClass({ stagger: 2 })}>
            <BasicTile cardId="c1" />
          </div>
          {t.intro.difficulty()}
        </div>
        <div class={subtitleClass({ hue: "dot" })}>
          <div class={tileClass({ stagger: 3 })}>
            <BasicTile cardId="o1" />
          </div>
          {t.intro.upgrade()}
        </div>
      </div>
      <Button hue="dot" onPointerDown={() => props.onSelectMode("easy")}>
        start first round
        <ArrowRight />
      </Button>
    </div>
  )
}
