import { batch, createMemo } from "solid-js"
import {
  backButtonClass,
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
import { useRunState, type Difficulty } from "@/state/runState"
import { ArrowLeft } from "@/components/icon"
import { LinkButton } from "@/components/button"
import { captureEvent } from "@/lib/observability"

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
      <div class={backButtonClass}>
        <LinkButton href="/" hue="dot" kind="dark">
          <ArrowLeft />
        </LinkButton>
      </div>
      <SelectDifficulty onSelectMode={onSelectMode} />
    </div>
  )
}

function SelectDifficulty(props: { onSelectMode: (mode: Difficulty) => void }) {
  return (
    <>
      <div class={titleContainerClass}>
        <h1 class={titleClass}>Welcome to the adventure!</h1>
        <h2 class={subtitleClass}>Select a difficulty mode</h2>
      </div>
      <div class={buttonContainerClass({ size: "mode" })}>
        <ModeButton
          mode="easy"
          text="Cruising Along"
          onClick={props.onSelectMode}
        />
        <ModeButton
          mode="medium"
          text="Turbulent Waters"
          onClick={props.onSelectMode}
        />
        <ModeButton
          mode="hard"
          text="Against the Maelstrom"
          onClick={props.onSelectMode}
        />
      </div>
    </>
  )
}

function ModeButton(props: {
  mode: Difficulty
  text: string
  onClick: (mode: Difficulty) => void
}) {
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
    <button type="button" class={buttonClass({ hue: hue() })}>
      <img
        srcset={`/difficulty/m/${props.mode}.webp 300w, /difficulty/l/${props.mode}.webp 514w`}
        sizes="(min-width: 1024px) 514px, 300px"
        src={`/difficulty/m/${props.mode}.webp`}
        alt={props.mode}
        class={buttonImageClass}
        onClick={() => props.onClick(props.mode)}
      />
      <div class={buttonTextClass}>
        {props.text}
        <span class={buttonSmallTextClass}>({props.mode})</span>
      </div>
    </button>
  )
}
