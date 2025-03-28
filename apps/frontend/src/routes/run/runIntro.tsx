import { createMemo, For, Match, Switch } from "solid-js"
import {
  backButtonClass,
  buttonClass,
  buttonContainerClass,
  buttonDescriptionTextClass,
  buttonImageClass,
  buttonSmallTextClass,
  buttonTextClass,
  CHOICE_EMPEROR_WIDTH,
  containerClass,
  floatingExplanationClass,
  subtitleClass,
  suitExplanationClass,
  suitExplanationItemClass,
  suitExplanationTilesClass,
  suitExplanationTitleClass,
  titleClass,
  titleContainerClass,
} from "./runIntro.css"
import { useRunState, type Difficulty } from "@/state/runState"
import { pickFromArray } from "@/lib/rand"
import { generateEmperorItem } from "@/state/shopState"
import Rand from "rand-seed"
import { getEmperors, type Emperor } from "@/state/emperors"
import { color, type AccentHue } from "@/styles/colors"
import { suitName, type Suit, type Card } from "@/lib/game"
import { EMPEROR_HEIGHT, EMPEROR_WIDTH } from "@/components/emperor.css"
import { BasicTile } from "@/components/game/basicTile"
import { ArrowLeft } from "@/components/icon"
import { LinkButton } from "@/components/button"

const TILE_WIDTH = 25

export default function RunIntro() {
  const run = useRunState()
  const hasDifficulty = createMemo(() => run.difficulty !== undefined)
  const hasEmperor = createMemo(() => run.items.length > 0)

  function onSelectMode(mode: Difficulty) {
    run.difficulty = mode
  }

  return (
    <div class={containerClass}>
      <div class={backButtonClass}>
        <LinkButton href="/" hue="dot" kind="dark">
          <ArrowLeft />
        </LinkButton>
      </div>
      <Switch>
        <Match when={!hasDifficulty()}>
          <SelectDifficulty onSelectMode={onSelectMode} />
        </Match>
        <Match when={!hasEmperor()}>
          <SelectEmperor />
        </Match>
      </Switch>
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
        src={`/difficulty/${props.mode}.webp`}
        alt={props.mode}
        width="280"
        height="420"
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

function SelectEmperor() {
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
    run.stage = "game"
  }

  return (
    <>
      <div class={titleContainerClass}>
        <h1 class={titleClass}>Pick your first crew member</h1>
      </div>
      <div class={buttonContainerClass({ size: "emperor" })}>
        <div class={floatingExplanationClass}>
          Your deck contains tiles of three suits:
          <div class={suitExplanationClass}>
            <SuitExplanation suit="b" />
            <SuitExplanation suit="c" />
            <SuitExplanation suit="o" />
          </div>
          Some crew members help you improve those suits.
          <svg
            width="179"
            height="41"
            viewBox="0 0 179 41"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M58.316 25.519c16.816 0 33.402-1.441 50.159-2.238 8.956-.426 17.936-.965 26.916-1.025 4.532-.03 9.057.156 13.582-.129 3.732-.234 9.988.918 13.202-.644-4.125-2.263-8.953-4.398-13.293-6.315-7.338-3.241.697-2.766 4.364-1.338 5.197 2.024 10.108 4.226 15.61 5.307 2.456.482 10.6.285 10.124 4.216-.357 2.946-9.049 7.071-11.399 8.649-3.628 2.435-8.556 7.853-12.826 8.82-5.762 1.304 1.408-4.936 2.727-6.062 3.437-2.934 8.445-6.463 11.206-10.002-2.856-.834-7.622.17-10.61.328-5.041.266-10.09.695-15.127.887-8.129.31-16.229.902-24.351 1.597-17.721 1.518-35.612 2.991-53.394 3.15-16.505.149-33.999.77-50.023-3.806C9.34 25.244-3.04 21.322.687 12.725 3.867 5.39 15.96 3.5 22.709 2.236 31.379.613 40.399.153 49.27 0c1.778-.03 25.561 1.487 24.625 4.276-.407 1.211-10.627-.68-12.112-.83-6.177-.625-12.493.088-18.656.371-10.99.505-26.022 1.138-35.384 7.814-10.232 7.297 10.799 11.276 15.505 11.951 11.62 1.667 23.303 1.937 35.067 1.937"
              fill={color.dot50}
            />
          </svg>
        </div>
        <For each={emperors()}>
          {(emperor) => (
            <button
              type="button"
              class={buttonClass({
                hue: suitName(emperor.suit!) as AccentHue,
              })}
              onClick={() => onSelectEmperor(emperor)}
            >
              <img
                src={`/occupations/${emperor.name}.webp`}
                alt={emperor.name}
                width={CHOICE_EMPEROR_WIDTH}
                height={(CHOICE_EMPEROR_WIDTH * EMPEROR_HEIGHT) / EMPEROR_WIDTH}
              />
              <div class={buttonTextClass}>
                {emperor.name.replaceAll("_", " ")}
                <div class={buttonDescriptionTextClass}>
                  {emperor.description}
                </div>
              </div>
            </button>
          )}
        </For>
        <div class={floatingExplanationClass}>
          You can discard crew members during a game to shuffle the board.
          <br />
          <br />
          Some crew members do special things when discarded.
          <svg
            width="96"
            height="92"
            viewBox="0 0 96 92"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M86.907 0c5.33 7.288 7.551 15.83 8.66 24.639 1.342 10.652-.534 20.928-4.32 30.97-3.743 9.928-10.414 16.561-20.153 20.298C55.892 81.74 40.47 82.56 24.77 78.285c-2.556-.696-5.138-1.297-7.714-1.917-.163-.04-.377.137-1.055.408l9.874 14.163L25.03 92c-1.025-.145-2.466.1-3.012-.496-7.087-7.72-14.13-15.485-20.983-23.416-1.85-2.141-1.147-4.076 1.509-5.455 1.438-.748 3.138-.975 4.587-1.708 2.712-1.372 5.31-2.974 7.988-4.419 2.442-1.318 4.927-2.555 7.71-3.992.085 4.301-.7 5.335-9.373 13.011 1.368.656 2.483 1.325 3.682 1.746 13.69 4.807 27.563 7.486 42.109 4.421 19.019-4.007 25.79-9.647 31.294-31.527 3.092-12.291.712-24.187-3.346-35.859-.45-1.295-.998-2.556-1.5-3.832z"
              fill={color.dot50}
            />
          </svg>
        </div>
      </div>
    </>
  )
}

function SuitExplanation(props: { suit: Suit }) {
  return (
    <div class={suitExplanationItemClass}>
      <h3
        class={suitExplanationTitleClass({ hue: suitName(props.suit) as any })}
      >
        {suitName(props.suit)}
      </h3>
      <div class={suitExplanationTilesClass}>
        <BasicTile
          width={TILE_WIDTH}
          card={`${props.suit}1` as Card}
          style={{ transform: "rotate(5deg)" }}
        />
        <BasicTile
          width={TILE_WIDTH}
          card={`${props.suit}5` as Card}
          style={{ transform: "rotate(-10deg)" }}
        />
        <BasicTile
          width={TILE_WIDTH}
          card={`${props.suit}9` as Card}
          style={{ transform: "rotate(7deg)" }}
        />
      </div>
    </div>
  )
}
