import { Button, LinkButton } from "@/components/button"
import { ArrowLeft } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { captureEvent } from "@/lib/observability"
import { type Difficulty, TUTORIAL_SEED, useRunState } from "@/state/runState"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import { Show, batch, createMemo } from "solid-js"
import {
  backButtonClass,
  buttonAnimationDelayVar,
  buttonClass,
  buttonContainerClass,
  buttonImageClass,
  buttonSmallTextClass,
  buttonTextClass,
  containerClass,
  subtitleClass,
  titleClass,
  titleContainerClass,
} from "./runMode.css"

export default function RunMode() {
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
      <div class={backButtonClass}>
        <LinkButton href="/" hue="dot" kind="dark">
          <ArrowLeft />
        </LinkButton>
      </div>
      <Show
        when={run.runId === TUTORIAL_SEED}
        fallback={<SelectDifficulty onSelectMode={onSelectMode} />}
      >
        <TutorialIntro onSelectMode={onSelectMode} />
      </Show>
    </div>
  )
}

function TutorialIntro(props: { onSelectMode: (mode: Difficulty) => void }) {
  const t = useTranslation()

  return (
    <>
      <div class={titleContainerClass}>
        <h1 class={titleClass}>{t.mode.title()}</h1>
      </div>
      <p class={subtitleClass}>
        TODO: Sail along the Yellow River, a major trade route in ancient China.
      </p>
      <p class={subtitleClass}>
        TODO: Solve a Mahjong Solitaire challenge at each of the 24 ports to
        c‌omplete your journey.
      </p>
      <Button kind="dark" hue="bam" onClick={() => props.onSelectMode("easy")}>
        TODO: start first challenge
      </Button>
    </>
  )
}

function SelectDifficulty(props: { onSelectMode: (mode: Difficulty) => void }) {
  const t = useTranslation()

  return (
    <>
      <div class={titleContainerClass}>
        <h1 class={titleClass}>{t.mode.title()}</h1>
        <h2 class={subtitleClass}>{t.mode.subtitle()}</h2>
      </div>
      <div class={buttonContainerClass({ size: "mode" })}>
        <ModeButton mode="easy" index={0} onClick={props.onSelectMode} />
        <ModeButton mode="medium" index={1} onClick={props.onSelectMode} />
        <ModeButton mode="hard" index={2} onClick={props.onSelectMode} />
      </div>
    </>
  )
}

function ModeButton(props: {
  mode: Difficulty
  index: number
  onClick: (mode: Difficulty) => void
}) {
  const t = useTranslation()
  const tMode = createMemo(() => t.mode[props.mode].tag())
  const text = createMemo(() => t.mode[props.mode].title())
  const hue = createMemo(() => {
    switch (props.mode) {
      case "easy":
        return "bam"
      case "medium":
        return "dot"
      case "hard":
        return "crack"
    }
  })

  return (
    <button
      type="button"
      class={buttonClass({ hue: hue() })}
      style={{
        ...assignInlineVars({
          [buttonAnimationDelayVar]: `${100 + props.index * 100}ms`,
        }),
      }}
    >
      <img
        srcset={`/difficulty/m/${props.mode}.webp 300w, /difficulty/l/${props.mode}.webp 514w`}
        sizes="(min-width: 1024px) 514px, 300px"
        src={`/difficulty/m/${props.mode}.webp`}
        alt={tMode()}
        class={buttonImageClass}
        onClick={() => props.onClick(props.mode)}
      />
      <div class={buttonTextClass}>
        {text()}
        <span class={buttonSmallTextClass}>({tMode()})</span>
      </div>
    </button>
  )
}
