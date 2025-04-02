import {
  createSignal,
  Show,
  type ParentProps,
  Switch,
  Match,
  createMemo,
  type JSXElement,
  type Accessor,
} from "solid-js"
import {
  backButtonClass,
  buttonsClass,
  containerClass,
  descriptionClass,
  descriptionsClass,
  rowClass,
  rowsClass,
  dragonRunClass,
  cardRowsClass,
  cardRowClass,
  cardTitleClass,
  titleClass,
  whatajongClass,
} from "./gameTutorial.css"
import {
  suitName,
  type Suit,
  type Card,
  type Wind,
  getWindDirection,
} from "@/lib/game"
import { BasicTile } from "@/components/game/basicTile"
import { ArrowLeft, ArrowRight, Home, Play } from "@/components/icon"
import { Button, LinkButton } from "@/components/button"
import { useGlobalState } from "@/state/globalState"
import { getSideSize, useLayoutSize } from "@/state/constants"
import { comboRecipe } from "./game/powerups.css"
import { MovesIndicator, Penalty, Points } from "./game/stats"
import { boardClass } from "./game/stats.css"

const STEPS = ["basic", "basic", "dragons", "winds & flowers", "board"] as const
const RUN_STEPS = ["crew", "shop", "upgrade", "materials"] as const // TODO: phoenix, rabbits, mutations, jokers and boats

export function GameTutorial(props: ParentProps) {
  return (
    <Tutorial steps={STEPS} fallback={props.children}>
      {(step) => (
        <Switch>
          <Match when={step() === 0}>
            <Basic />
          </Match>
          <Match when={step() === 1}>
            <Basic2 />
          </Match>
          <Match when={step() === 2}>
            <Dragons />
          </Match>
          <Match when={step() === 3}>
            <WindsAndFlowers />
          </Match>
          <Match when={step() === 4}>
            <Board />
          </Match>
        </Switch>
      )}
    </Tutorial>
  )
}

export function RunTutorial(props: ParentProps) {
  return (
    <Tutorial steps={RUN_STEPS} fallback={props.children}>
      {(step) => (
        <Switch>
          <Match when={step() === 0}>
            <Basic />
          </Match>
          <Match when={step() === 1}>
            <Basic2 />
          </Match>
          <Match when={step() === 2}>
            <Dragons />
          </Match>
          <Match when={step() === 3}>
            <WindsAndFlowers />
          </Match>
          <Match when={step() === 4}>
            <Board />
          </Match>
        </Switch>
      )}
    </Tutorial>
  )
}

type TutorialProps<T> = {
  steps: T
  fallback: JSXElement
  children: (step: Accessor<number>) => JSXElement
}

function Tutorial<T extends readonly string[]>(props: TutorialProps<T>) {
  const globalState = useGlobalState()
  const step = createMemo(() => globalState.tutorial)
  const stage = createMemo(() => props.steps[step()]!)
  const [play, setPlay] = createSignal(step() >= props.steps.length - 1)
  const [upperBound] = createSignal(props.steps.lastIndexOf(stage() as any))

  function onSkip() {
    globalState.tutorial = upperBound() + 1
    setPlay(true)
  }

  function onNext() {
    if (step() === upperBound()) {
      onSkip()
      return
    }

    globalState.tutorial += 1
  }

  function onPrev() {
    globalState.tutorial -= 1
  }

  return (
    <Show when={!play()} fallback={props.fallback}>
      <div class={containerClass}>
        <div class={backButtonClass}>
          <LinkButton href="/" hue="dot" kind="dark">
            <Home />
          </LinkButton>
        </div>
        <div class={buttonsClass}>
          <Button
            hue="dot"
            kind="dark"
            onClick={onPrev}
            disabled={step() === 0}
          >
            <ArrowLeft />
            prev
          </Button>
          <Button
            disabled={step() === upperBound()}
            hue="dot"
            kind="dark"
            onClick={onNext}
          >
            next
            <ArrowRight />
          </Button>
          <Button hue="bam" kind="dark" onClick={onSkip}>
            <Play />
            play
          </Button>
        </div>
        <h1 class={titleClass}>Tutorial: {stage()}</h1>
        {props.children(step)}
      </div>
    </Show>
  )
}

function Basic() {
  const tileWidth = useTileSize()

  return (
    <div class={descriptionsClass}>
      <div class={descriptionClass}>
        <p>
          The goal of <span class={whatajongClass}>Whatajong</span> is to clear
          all the tiles from the board, scoring as many points as possible.
        </p>
      </div>
      <div class={descriptionClass}>
        Your deck contains tiles of three suits:
        <div class={cardRowsClass}>
          <SuitExplanation suit="b" />
          <SuitExplanation suit="c" />
          <SuitExplanation suit="o" />
        </div>
      </div>
      <div class={descriptionClass}>
        To clear tiles, you need to match a pair of identical tiles.
        <div class={cardRowClass}>
          <BasicTile
            width={tileWidth()}
            card="b8"
            style={{ transform: "rotate(-10deg)" }}
          />
          <BasicTile
            width={tileWidth()}
            card="b8"
            style={{ transform: "rotate(7deg)" }}
          />
        </div>
      </div>
    </div>
  )
}

function Basic2() {
  const tileWidth = useTileSize()
  const tileSide = createMemo(() => getSideSize(tileWidth()))

  return (
    <div class={descriptionsClass}>
      <div class={descriptionClass}>
        A tile can be selected if it has no other tile on top of it and has at
        least one free side (left or right).
      </div>
      <div class={descriptionClass}>
        Example of free tiles highlighted in green.
        <div class={rowsClass}>
          <div class={rowClass}>
            <BasicTile width={tileWidth()} card="o6" highlighted="bam" />
            <BasicTile width={tileWidth()} card="c2" />
            <BasicTile width={tileWidth()} card="c2" />
            <BasicTile width={tileWidth()} card="o6" highlighted="bam" />
          </div>
          <div class={rowClass}>
            <BasicTile width={tileWidth()} card="o1" highlighted="bam" />
            <BasicTile width={tileWidth()} card="b7" />
            <BasicTile width={tileWidth()} card="c8" />
            <BasicTile
              width={tileWidth()}
              card="o1"
              highlighted="bam"
              style={{
                "z-index": 2,
                transform: `
                    translate(
                        -${tileWidth() * 1.5 - tileSide()}px,
                        ${tileWidth() / 2 - tileSide()}px
                    )
                `,
              }}
            />
          </div>
          <div class={rowClass}>
            <BasicTile width={tileWidth()} card="b1" highlighted="bam" />
            <BasicTile width={tileWidth()} card="o3" />
            <BasicTile width={tileWidth()} card="o3" />
          </div>
        </div>
      </div>
      <div class={descriptionClass}>
        When matching a pair of tiles, you score points.
        <div class={cardRowClass}>
          <BasicTile
            width={tileWidth()}
            card="o1"
            style={{ transform: "rotate(-10deg)" }}
          />
          <BasicTile
            width={tileWidth()}
            card="o1"
            style={{ transform: "rotate(7deg)" }}
          />
        </div>
        <h3
          class={cardTitleClass({
            hue: suitName("o") as any,
          })}
        >
          2 points!
        </h3>
      </div>
    </div>
  )
}

function Dragons() {
  const tileWidth = useTileSize()

  return (
    <div class={descriptionsClass}>
      <div class={descriptionClass}>
        <p>There are 3 dragons, one for each suit.</p>
        <div class={cardRowsClass}>
          <DragonExplanation suit="b" />
          <DragonExplanation suit="c" />
          <DragonExplanation suit="o" />
        </div>
      </div>
      <div class={descriptionClass}>
        <p>
          Clear dragon tiles to start a <strong>Dragon Run</strong>.
        </p>
        <div class={dragonRunClass}>
          <BasicTile width={tileWidth()} card="db" />
          <span class={comboRecipe({ hue: "bam" })}>Dragon Run</span>
        </div>
        <p>
          Clearing tiles from another suit will break the{" "}
          <strong>Dragon Run</strong>.
        </p>
      </div>
      <div class={descriptionClass}>
        <p>
          When a <strong>Dragon Run</strong> is active, clearing tiles from the
          dragon's suit will multiply your score.
        </p>
        <div class={cardRowsClass}>
          <div class={cardRowClass}>
            <BasicTile
              width={tileWidth()}
              card="b8"
              style={{ transform: "rotate(5deg)" }}
            />
            <BasicTile
              width={tileWidth()}
              card="b8"
              style={{ transform: "rotate(-7deg)" }}
            />
            <span class={comboRecipe({ hue: "bam" })}>x1</span>
          </div>
          <div class={cardRowClass}>
            <BasicTile
              width={tileWidth()}
              card="b3"
              style={{ transform: "rotate(5deg)" }}
            />
            <BasicTile
              width={tileWidth()}
              card="b3"
              style={{ transform: "rotate(-7deg)" }}
            />
            <span class={comboRecipe({ hue: "bam" })}>x2</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function WindsAndFlowers() {
  const tileWidth = useTileSize()

  return (
    <div class={descriptionsClass}>
      <div class={descriptionClass}>
        <p>Winds move the tiles on the board towards a direction:</p>
        <div class={rowsClass}>
          <WindExplanation wind="ww" />
          <WindExplanation wind="we" />
          <WindExplanation wind="ws" />
          <WindExplanation wind="wn" />
        </div>
      </div>
      <div class={descriptionClass}>
        <p>
          Flowers & Seasons can be matched among them, even if their number is
          not the same.
        </p>
        <div class={rowsClass}>
          <div class={cardRowClass}>
            <BasicTile
              width={tileWidth()}
              card="f1"
              style={{ transform: "rotate(5deg)" }}
            />
            <BasicTile
              width={tileWidth()}
              card="f2"
              style={{ transform: "rotate(-7deg)" }}
            />
            <span class={comboRecipe({ hue: "bam" })}>yes</span>
          </div>
          <div class={cardRowClass}>
            <BasicTile
              width={tileWidth()}
              card="s1"
              style={{ transform: "rotate(5deg)" }}
            />
            <BasicTile
              width={tileWidth()}
              card="s2"
              style={{ transform: "rotate(-7deg)" }}
            />
            <span class={comboRecipe({ hue: "bam" })}>yes</span>
          </div>
          <div class={cardRowClass}>
            <BasicTile
              width={tileWidth()}
              card="s1"
              style={{ transform: "rotate(5deg)" }}
            />
            <BasicTile
              width={tileWidth()}
              card="f1"
              style={{ transform: "rotate(-7deg)" }}
            />
            <span class={comboRecipe({ hue: "crack" })}>no</span>
          </div>
        </div>
      </div>
      <div class={descriptionClass}>
        <p>
          Clearing Flowers or Seasons makes tiles more selectable for the next
          turn.
        </p>
        <div class={rowsClass}>
          <div class={rowClass}>
            <BasicTile width={tileWidth()} card="o6" highlighted="bam" />
            <BasicTile width={tileWidth()} card="c2" highlighted="bam" />
            <BasicTile width={tileWidth()} card="o6" highlighted="bam" />
          </div>
          <div class={rowClass}>
            <BasicTile width={tileWidth()} card="o1" highlighted="bam" />
            <BasicTile width={tileWidth()} card="b7" />
            <BasicTile width={tileWidth()} card="c8" highlighted="bam" />
          </div>
          <div class={rowClass}>
            <BasicTile width={tileWidth()} card="b1" highlighted="bam" />
            <BasicTile width={tileWidth()} card="o3" highlighted="bam" />
            <BasicTile width={tileWidth()} card="o3" highlighted="bam" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Board() {
  return (
    <div class={descriptionsClass}>
      <div class={descriptionClass}>
        <div class={boardClass}>
          <Points points={100} />
        </div>
        <p>
          The points indicator shows you how many points have you scored so far.
        </p>
      </div>
      <div class={descriptionClass}>
        <div class={boardClass}>
          <Penalty points={100} />
        </div>
        <p>
          The penalty indicator shows you how many points have you lost due to
          time passing by.
        </p>
      </div>
      <div class={descriptionClass}>
        <div class={boardClass}>
          <MovesIndicator urgency="moderate" pairs={2} />
        </div>
        <p>
          The moves indicator, shows you how many moves you have left. If it
          reaches to 0, the board is unsolvable and you have lost the game.
        </p>
      </div>
    </div>
  )
}

function SuitExplanation(props: { suit: Suit }) {
  const tileWidth = useTileSize()

  return (
    <div class={cardRowClass}>
      <h3 class={cardTitleClass({ hue: suitName(props.suit) as any })}>
        {suitName(props.suit)}
      </h3>
      <BasicTile
        width={tileWidth()}
        card={`${props.suit}1` as Card}
        style={{ transform: "rotate(5deg)" }}
      />
      <BasicTile
        width={tileWidth()}
        card={`${props.suit}5` as Card}
        style={{ transform: "rotate(-10deg)" }}
      />
      <BasicTile
        width={tileWidth()}
        card={`${props.suit}9` as Card}
        style={{ transform: "rotate(7deg)" }}
      />
    </div>
  )
}

function DragonExplanation(props: { suit: Suit }) {
  const tileWidth = useTileSize()

  return (
    <div class={cardRowClass}>
      <BasicTile width={tileWidth()} card={`d${props.suit}` as Card} />
      <h3 class={cardTitleClass({ hue: suitName(props.suit) as any })}>
        {suitName(props.suit)} Dragon
      </h3>
    </div>
  )
}

function WindExplanation(props: { wind: Wind }) {
  const tileWidth = useTileSize()

  return (
    <div class={cardRowClass}>
      <BasicTile width={tileWidth()} card={props.wind} />
      <h3 class={cardTitleClass({ hue: "dot" })}>
        {getWindDirection(props.wind)}
      </h3>
    </div>
  )
}

function useTileSize() {
  const layout = useLayoutSize()
  return createMemo(() => {
    return layout().orientation === "portrait"
      ? layout().width / 16
      : layout().height / 16
  })
}
