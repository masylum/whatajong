import { Button, LinkButton } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import { ArrowLeft, ArrowRight, X } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import type { CardId, Color, Material } from "@/lib/game"
import { Coins, MovesIndicator, Penalty, Points } from "@/routes/run/runGame"
import { FreezeButton, ItemTile, RerollButton } from "@/routes/run/runShop"
import { getSideSize, useSmallerTileSize } from "@/state/constants"
import { hueFromColor } from "@/styles/colors"
import { Match, Show, Switch, createMemo, createSignal } from "solid-js"
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
  contentClass,
  materialClass,
  materialHeaderClass,
  rowClass,
  rowsClass,
  shopItemContainerClass,
  titleClass,
  whatajongClass,
} from "./help.css"
import { bamClass, crackClass, dotClass } from "./run/runGame.css"

const STEPS = ["tiles", "board", "shop", "materials"] as const

export function Help() {
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
      <div class={contentClass}>
        <div class={backButtonClass}>
          <LinkButton hue="dot" onPointerDown={() => history.back()}>
            <X />
            {t.common.close()}
          </LinkButton>
        </div>
        <div class={buttonsClass}>
          <Button hue="dot" onPointerDown={onPrev} disabled={step() === 0}>
            <ArrowLeft />
            {t.common.prev()}
          </Button>
          <Button
            hue="dot"
            onPointerDown={onNext}
            disabled={step() >= STEPS.length - 1}
          >
            {t.common.next()}
            <ArrowRight />
          </Button>
        </div>
        <Show when={stage()} keyed>
          <h1 class={titleClass}>{stage()}</h1>
        </Show>
        <Switch>
          <Match when={step() === 0}>
            <Tiles />
          </Match>
          <Match when={step() === 1}>
            <Board />
          </Match>
          <Match when={step() === 2}>
            <Shop />
          </Match>
          <Match when={step() === 3}>
            <Materials />
          </Match>
        </Switch>
      </div>
    </div>
  )
}

function Tiles() {
  const t = useTranslation()
  const tileSize = useSmallerTileSize(0.6)
  const tileSide = createMemo(() => getSideSize(tileSize().sideSize))

  return (
    <div class={columnsClass}>
      <div class={columnClass}>
        <p innerHTML={t.tutorial.tiles1({ whatajongClass })} />
      </div>
      <div class={columnClass}>
        {t.tutorial.tiles2()}
        <div class={cardRowClass}>
          <BasicTile
            width={tileSize().width}
            cardId="bam8"
            style={{ transform: "rotate(-10deg)" }}
          />
          <BasicTile
            width={tileSize().width}
            cardId="bam8"
            style={{ transform: "rotate(7deg)" }}
          />
        </div>
      </div>
      <div class={columnClass}>
        {t.tutorial.tiles3()}
        <div class={rowsClass}>
          <div class={rowClass}>
            <BasicTile
              width={tileSize().width}
              cardId="dot6"
              highlighted="bam"
            />
            <BasicTile width={tileSize().width} cardId="crack2" />
            <BasicTile width={tileSize().width} cardId="crack2" />
            <BasicTile
              width={tileSize().width}
              cardId="dot6"
              highlighted="bam"
            />
          </div>
          <div class={rowClass}>
            <BasicTile
              width={tileSize().width}
              cardId="dot1"
              highlighted="bam"
            />
            <BasicTile width={tileSize().width} cardId="bam7" />
            <BasicTile width={tileSize().width} cardId="crack8" />
            <BasicTile
              width={tileSize().width}
              cardId="dot1"
              highlighted="bam"
              style={{
                "z-index": 2,
                transform: `
                    translate(
                        -${tileSize().width * 1.5 - tileSide()}px,
                        -${tileSize().width - tileSide()}px
                    )
                `,
              }}
            />
          </div>
        </div>
      </div>
      <div class={columnClass}>
        {t.tutorial.tiles4()}
        <div class={cardRowClass}>
          <BasicTile
            width={tileSize().width}
            cardId="dot1"
            style={{ transform: "rotate(-10deg)" }}
          />
          <BasicTile
            width={tileSize().width}
            cardId="dot1"
            style={{ transform: "rotate(7deg)" }}
          />
          <h3 class={cardTitleClass({ hue: "dot" })}>{t.tutorial.tiles5()}</h3>
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
        <p innerHTML={t.tutorial.board1({ bamClass })} />
        <div class={boardClass}>
          <Points points={100} />
          <Penalty points={100} />
        </div>
      </div>
      <div class={columnClass}>
        <p innerHTML={t.tutorial.board2({ crackClass })} />
        <div class={boardClass}>
          <Coins coins={3} />
        </div>
      </div>
      <div class={columnClass}>
        <p innerHTML={t.tutorial.board3({ dotClass })} />
        <div class={boardClass}>
          <MovesIndicator urgency="normal" pairs={4} />
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
        <p innerHTML={t.tutorial.shop1({ crackClass })} />
        <div class={shopItemContainerClass}>
          <ItemTile
            item={{
              cardId: "bam1",
              cost: 3,
              type: "tile",
              id: "bam1",
            }}
            selected={false}
          />
          <ItemTile
            item={{
              cardId: "dragonr",
              cost: 3,
              type: "tile",
              id: "dragonr",
            }}
            selected={false}
          />
        </div>
      </div>
      <div class={columnClass}>
        <p innerHTML={t.tutorial.shop2({ bamClass })} />
        <div class={shopItemContainerClass}>
          <RerollButton disabled={false} cost={0} />
        </div>
      </div>
      <div class={columnClass}>
        <p innerHTML={t.tutorial.shop3({ dotClass })} />
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
          <MaterialExplanation
            color="b"
            cardId="dot1"
            m1="topaz"
            m2="sapphire"
          />
        </div>
        <div class={cardRowsClass}>
          <MaterialExplanation color="g" cardId="dot1" m1="jade" m2="emerald" />
        </div>
        <div class={cardRowsClass}>
          <MaterialExplanation color="r" cardId="dot1" m1="garnet" m2="ruby" />
        </div>
        <div class={cardRowsClass}>
          <MaterialExplanation
            color="k"
            cardId="windw"
            m1="quartz"
            m2="obsidian"
          />
        </div>
      </div>
    </div>
  )
}

function MaterialExplanation(props: {
  color: Color
  cardId: CardId
  m1: Material
  m2: Material
}) {
  const t = useTranslation()
  const tileSize = useSmallerTileSize(0.7)

  return (
    <div class={materialClass({ hue: hueFromColor(props.color) })}>
      <div class={materialHeaderClass}>
        <h3 class={cardTitleClass({ hue: hueFromColor(props.color) })}>
          {t.color[props.color]()}
        </h3>
        <p>{t.tutorial.material[props.color]()}</p>
      </div>
      <BasicTile
        cardId={props.cardId}
        width={tileSize().width}
        style={{ transform: "rotate(5deg)" }}
      />
      <BasicTile
        cardId={props.cardId}
        material={props.m1}
        width={tileSize().width}
        style={{ transform: "rotate(5deg)" }}
      />
      <BasicTile
        cardId={props.cardId}
        material={props.m2}
        width={tileSize().width}
        style={{ transform: "rotate(5deg)" }}
      />
    </div>
  )
}
