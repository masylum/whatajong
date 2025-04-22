import { Button } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import { ArrowLeft, ArrowRight, X } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import { type Material, type WindDirection, cardName } from "@/lib/game"
import { FreezeButton, ItemTile, RerollButton } from "@/routes/run/runShop"
import { getSideSize, useLayoutSize } from "@/state/constants"
import { hueFromColor, hueFromSuit } from "@/styles/colors"
import { Match, Switch, createMemo, createSignal } from "solid-js"
import { comboRecipe } from "./game/powerups.css"
import { MovesIndicator, Penalty, Points } from "./game/stats"
import {
  backButtonClass,
  boardClass,
  buttonsClass,
  cardRowClass,
  cardRowsClass,
  cardTitleClass,
  columnClass,
  columnsClass,
  containerClass,
  materialListClass,
  materialListItemClass,
  materialNameClass,
  rowClass,
  rowsClass,
  shopItemContainerClass,
  titleClass,
  whatajongClass,
} from "./gameTutorial.css"

const STEPS = [
  "tiles",
  "clearing",
  "dragons",
  "seasonsAndFlowers",
  "board",
  "shop",
  "materials",
] as const

export function GameTutorial(props: { onClose: () => void }) {
  const t = useTranslation()
  const [step, setStep] = createSignal(0)
  const stage = createMemo(() =>
    t.tutorial.stages[STEPS[step()]! as keyof typeof t.tutorial.stages](),
  )

  function onPrev() {
    setStep(step() - 1)
  }

  function onNext() {
    setStep(step() + 1)
  }

  return (
    <div class={containerClass}>
      <div class={backButtonClass}>
        <Button hue="dot" kind="dark" onClick={props.onClose}>
          <X />
          {t.common.close()}
        </Button>
      </div>
      <div class={buttonsClass}>
        <Button hue="dot" kind="dark" onClick={onPrev} disabled={step() === 0}>
          <ArrowLeft />
          {t.common.prev()}
        </Button>
        <Button
          hue="dot"
          kind="dark"
          onClick={onNext}
          disabled={step() >= STEPS.length - 1}
        >
          {t.common.next()}
          <ArrowRight />
        </Button>
      </div>
      <h1 class={titleClass}>{t.tutorial.title({ stage: stage() })}</h1>
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
        <Match when={step() === 5}>
          <Shop />
        </Match>
        <Match when={step() === 6}>
          <Materials />
        </Match>
      </Switch>
    </div>
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
            cardId="b8"
            style={{ transform: "rotate(-10deg)" }}
          />
          <BasicTile
            width={tileWidth()}
            cardId="b8"
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
            <BasicTile width={tileWidth()} cardId="o6" highlighted="bam" />
            <BasicTile width={tileWidth()} cardId="c2" />
            <BasicTile width={tileWidth()} cardId="c2" />
            <BasicTile width={tileWidth()} cardId="o6" highlighted="bam" />
          </div>
          <div class={rowClass}>
            <BasicTile width={tileWidth()} cardId="o1" highlighted="bam" />
            <BasicTile width={tileWidth()} cardId="b7" />
            <BasicTile width={tileWidth()} cardId="c8" />
            <BasicTile
              width={tileWidth()}
              cardId="o1"
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
            <BasicTile width={tileWidth()} cardId="b1" highlighted="bam" />
            <BasicTile width={tileWidth()} cardId="o3" />
            <BasicTile width={tileWidth()} cardId="o3" />
          </div>
        </div>
      </div>
      <div class={columnClass}>
        {t.tutorial.clearing3()}
        <div class={cardRowClass}>
          <BasicTile
            width={tileWidth()}
            cardId="o1"
            style={{ transform: "rotate(-10deg)" }}
          />
          <BasicTile
            width={tileWidth()}
            cardId="o1"
            style={{ transform: "rotate(7deg)" }}
          />
          <h3 class={cardTitleClass({ hue: "dot" })}>
            {t.tutorial.clearing4()}
          </h3>
        </div>
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
          <DragonExplanation color="r" />
          <DragonExplanation color="g" />
          <DragonExplanation color="b" />
          <DragonExplanation color="k" />
        </div>
      </div>
      <div class={columnClass}>
        <p innerHTML={t.tutorial.dragons2()} />
        <p innerHTML={t.tutorial.dragons3()} />
      </div>
      <div class={columnClass}>
        <p innerHTML={t.tutorial.dragons4()} />
        <div class={cardRowsClass}>
          <div class={cardRowClass}>
            <BasicTile
              width={tileWidth()}
              cardId="b8"
              style={{ transform: "rotate(5deg)" }}
            />
            <BasicTile
              width={tileWidth()}
              cardId="b8"
              style={{ transform: "rotate(-7deg)" }}
            />
            <span class={comboRecipe({ hue: "bam" })}>x1</span>
          </div>
          <div class={cardRowClass}>
            <BasicTile
              width={tileWidth()}
              cardId="b3"
              style={{ transform: "rotate(5deg)" }}
            />
            <BasicTile
              width={tileWidth()}
              cardId="b3"
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
          <WindExplanation direction="w" />
          <WindExplanation direction="e" />
          <WindExplanation direction="s" />
          <WindExplanation direction="n" />
        </div>
      </div>
      <div class={columnClass}>
        <p>{t.tutorial.seasonsAndFlowers2()}</p>
        <div class={rowsClass}>
          <div class={cardRowClass}>
            <BasicTile
              width={tileWidth()}
              cardId="f1"
              style={{ transform: "rotate(5deg)" }}
            />
            <BasicTile
              width={tileWidth()}
              cardId="f2"
              style={{ transform: "rotate(-7deg)" }}
            />
            <span class={comboRecipe({ hue: "bam" })}>{t.common.yes()}</span>
          </div>
          <div class={cardRowClass}>
            <BasicTile
              width={tileWidth()}
              cardId="f1"
              style={{ transform: "rotate(5deg)" }}
            />
            <BasicTile
              width={tileWidth()}
              cardId="f2"
              style={{ transform: "rotate(-7deg)" }}
            />
            <span class={comboRecipe({ hue: "bam" })}>{t.common.yes()}</span>
          </div>
          <div class={cardRowClass}>
            <BasicTile
              width={tileWidth()}
              cardId="f1"
              style={{ transform: "rotate(5deg)" }}
            />
            <BasicTile
              width={tileWidth()}
              cardId="f1"
              style={{ transform: "rotate(-7deg)" }}
            />
            <span class={comboRecipe({ hue: "crack" })}>{t.common.no()}</span>
          </div>
        </div>
      </div>
      <div class={columnClass}>
        <p>{t.tutorial.seasonsAndFlowers3()}</p>
      </div>
    </div>
  )
}

function Board() {
  const t = useTranslation()

  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        <p>{t.tutorial.board1()}</p>
        <div class={boardClass}>
          <Points points={100} />
        </div>
      </div>
      <div class={columnClass}>
        <p>{t.tutorial.board2()}</p>
        <div class={boardClass}>
          <Penalty points={100} />
        </div>
      </div>
      <div class={columnClass}>
        <p>{t.tutorial.board3()}</p>
        <div class={boardClass}>
          <MovesIndicator urgency="moderate" pairs={2} />
        </div>
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
              cardId: "b1",
              level: 1,
              type: "tile",
              id: "b1",
            }}
            selected={false}
          />
          <ItemTile
            item={{
              cardId: "dr",
              level: 1,
              type: "tile",
              id: "dc",
            }}
            selected={false}
          />
        </div>
      </div>
      <div class={columnClass}>
        <p>{t.tutorial.shop2()}</p>
        <div class={shopItemContainerClass}>
          <RerollButton disabled={false} cost={0} />
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

function SuitExplanation(props: { suit: "b" | "c" | "o" }) {
  const t = useTranslation()
  const tileWidth = useTileSize()

  return (
    <div class={cardRowClass}>
      <h3 class={cardTitleClass({ hue: hueFromSuit(props.suit) })}>
        {t.suit[props.suit]()}
      </h3>
      <BasicTile
        width={tileWidth()}
        cardId={`${props.suit}1`}
        style={{ transform: "rotate(5deg)" }}
      />
      <BasicTile
        width={tileWidth()}
        cardId={`${props.suit}5`}
        style={{ transform: "rotate(-10deg)" }}
      />
      <BasicTile
        width={tileWidth()}
        cardId={`${props.suit}9`}
        style={{ transform: "rotate(7deg)" }}
      />
    </div>
  )
}

function DragonExplanation(props: { color: "r" | "g" | "b" | "k" }) {
  const t = useTranslation()
  const tileWidth = useTileSize()

  return (
    <div class={cardRowClass}>
      <BasicTile width={tileWidth()} cardId={`d${props.color}`} />
      <h3 class={cardTitleClass({ hue: hueFromColor(props.color) })}>
        {cardName(t, `d${props.color}`)}
      </h3>
    </div>
  )
}

function WindExplanation(props: { direction: WindDirection }) {
  const t = useTranslation()
  const tileWidth = useTileSize()

  return (
    <div class={cardRowClass}>
      <BasicTile width={tileWidth()} cardId={`w${props.direction}`} />
      <h3 class={cardTitleClass({ hue: "dot" })}>
        {t.windDirections[props.direction]()}
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
        cardId="b1"
        material={props.material}
        style={{ transform: "rotate(5deg)" }}
      />
      <BasicTile
        width={tileWidth()}
        cardId="o1"
        material={props.material}
        style={{ transform: "rotate(5deg)" }}
      />
    </div>
  )
}

function useTileSize() {
  const layout = useLayoutSize()
  return createMemo(() => layout().width / 12)
}
