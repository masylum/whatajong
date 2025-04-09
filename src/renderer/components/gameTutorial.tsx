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
  cardName,
} from "@/lib/game"
import { BasicTile } from "@/components/game/basicTile"
import { ArrowLeft, ArrowRight, Home, Play, Skull } from "@/components/icon"
import { Button, LinkButton, ShopButton } from "@/components/button"
import { useGlobalState } from "@/state/globalState"
import { getSideSize, useLayoutSize } from "@/state/constants"
import { comboRecipe } from "./game/powerups.css"
import { MovesIndicator, Penalty, Points } from "./game/stats"
import {
  EmperorDescription,
  EmperorTitle,
  type EmperorName,
} from "@/state/emperors"
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
import { BasicEmperor } from "./emperor"
import { useTranslation } from "@/i18n/useTranslation"

const STEPS = [
  "tiles",
  "clearing",
  "dragons",
  "seasonsAndFlowers",
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
            <SeasonsAndFlowers />
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
  const t = useTranslation()
  const globalState = useGlobalState()
  const step = createMemo(() => globalState.tutorial[props.tutorial])
  const stage = createMemo(() =>
    t.tutorial.stages[props.steps[step()]! as keyof typeof t.tutorial.stages](),
  )
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

  function onNext() {
    globalState.tutorial[props.tutorial] += 1
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
            {t.common.prev()}
          </Button>
          <Show when={step() < upperBound()}>
            <Button hue="dot" kind="dark" onClick={onNext}>
              {t.common.next()}
              <ArrowRight />
            </Button>
          </Show>
          <Button hue="bam" kind="dark" onClick={onSkip}>
            <Show
              when={props.tutorial === "game"}
              fallback={
                <>
                  {t.common.goToShop()}
                  <ArrowRight />
                </>
              }
            >
              <Play />
              {t.common.play()}
            </Show>
          </Button>
        </div>
        <h1 class={titleClass}>{t.tutorial.title({ stage: stage() })}</h1>
        {props.children(step)}
      </div>
    </Show>
  )
}

function Tiles() {
  const t = useTranslation()
  const tileWidth = useTileSize()

  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        <p innerHTML={t.tutorial.tiles1({ whatajongClass })} />
      </div>
      <div class={columnClass}>
        {t.tutorial.tiles2()}
        <div class={cardRowsClass}>
          <SuitExplanation suit="b" />
          <SuitExplanation suit="c" />
          <SuitExplanation suit="o" />
        </div>
      </div>
      <div class={columnClass}>
        {t.tutorial.tiles3()}
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
  const t = useTranslation()
  const tileWidth = useTileSize()
  const tileSide = createMemo(() => getSideSize(tileWidth()))

  return (
    <div class={columnsClass}>
      <div class={columnClass}>{t.tutorial.clearing1()}</div>
      <div class={columnClass}>
        {t.tutorial.clearing2()}
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
        {t.tutorial.clearing3()}
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
          {t.tutorial.clearing4()}
        </h3>
      </div>
    </div>
  )
}

function Dragons() {
  const t = useTranslation()
  const tileWidth = useTileSize()

  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        <p>{t.tutorial.dragons1()}</p>
        <div class={cardRowsClass}>
          <DragonExplanation suit="b" />
          <DragonExplanation suit="c" />
          <DragonExplanation suit="o" />
        </div>
      </div>
      <div class={columnClass}>
        <p innerHTML={t.tutorial.dragons2()} />
        <div class={dragonRunClass}>
          <BasicTile width={tileWidth()} card="db" />
          <span class={comboRecipe({ hue: "bam" })}>
            {t.common.dragonRun()}
          </span>
        </div>
        <p innerHTML={t.tutorial.dragons3()} />
      </div>
      <div class={columnClass}>
        <p innerHTML={t.tutorial.dragons4()} />
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

function SeasonsAndFlowers() {
  const t = useTranslation()
  const tileWidth = useTileSize()

  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        <p>{t.tutorial.seasonsAndFlowers1()}</p>
        <div class={rowsClass}>
          <WindExplanation wind="ww" />
          <WindExplanation wind="we" />
          <WindExplanation wind="ws" />
          <WindExplanation wind="wn" />
        </div>
      </div>
      <div class={columnClass}>
        <p>{t.tutorial.seasonsAndFlowers2()}</p>
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
            <span class={comboRecipe({ hue: "bam" })}>{t.common.yes()}</span>
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
            <span class={comboRecipe({ hue: "bam" })}>{t.common.yes()}</span>
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
            <span class={comboRecipe({ hue: "crack" })}>{t.common.no()}</span>
          </div>
        </div>
      </div>
      <div class={columnClass}>
        <p>{t.tutorial.seasonsAndFlowers3()}</p>
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
  const t = useTranslation()

  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        <div class={boardClass}>
          <Points points={100} />
        </div>
        <p>{t.tutorial.board1()}</p>
      </div>
      <div class={columnClass}>
        <div class={boardClass}>
          <Penalty points={100} />
        </div>
        <p>{t.tutorial.board2()}</p>
      </div>
      <div class={columnClass}>
        <div class={boardClass}>
          <MovesIndicator urgency="moderate" pairs={2} />
        </div>
        <p>{t.tutorial.board3()}</p>
      </div>
    </div>
  )
}

function Crew() {
  const t = useTranslation()

  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        <p>{t.tutorial.crew1()}</p>
        <p>{t.tutorial.crew2()}</p>
      </div>
      <div class={columnClass}>
        <div class={emperorContainerClass}>
          <EmperorExplanation index={0} name="birdwatcher" hue="bam" />
          <EmperorExplanation index={1} name="breeder" hue="dot" />
          <EmperorExplanation index={2} name="dragon_rider" hue="crack" />
        </div>
      </div>
      <div class={columnClass}>
        <p>{t.tutorial.crew3()}</p>
        <div class={boardClass}>
          <MovesIndicator urgency="urgent" pairs={1} />
        </div>
        <ShopButton hue="dot">
          <Skull />
          {t.common.discardAndShuffle()}
        </ShopButton>
      </div>
    </div>
  )
}

function Shop() {
  const t = useTranslation()

  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        <p>{t.tutorial.shop1()}</p>
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
        <p>{t.tutorial.shop2()}</p>
        <div class={shopItemContainerClass}>
          <RerollButton disabled={false} />
        </div>
      </div>
      <div class={columnClass}>
        <p>{t.tutorial.shop3()}</p>
        <div class={shopItemContainerClass}>
          <FreezeButton />
        </div>
      </div>
    </div>
  )
}

function Upgrade() {
  const t = useTranslation()
  const tileWidth = useTileSize()

  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        <p>{t.tutorial.upgrade1()}</p>
        <div class={shopItemContainerClass}>
          <UpgradeButton cost={100} disabled={false} />
        </div>
      </div>
      <div class={columnClass}>
        <p>{t.tutorial.upgrade2()}</p>
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
        <p>{t.tutorial.upgrade3()}</p>
        <div class={boardClass}>
          <CoinCounter money={100} />
        </div>
      </div>
    </div>
  )
}

function Materials() {
  const t = useTranslation()

  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        <p>{t.tutorial.material1()}</p>
        <div class={cardRowsClass}>
          <MaterialExplanation material="glass" />
          <MaterialExplanation material="ivory" />
          <MaterialExplanation material="bronze" />
        </div>
      </div>
      <div class={columnClass}>
        <p>{t.tutorial.material2()}</p>
        <div class={cardRowsClass}>
          <MaterialExplanation material="diamond" />
          <MaterialExplanation material="jade" />
          <MaterialExplanation material="gold" />
        </div>
      </div>
      <div class={columnClass}>
        <p>{t.tutorial.material3()}</p>
        <ul class={materialListClass}>
          <li class={materialListItemClass}>
            <strong class={materialNameClass({ hue: "glass" })}>
              {t.material.glass()}
            </strong>
            {" / "}
            <strong class={materialNameClass({ hue: "diamond" })}>
              {t.material.diamond()}
            </strong>{" "}
            {t.tutorial.materialGlass()}
          </li>
          <li class={materialListItemClass}>
            <strong class={materialNameClass({ hue: "ivory" })}>
              {t.material.ivory()}
            </strong>
            {" / "}
            <strong class={materialNameClass({ hue: "jade" })}>
              {t.material.jade()}
            </strong>{" "}
            {t.tutorial.materialIvory()}
          </li>
          <li class={materialListItemClass}>
            <strong class={materialNameClass({ hue: "bronze" })}>
              {t.material.bronze()}
            </strong>
            {" / "}
            <strong class={materialNameClass({ hue: "gold" })}>
              {t.material.gold()}
            </strong>{" "}
            {t.tutorial.materialBronze()}
          </li>
        </ul>
      </div>
    </div>
  )
}

function SuitExplanation(props: { suit: Suit }) {
  const t = useTranslation()
  const tileWidth = useTileSize()

  return (
    <div class={cardRowClass}>
      <h3 class={cardTitleClass({ hue: suitName(props.suit) as any })}>
        {t.suit[props.suit]()}
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

function DragonExplanation(props: { suit: "b" | "c" | "o" }) {
  const t = useTranslation()
  const tileWidth = useTileSize()

  return (
    <div class={cardRowClass}>
      <BasicTile width={tileWidth()} card={`d${props.suit}`} />
      <h3 class={cardTitleClass({ hue: suitName(props.suit) as any })}>
        {cardName(t, `d${props.suit}`)}
      </h3>
    </div>
  )
}

function WindExplanation(props: { wind: Wind }) {
  const t = useTranslation()
  const tileWidth = useTileSize()

  return (
    <div class={cardRowClass}>
      <BasicTile width={tileWidth()} card={props.wind} />
      <h3 class={cardTitleClass({ hue: "dot" })}>
        {getWindDirection(t, props.wind)}
      </h3>
    </div>
  )
}

function MaterialExplanation(props: { material: Material }) {
  const t = useTranslation()
  const tileWidth = useTileSize()

  return (
    <div class={cardRowClass}>
      <h3 class={cardTitleClass({ hue: props.material })}>
        {t.material[props.material]()}
      </h3>
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
  return createMemo(() => layout().width / 16)
}

function EmperorExplanation(props: {
  index: number
  name: EmperorName
  hue: AccentHue
}) {
  return (
    <div
      class={emperorClass({ hue: props.hue })}
      style={{
        transform: `scale(0.8) translateX(${-20 + props.index * 20}px) rotate(${-10 + props.index * 10}deg)`,
      }}
    >
      <BasicEmperor name={props.name} class={emperorImageClass} />
      <div class={emperorTextClass}>
        <EmperorTitle name={props.name} />
        <div class={emperorDescriptionTextClass}>
          <EmperorDescription name={props.name} />
        </div>
      </div>
    </div>
  )
}
