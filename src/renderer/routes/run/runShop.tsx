import { play, useMusic } from "@/components/audio"
import { ShopButton } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import { MaterialExplanationDescription } from "@/components/game/tileDetails"
import { ArrowRight, Buy, Dices, Freeze, X } from "@/components/icon"
import { Menu } from "@/components/menu"
import { useTranslation } from "@/i18n/useTranslation"
import { type DeckTile, type Material, type Suit, getCard } from "@/lib/game"
import { captureEvent } from "@/lib/observability"
import { throttle } from "@/lib/throttle"
import { useSmallerTileSize } from "@/state/constants"
import { useDeckState } from "@/state/deckState"
import { initialGameState, useGameState } from "@/state/gameState"
import { setMutable } from "@/state/persistantMutable"
import {
  type Path,
  REROLL_COST,
  type TileItem,
  buyTile,
  generateItems,
  getNextMaterial,
  upgradeTile,
  useLevels,
  useRunState,
} from "@/state/runState"
import { initializeTileState, useTileState } from "@/state/tileState"
import { hueFromMaterial } from "@/styles/colors"
import { Dialog } from "@kobalte/core/dialog"
import { Key } from "@solid-primitives/keyed"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import { isDeepEqual, sortBy } from "remeda"
import {
  For,
  Match,
  type ParentProps,
  Show,
  Switch,
  batch,
  createMemo,
  createSignal,
  onMount,
} from "solid-js"
import { cardRowClass } from "../help.css"
import {} from "./runGame.css"
import {
  areaClass,
  areaTitleClass,
  areaTitleTextClass,
  backgroundClass,
  bamClass,
  closeButtonClass,
  coinsClass,
  continueClass,
  crackClass,
  deckItemClass,
  deckRowsClass,
  delayVar,
  dialogContentClass,
  dialogOverlayClass,
  dialogPositionerClass,
  dotClass,
  materialUpgradeBlockClass,
  materialUpgradeClass,
  materialUpgradeTextClass,
  materialUpgradeTitleClass,
  materialUpgradesClass,
  modalDetailsContentClass,
  pairClass,
  rotation,
  shop1ArrowClass,
  shop2ArrowClass,
  shopClass,
  shopHeaderClass,
  shopHeaderItemsClass,
  shopItemButtonClass,
  shopItemClass,
  shopItemContentClass,
  shopItemsClass,
  tutorialClass,
  upgradeDescriptionClass,
  upgradeTitleClass,
} from "./runShop.css"

const DECK_CAPACITY = 163

const onHoverTile = throttle(() => {
  play("click2")
}, 30)

export default function RunShop() {
  const run = useRunState()

  onMount(() => {
    const freeze = run.freeze
    if (freeze?.active) {
      setTimeout(() => {
        freeze.active = false
        play("freeze")
      }, 2_000)
    }
  })

  useMusic("music")

  return (
    <div class={backgroundClass}>
      <div class={shopClass}>
        <Tutorial />
        <Header />
        <Items />
        <DeckArea />
      </div>
    </div>
  )
}

function DeckTileComponent(props: {
  deckTile: DeckTile
  size: number
  zIndex: number
}) {
  const tileSize = useSmallerTileSize(props.size)

  return (
    <div
      class={deckItemClass}
      style={{
        "z-index": props.zIndex,
        ...assignInlineVars({
          [delayVar]: `${props.zIndex * 15}ms`,
        }),
      }}
    >
      <BasicTile
        cardId={props.deckTile.cardId}
        material={props.deckTile.material}
        width={tileSize().width}
      />
      <BasicTile
        class={pairClass}
        cardId={props.deckTile.cardId}
        material={props.deckTile.material}
        width={tileSize().width}
        style={{
          transform: `translate(${tileSize().sideSize}px, ${tileSize().sideSize}px)`,
        }}
      />
    </div>
  )
}

export function ItemTile(props: { item: TileItem }) {
  const run = useRunState()
  const deck = useDeckState()
  const frozen = createMemo(() => run.freeze?.active)
  const cost = createMemo(() => props.item.cost)
  const tileSize = useSmallerTileSize(0.75)
  const [upgradeModal, setUpgradeModal] = createSignal(false)
  const t = useTranslation()
  const disabled = createMemo(
    () => frozen() || cost() > run.money || deck.size >= DECK_CAPACITY,
  )

  // TODO: DRY
  const tilesWithSameCard = createMemo(() =>
    deck.filterBy({ cardId: props.item.cardId }),
  )
  const upgrades = createMemo(() =>
    getCard(props.item.cardId).colors.map((color) => ({
      path: color,
      material: getNextMaterial(tilesWithSameCard(), color),
    })),
  )
  const isUpgrading = createMemo(() =>
    upgrades().some((upgrade) => upgrade.material !== "bone"),
  )

  function onClickTile() {
    run.tutorialStep = run.tutorialStep! + 1

    if (!isUpgrading()) {
      buyTile({ run, item: props.item, deck })
    } else {
      setUpgradeModal(true)
    }
  }

  return (
    <>
      <ShopItem
        frozen={frozen()}
        cost={cost()}
        disabled={disabled()}
        selected={upgradeModal()}
        sudo={run.tutorialStep === 1}
        onPointerDown={onClickTile}
      >
        <BasicTile
          cardId={props.item.cardId}
          width={tileSize().width}
          pulse={isUpgrading()}
          style={{
            transform: `translate(${-tileSize().sideSize}px, ${-tileSize().sideSize}px)`,
          }}
        />
        <BasicTile
          class={pairClass}
          cardId={props.item.cardId}
          pulse={isUpgrading()}
          width={tileSize().width}
        />
      </ShopItem>
      <Show when={upgradeModal()}>
        <Dialog
          defaultOpen
          onOpenChange={() => {
            setUpgradeModal(false)
          }}
        >
          <Dialog.Portal>
            <Dialog.Overlay class={dialogOverlayClass} />
            <div class={dialogPositionerClass}>
              <Show when={isUpgrading()}>
                <Dialog.Content
                  class={dialogContentClass({ type: "tileUpgrade" })}
                >
                  <Dialog.CloseButton
                    class={closeButtonClass}
                    onPointerDown={() => {
                      setUpgradeModal(false)
                    }}
                  >
                    <X />
                  </Dialog.CloseButton>
                  <div class={modalDetailsContentClass}>
                    <div class={upgradeDescriptionClass}>
                      <h2 class={upgradeTitleClass}>
                        {t.shop.upgrade.title()}
                      </h2>
                      {t.shop.upgrade.description()}
                    </div>
                    <div class={materialUpgradesClass}>
                      <For each={upgrades()}>
                        {({ material, path }) => (
                          <MaterialUpgradeButton
                            material={material}
                            item={props.item}
                            path={path}
                          />
                        )}
                      </For>
                    </div>
                  </div>
                </Dialog.Content>
              </Show>
            </div>
          </Dialog.Portal>
        </Dialog>
      </Show>
    </>
  )
}

export function RerollButton(props: {
  onPointerDown?: () => void
  cost: number
  disabled: boolean
}) {
  const run = useRunState()

  return (
    <ShopItem
      cost={props.cost}
      onPointerDown={props.onPointerDown}
      disabled={props.disabled}
      selected={false}
      sudo={run.tutorialStep === 2}
    >
      <div class={shopItemButtonClass({ hue: "bam" })}>
        <Dices />
        <Show when={run.tutorialStep === 2}>
          <svg
            width="130"
            height="144"
            viewBox="0 0 130 144"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class={shop2ArrowClass}
          >
            <path
              d="M4.466 143.228c1.636-.317 4.017-1.466 4.475-3.266 1.777-6.975 2.885-14.105 4.617-21.098a259 259 0 0 1 5.95-20.4c4.497-13.36 10.067-26.391 16.679-38.842a256 256 0 0 1 10.716-18.315c3.628-5.648 7.492-11.363 11.794-16.423C67.234 14.84 77.574 6.779 90.972 5.875c11.684-.787 24.21 6.252 28.511 17.335-2.494-1.43-4.967-2.964-7.581-4.149-1.446-.655-3.532.214-4.632 1.145-.756.639-2.189 2.448-.846 3.323 2.696 1.756 5.66 3.134 8.507 4.631l8.51 4.476c1.732.91 5.868-1.01 5.678-3.21-.345-4.006-.674-8.014-1.051-12.017-.367-3.904-.632-7.875-1.524-11.695-.199-.854-1.763-.555-2.261-.366-.831.315-1.668.92-1.776 1.864-.414 3.608-.333 7.298-.281 10.941a24.5 24.5 0 0 0-5.824-8.907c-4.452-4.358-10.229-7.078-16.35-8.081-15.088-2.474-30.095 5.023-40.983 14.93-5.496 5-10.175 10.922-14.464 16.966-4.321 6.09-8.338 12.404-12.088 18.86a260.7 260.7 0 0 0-19.142 40.627 260 260 0 0 0-7.575 24.05 258 258 0 0 0-2.849 12.03c-.902 4.263-1.789 8.518-2.073 12.872-.117 1.816 2.405 1.957 3.588 1.728"
              fill="#231F20"
            />
          </svg>
        </Show>
      </div>
    </ShopItem>
  )
}

export function FreezeButton(props: { onPointerDown?: () => void }) {
  const run = useRunState()

  return (
    <ShopItem
      cost={0}
      onPointerDown={props.onPointerDown}
      disabled={false}
      selected={!!run.freeze?.active}
      sudo={run.tutorialStep === 3}
    >
      <div class={shopItemButtonClass({ hue: "dot" })}>
        <Freeze />
        <Show when={run.tutorialStep === 3}>
          <svg
            width="130"
            height="144"
            viewBox="0 0 130 144"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class={shop2ArrowClass}
          >
            <path
              d="M4.466 143.228c1.636-.317 4.017-1.466 4.475-3.266 1.777-6.975 2.885-14.105 4.617-21.098a259 259 0 0 1 5.95-20.4c4.497-13.36 10.067-26.391 16.679-38.842a256 256 0 0 1 10.716-18.315c3.628-5.648 7.492-11.363 11.794-16.423C67.234 14.84 77.574 6.779 90.972 5.875c11.684-.787 24.21 6.252 28.511 17.335-2.494-1.43-4.967-2.964-7.581-4.149-1.446-.655-3.532.214-4.632 1.145-.756.639-2.189 2.448-.846 3.323 2.696 1.756 5.66 3.134 8.507 4.631l8.51 4.476c1.732.91 5.868-1.01 5.678-3.21-.345-4.006-.674-8.014-1.051-12.017-.367-3.904-.632-7.875-1.524-11.695-.199-.854-1.763-.555-2.261-.366-.831.315-1.668.92-1.776 1.864-.414 3.608-.333 7.298-.281 10.941a24.5 24.5 0 0 0-5.824-8.907c-4.452-4.358-10.229-7.078-16.35-8.081-15.088-2.474-30.095 5.023-40.983 14.93-5.496 5-10.175 10.922-14.464 16.966-4.321 6.09-8.338 12.404-12.088 18.86a260.7 260.7 0 0 0-19.142 40.627 260 260 0 0 0-7.575 24.05 258 258 0 0 0-2.849 12.03c-.902 4.263-1.789 8.518-2.073 12.872-.117 1.816 2.405 1.957 3.588 1.728"
              fill="#231F20"
            />
          </svg>
        </Show>
      </div>
    </ShopItem>
  )
}

function MaterialUpgradeButton(props: {
  material: Material
  item: TileItem
  path: Path
}) {
  const run = useRunState()
  const deck = useDeckState()
  const t = useTranslation()

  return (
    <div class={materialUpgradeClass({ hue: hueFromMaterial(props.material) })}>
      <div class={materialUpgradeBlockClass}>
        <BasicTile
          cardId={props.item.cardId}
          material={props.material}
          width={30}
        />
        <div
          class={materialUpgradeTextClass({
            hue: hueFromMaterial(props.material),
          })}
        >
          <span
            class={materialUpgradeTitleClass({
              hue: hueFromMaterial(props.material),
            })}
          >
            {t.material[props.material]()}
          </span>
          <MaterialExplanationDescription material={props.material} />
        </div>
      </div>
      <ShopButton
        type="button"
        hue={hueFromMaterial(props.material)}
        disabled={false}
        onPointerDown={() => {
          upgradeTile({ run, item: props.item, deck, path: props.path })
        }}
      >
        <Buy />
        {t.shop.upgrade.button()}
      </ShopButton>
    </div>
  )
}

function DeckArea() {
  const deck = useDeckState()
  const t = useTranslation()
  const totalPairs = createMemo(() => deck.all.length * 2)

  return (
    <div class={areaClass({ hue: "dot", full: true })}>
      <div class={areaTitleClass({ hue: "dot" })}>
        {t.common.yourDeck()}
        {" ("}
        {totalPairs()}
        {" / "}
        {DECK_CAPACITY}
        {")"}
      </div>
      <Deck size={0.75} />
    </div>
  )
}

export function Deck(props: { size: number }) {
  const deck = useDeckState()
  const levels = useLevels()

  const order = createMemo(() =>
    levels().reduce(
      (acc, level, index) => {
        for (const item of level.tileItems) {
          const card = getCard(item.cardId)
          if (!(card.suit in acc)) {
            acc[card.suit] = index
          }
        }
        return acc
      },
      {} as Record<Suit, number>,
    ),
  )

  const sortedDeck = createMemo(() =>
    sortBy(
      deck.all,
      [
        (tile) => {
          const card = getCard(tile.cardId)
          return order()[card.suit]
        },
        "asc",
      ],
      [(tile) => getCard(tile.cardId).suit, "asc"],
      [(tile) => getCard(tile.cardId).rank, "asc"],
    ),
  )

  return (
    <div class={deckRowsClass}>
      <Key each={sortedDeck()} by={(deckTile) => deckTile.id}>
        {(deckTile, i) => (
          <DeckTileComponent
            deckTile={deckTile()}
            zIndex={i()}
            size={props.size}
          />
        )}
      </Key>
    </div>
  )
}

function Items() {
  const run = useRunState()
  const t = useTranslation()
  const levels = useLevels()
  const items = createMemo(() => generateItems(run, levels()), {
    equals: isDeepEqual,
  })
  const rerollDisabled = createMemo(() => REROLL_COST > run.money)

  function reroll() {
    const money = run.money
    if (REROLL_COST > money) throw Error("You don't have enough money")

    batch(() => {
      run.tutorialStep = run.tutorialStep! + 1
      const freeze = run.freeze

      if (freeze && !freeze.active) {
        run.freeze = undefined
      }

      run.money = money - REROLL_COST
      run.reroll++
    })

    play("dice")
    setTimeout(() => {
      play("coin2")
    }, 100)
    captureEvent("reroll", { reroll: run.reroll })
  }

  function freeze() {
    run.tutorialStep = run.tutorialStep! + 1
    play("freeze")

    if (run.freeze) {
      run.freeze.active = !run.freeze.active
      return
    }

    run.freeze = {
      round: run.round,
      reroll: run.reroll,
      active: true,
    }
    captureEvent("freeze", { reroll: run.reroll })
  }

  return (
    <div class={areaClass({ hue: "crack" })}>
      <div class={areaTitleClass({ hue: "crack" })}>
        <span class={areaTitleTextClass}>{t.shop.buyTiles()}</span>
        <span class={areaTitleTextClass}>
          {t.common.coins()}
          <span class={coinsClass}>${run.money}</span>
        </span>
      </div>
      <div class={shopItemsClass}>
        <Key each={items()} by={(item) => item.id}>
          {(tileItem) => <ItemTile item={tileItem()} />}
        </Key>
        <RerollButton
          onPointerDown={reroll}
          disabled={rerollDisabled()}
          cost={REROLL_COST}
        />
        <FreezeButton onPointerDown={freeze} />
      </div>
      <Show when={run.tutorialStep === 1}>
        <svg
          width="90"
          height="168"
          viewBox="0 0 118 168"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class={shop1ArrowClass}
        >
          <path
            d="M68.11 48.513c16.103 13.974 29.617 34.795 36.728 54.83 4.032 11.362 5.893 23.444 6.836 35.433.489 6.208.686 12.383.557 18.607-.037 1.807-1.676 9.243-.079 10.217 5.372 3.274 5.917-24.011 5.765-26.952-.643-12.439-1.911-25.029-5.607-36.963-6.199-20.02-17.044-40.926-31.837-55.923C71.86 39.03 63.32 30.19 52.86 23.455a83.3 83.3 0 0 0-13.92-7.22c-3.433-1.386-6.981-2.718-10.567-3.656-2.656-.695-6.423-.226-8.814-1.315 3.37-3.234 9.766-3.515 13.504-6.604C37.509.987 32.938-.503 29.167.181c-6 1.089-11.764 3.172-17.577 4.962C6.637 6.669-.064 7.423.468 13.74c.467 5.547 3.127 11.068 4.73 16.328 1.07 3.517 1.584 11.722 5.736 13.138C23.91 47.63 9.739 21.217 9.562 18.992c2.162.16 4.395 1.419 6.531 1.952 3.09.77 6.256 1.09 9.345 1.875 5.824 1.48 11.665 3.653 17.078 6.256C51.904 33.591 61.27 40.68 68.11 48.513c-.989-1.133 5.826 5.055 0 0"
            fill="#222221"
          />
        </svg>
      </Show>
    </div>
  )
}

function Header() {
  const run = useRunState()
  const deck = useDeckState()
  const t = useTranslation()
  const tiles = useTileState()
  const game = useGameState()
  const roundId = createMemo(() => `${run.runId}-${run.round}`)

  function continueRun() {
    batch(() => {
      run.stage = "game"
      run.round += 1
      initializeTileState(roundId(), deck.all, tiles)
      setMutable(game, initialGameState(roundId()))
    })
  }

  return (
    <div class={shopHeaderClass}>
      <div class={shopHeaderItemsClass}>
        <Menu />
      </div>

      <div class={continueClass}>
        <ShopButton hue="bone" onPointerDown={continueRun}>
          {t.common.roundN({ round: run.round + 1 })}
          <ArrowRight />
        </ShopButton>
      </div>
    </div>
  )
}

function ShopItem(
  props: {
    frozen?: boolean
    cost: number
    disabled: boolean
    selected: boolean
    onPointerDown?: () => void
    sudo?: boolean
  } & ParentProps,
) {
  return (
    <button
      type="button"
      onMouseEnter={() =>
        !props.disabled && props.onPointerDown && onHoverTile()
      }
      class={shopItemClass({
        disabled: props.disabled,
        hoverable: !!props.onPointerDown,
        selected: props.selected,
        frozen: props.frozen,
        sudo: props.sudo,
      })}
      onPointerDown={props.onPointerDown}
      style={assignInlineVars({
        [rotation]: `${5 - Math.random() * 10}deg`,
      })}
    >
      <div class={shopItemContentClass}>{props.children}</div>
      <div class={coinsClass}>${props.cost}</div>
    </button>
  )
}

function Tutorial() {
  const t = useTranslation()
  const run = useRunState()

  function onPointerDown() {
    run.tutorialStep = run.tutorialStep! + 1
  }

  return (
    <Switch>
      <Match when={run.tutorialStep === 1}>
        <div class={tutorialClass} onPointerDown={onPointerDown}>
          <p innerHTML={t.tutorial.shop1({ crackClass })} />
        </div>
      </Match>
      <Match when={run.tutorialStep === 2}>
        <div class={tutorialClass} onPointerDown={onPointerDown}>
          <p innerHTML={t.tutorial.shop2({ bamClass })} />
        </div>
      </Match>
      <Match when={run.tutorialStep === 3}>
        <div class={tutorialClass} onPointerDown={onPointerDown}>
          <p innerHTML={t.tutorial.shop3({ dotClass })} />
        </div>
      </Match>
      <Match when={run.tutorialStep === 4}>
        <div class={tutorialClass} onPointerDown={onPointerDown}>
          <p innerHTML={t.tutorial.material1()} />
          <MaterialTutorial />
        </div>
      </Match>
    </Switch>
  )
}

function MaterialTutorial() {
  const tileSize = useSmallerTileSize(0.7)

  return (
    <>
      <div class={cardRowClass}>
        <BasicTile
          cardId="dot1"
          width={tileSize().width}
          style={{ transform: "rotate(5deg)" }}
        />
        +
        <BasicTile
          cardId="dot1"
          width={tileSize().width}
          style={{ transform: "rotate(5deg)" }}
        />
        +
        <BasicTile
          cardId="dot1"
          width={tileSize().width}
          style={{ transform: "rotate(5deg)" }}
        />
        =
        <BasicTile
          cardId="dot1"
          material="topaz"
          width={tileSize().width}
          style={{ transform: "rotate(5deg)" }}
        />
      </div>
      <div class={cardRowClass}>
        <BasicTile
          cardId="dot1"
          material="topaz"
          width={tileSize().width}
          style={{ transform: "rotate(5deg)" }}
        />
        +
        <BasicTile
          cardId="dot1"
          material="topaz"
          width={tileSize().width}
          style={{ transform: "rotate(5deg)" }}
        />
        +
        <BasicTile
          cardId="dot1"
          material="topaz"
          width={tileSize().width}
          style={{ transform: "rotate(5deg)" }}
        />
        =
        <BasicTile
          cardId="dot1"
          material="sapphire"
          width={tileSize().width}
          style={{ transform: "rotate(5deg)" }}
        />
      </div>
    </>
  )
}
