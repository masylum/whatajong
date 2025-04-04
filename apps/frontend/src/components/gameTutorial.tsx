import {
  createSignal,
  Show,
  type ParentProps,
  Switch,
  Match,
  createMemo,
  type JSXElement,
  type Accessor,
  onMount,
} from "solid-js"
import {
  backButtonClass,
  buttonsClass,
  containerClass,
  columnClass,
  columnsClass,
  rowClass,
  rowsClass,
  dragonRunClass,
  cardRowsClass,
  cardRowClass,
  cardTitleClass,
  titleClass,
  whatajongClass,
  emperorClass,
  emperorImageClass,
  emperorDescriptionTextClass,
  emperorTextClass,
  emperorContainerClass,
  boardClass,
  shopItemContainerClass,
  materialNameClass,
  materialListItemClass,
  materialListClass,
} from "./gameTutorial.css"
import {
  suitName,
  type Suit,
  type Card,
  type Wind,
  getWindDirection,
  type Material,
} from "@/lib/game"
import { BasicTile } from "@/components/game/basicTile"
import { ArrowLeft, ArrowRight, Home, Play, Skull } from "@/components/icon"
import { Button, LinkButton, ShopButton } from "@/components/button"
import { useGlobalState } from "@/state/globalState"
import { getSideSize, useLayoutSize } from "@/state/constants"
import { comboRecipe } from "./game/powerups.css"
import { MovesIndicator, Penalty, Points } from "./game/stats"
import { emperorName, getEmperors } from "@/state/emperors"
import type { AccentHue } from "@/styles/colors"
import {
  ItemTile,
  EmperorItemComponent,
  RerollButton,
  FreezeButton,
  UpgradeButton,
  CoinCounter,
  DeckTitle,
} from "@/routes/run/runShop"

const STEPS = [
  "tiles",
  "clearing",
  "dragons",
  "winds & flowers",
  "board",
] as const
const RUN_STEPS = ["crew", "shop", "upgrade", "materials"] as const

export function GameTutorial(props: ParentProps) {
  return (
    <Tutorial steps={STEPS} tutorial="game" fallback={props.children}>
      {(step) => (
        <Switch>
          <Match when={step() === 0}>
            <Tiles />
          </Match>
          <Match when={step() === 1}>
            <Clearing />
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
    <Tutorial steps={RUN_STEPS} tutorial="run" fallback={props.children}>
      {(step) => (
        <Switch>
          <Match when={step() === 0}>
            <Crew />
          </Match>
          <Match when={step() === 1}>
            <Shop />
          </Match>
          <Match when={step() === 2}>
            <Upgrade />
          </Match>
          <Match when={step() === 3}>
            <Materials />
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
  tutorial: "game" | "run"
}

function Tutorial<T extends readonly string[]>(props: TutorialProps<T>) {
  const globalState = useGlobalState()
  const step = createMemo(() => globalState.tutorial[props.tutorial])
  const stage = createMemo(() => props.steps[step()]!)
  const [play, setPlay] = createSignal(false)
  const [upperBound, setUpperBound] = createSignal(0)

  onMount(() => {
    setUpperBound(step())
    setPlay(step() >= props.steps.length)
  })

  function onSkip() {
    globalState.tutorial[props.tutorial] = upperBound() + 1
    setUpperBound(globalState.tutorial[props.tutorial])
    setPlay(true)
  }

  function onPrev() {
    globalState.tutorial[props.tutorial] -= 1
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
          <Button hue="bam" kind="dark" onClick={onSkip}>
            <Show
              when={props.tutorial === "game"}
              fallback={
                <>
                  go to shop
                  <ArrowRight />
                </>
              }
            >
              <Play />
              play
            </Show>
          </Button>
        </div>
        <h1 class={titleClass}>Tutorial: {stage()}</h1>
        {props.children(step)}
      </div>
    </Show>
  )
}

function Tiles() {
  const tileWidth = useTileSize()

  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        <p>
          The goal of <span class={whatajongClass}>Whatajong</span> is to clear
          all the tiles from the board, scoring as many points as possible.
        </p>
      </div>
      <div class={columnClass}>
        Your deck contains tiles of three suits:
        <div class={cardRowsClass}>
          <SuitExplanation suit="b" />
          <SuitExplanation suit="c" />
          <SuitExplanation suit="o" />
        </div>
      </div>
      <div class={columnClass}>
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

function Clearing() {
  const tileWidth = useTileSize()
  const tileSide = createMemo(() => getSideSize(tileWidth()))

  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        A tile can be selected if it has no other tile on top of it and has at
        least one free side (left or right).
      </div>
      <div class={columnClass}>
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
      <div class={columnClass}>
        When clearing a pair of tiles, you score points.
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
    <div class={columnsClass}>
      <div class={columnClass}>
        <p>There are 3 dragons, one for each suit.</p>
        <div class={cardRowsClass}>
          <DragonExplanation suit="b" />
          <DragonExplanation suit="c" />
          <DragonExplanation suit="o" />
        </div>
      </div>
      <div class={columnClass}>
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
      <div class={columnClass}>
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
    <div class={columnsClass}>
      <div class={columnClass}>
        <p>Winds move the tiles on the board towards a direction:</p>
        <div class={rowsClass}>
          <WindExplanation wind="ww" />
          <WindExplanation wind="we" />
          <WindExplanation wind="ws" />
          <WindExplanation wind="wn" />
        </div>
      </div>
      <div class={columnClass}>
        <p>
          Flowers & Seasons can be matched among themselves, regardless of their
          number.
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
      <div class={columnClass}>
        <p>
          Clearing Flowers & Seasons makes it easier to clear tiles on the next
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
    <div class={columnsClass}>
      <div class={columnClass}>
        <div class={boardClass}>
          <Points points={100} />
        </div>
        <p>
          The points indicator shows you how many points have you scored so far.
        </p>
      </div>
      <div class={columnClass}>
        <div class={boardClass}>
          <Penalty points={100} />
        </div>
        <p>
          The penalty indicator shows you how many points have you lost due to
          time passing by.
        </p>
      </div>
      <div class={columnClass}>
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

function Crew() {
  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        <p>To help you on this journey, you can recruit crew members.</p>
        <p>
          Each crew member has a unique ability. Be creative and combine them to
          unlock powerful combinations.
        </p>
      </div>
      <div class={columnClass}>
        <div class={emperorContainerClass}>
          <EmperorExplanation index={0} name="birdwatcher" hue="bam" />
          <EmperorExplanation index={1} name="breeder" hue="dot" />
          <EmperorExplanation index={2} name="dragon_rider" hue="crack" />
        </div>
      </div>
      <div class={columnClass}>
        <p>
          During a game, if you are running out of moves, discard a crew member
          to shuffle the board.
        </p>
        <div class={boardClass}>
          <MovesIndicator urgency="urgent" pairs={1} />
        </div>
        <ShopButton hue="dot">
          <Skull />
          Discard and shuffle
        </ShopButton>
      </div>
    </div>
  )
}

function Shop() {
  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        <p>
          Every round you yield 1 coin per tile on your deck. Spend them on the
          shop to buy new tiles and crew members.
        </p>
        <div class={shopItemContainerClass}>
          <ItemTile
            item={{
              card: "b1",
              level: 1,
              type: "tile",
              id: "b1",
            }}
          />
          <ItemTile
            item={{
              card: "dc",
              level: 1,
              type: "tile",
              id: "dc",
            }}
          />
          <EmperorItemComponent
            item={{
              name: "birdwatcher",
              level: 1,
              type: "emperor",
              id: "birdwatcher",
            }}
          />
        </div>
      </div>
      <div class={columnClass}>
        <p>Refresh the shop to get new items.</p>
        <div class={shopItemContainerClass}>
          <RerollButton disabled={false} />
        </div>
      </div>
      <div class={columnClass}>
        <p>
          If there is something you like, but you can't afford it, freeze the
          items until next round.
        </p>
        <div class={shopItemContainerClass}>
          <FreezeButton />
        </div>
      </div>
    </div>
  )
}

function Upgrade() {
  const tileWidth = useTileSize()

  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        <p>
          You can upgrade your shop level to unlock new items and crew members.
        </p>
        <div class={shopItemContainerClass}>
          <UpgradeButton cost={100} disabled={false} />
        </div>
      </div>
      <div class={columnClass}>
        <p>
          Each shop level increases your crew and deck capacity. More tiles,
          more points!
        </p>
        <div class={boardClass}>
          <div class={rowsClass}>
            <DeckTitle pairs={70} capacity={72} />
            <br />
            <div class={rowClass}>
              <BasicTile width={tileWidth()} card="o6" />
              <BasicTile width={tileWidth()} card="c2" />
              <BasicTile width={tileWidth()} card="c2" />
              <BasicTile width={tileWidth()} card="o6" />
            </div>
          </div>
        </div>
      </div>
      <div class={columnClass}>
        <p>
          Upgrading your shop also increases your yield, so you can earn more
          coins each round.
        </p>
        <div class={boardClass}>
          <CoinCounter money={100} />
        </div>
      </div>
    </div>
  )
}

function Materials() {
  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        <p>Buy three of the same tile to upgrade the material.</p>
        <div class={cardRowsClass}>
          <MaterialExplanation material="glass" />
          <MaterialExplanation material="ivory" />
          <MaterialExplanation material="bronze" />
        </div>
      </div>
      <div class={columnClass}>
        <p>Buy three upgraded tiles to upgrade the material.</p>
        <div class={cardRowsClass}>
          <MaterialExplanation material="diamond" />
          <MaterialExplanation material="jade" />
          <MaterialExplanation material="gold" />
        </div>
      </div>
      <div class={columnClass}>
        <p>Different materials have different characteristics:</p>
        <ul class={materialListClass}>
          <li class={materialListItemClass}>
            <strong class={materialNameClass({ hue: "glass" })}>glass</strong>
            {" / "}
            <strong class={materialNameClass({ hue: "diamond" })}>
              diamond
            </strong>{" "}
            easier to clear
          </li>
          <li class={materialListItemClass}>
            <strong class={materialNameClass({ hue: "ivory" })}>ivory</strong>
            {" / "}
            <strong class={materialNameClass({ hue: "jade" })}>jade</strong>{" "}
            give more points.
          </li>
          <li class={materialListItemClass}>
            <strong class={materialNameClass({ hue: "bronze" })}>bronze</strong>
            {" / "}
            <strong class={materialNameClass({ hue: "gold" })}>gold</strong>{" "}
            give coins.
          </li>
        </ul>
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

function MaterialExplanation(props: { material: Material }) {
  const tileWidth = useTileSize()

  return (
    <div class={cardRowClass}>
      <h3 class={cardTitleClass({ hue: props.material })}>{props.material}</h3>
      <BasicTile
        width={tileWidth()}
        card="b1"
        material={props.material}
        style={{ transform: "rotate(5deg)" }}
      />
      <BasicTile
        width={tileWidth()}
        card="o1"
        material={props.material}
        style={{ transform: "rotate(5deg)" }}
      />
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

// TODO: DRY image
function EmperorExplanation(props: {
  index: number
  name: string
  hue: AccentHue
}) {
  const emperor = createMemo(() =>
    getEmperors().find((e) => e.name === props.name),
  )

  return (
    <div
      class={emperorClass({ hue: props.hue })}
      style={{
        transform: `scale(0.8) translateX(${-20 + props.index * 20}px) rotate(${-10 + props.index * 10}deg)`,
      }}
    >
      <img
        srcset={`/occupations/m/${props.name}.webp 300w, /occupations/l/${props.name}.webp 514w`}
        sizes="(min-width: 1024px) 514px, 300px"
        src={`/occupations/m/${props.name}.webp`}
        class={emperorImageClass}
        alt={props.name}
      />
      <div class={emperorTextClass}>
        {emperorName(props.name)}
        <div class={emperorDescriptionTextClass}>
          {emperor()?.description()}
        </div>
      </div>
    </div>
  )
}
