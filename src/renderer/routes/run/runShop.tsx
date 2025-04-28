import { play } from "@/components/audio"
import { ShopButton } from "@/components/button"
import { LinkButton } from "@/components/button"
import { BasicTile } from "@/components/game/basicTile"
import {
  CardPoints,
  CardVideo,
  Explanation,
  MaterialCoins,
  MaterialFreedom,
} from "@/components/game/tileDetails"
import { ArrowRight, Buy, Dices, Freeze, Home, X } from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import {
  type DeckTile,
  type Material,
  type Suit,
  cardName,
  getCard,
} from "@/lib/game"
import { captureEvent } from "@/lib/observability"
import { useSmallerTileSize } from "@/state/constants"
import { useDeckState } from "@/state/deckState"
import { generateRound, useRunState } from "@/state/runState"
import {
  type DeckTileItem,
  type Path,
  REROLL_COST,
  type TileItem,
  buyTile,
  generateItems,
  getNextMaterial,
  isTile,
  itemCost,
  upgradeTile,
  useShopState,
} from "@/state/shopState"
import { hueFromMaterial } from "@/styles/colors"
import { Dialog } from "@kobalte/core/dialog"
import { Key } from "@solid-primitives/keyed"
import { assignInlineVars } from "@vanilla-extract/dynamic"
import { isDeepEqual } from "remeda"
import {
  For,
  Match,
  type ParentProps,
  Show,
  Switch,
  batch,
  createEffect,
  createMemo,
  createSelector,
  on,
} from "solid-js"
import {
  areaClass,
  areaTitleClass,
  backgroundClass,
  buttonsClass,
  closeButtonClass,
  coinsClass,
  continueClass,
  deckItemClass,
  deckRowsClass,
  detailTitleClass,
  dialogContentClass,
  dialogOverlayClass,
  dialogPositionerClass,
  materialUpgradeBlockClass,
  materialUpgradeClass,
  materialUpgradeTextClass,
  materialUpgradeTitleClass,
  materialUpgradesClass,
  modalDetailsClass,
  modalDetailsContentClass,
  pairClass,
  rotation,
  shopClass,
  shopContainerClass,
  shopHeaderClass,
  shopHeaderItemClass,
  shopHeaderItemsClass,
  shopItemButtonClass,
  shopItemClass,
  shopItemContentClass,
  shopItemsClass,
  upgradeDescriptionClass,
  upgradeTitleClass,
  videoContainerClass,
} from "./runShop.css"

const DECK_CAPACITY = 165

export default function RunShop() {
  const shop = useShopState()

  createEffect(
    on(
      () => shop.currentItem,
      () => play("click"),
    ),
  )

  return (
    <div class={backgroundClass}>
      <div class={shopClass}>
        <Header />
        <Items />
        <Deck />
        <Show when={shop.currentItem}>
          {(currentItem) => (
            <Dialog
              defaultOpen
              onOpenChange={() => {
                shop.currentItem = null
              }}
            >
              <Dialog.Portal>
                <Dialog.Overlay class={dialogOverlayClass} />
                <div class={dialogPositionerClass}>
                  <Switch>
                    <Match when={currentItem()?.type === "tile"}>
                      <TileItemDetails item={currentItem() as TileItem} />
                    </Match>
                    <Match when={currentItem()?.type === "deckTile"}>
                      <CardDetails
                        item={currentItem() as DeckTileItem}
                        material={(currentItem() as DeckTileItem).material}
                      />
                    </Match>
                  </Switch>
                </div>
              </Dialog.Portal>
            </Dialog>
          )}
        </Show>
      </div>
    </div>
  )
}

function DeckTileComponent(props: {
  deckTile: DeckTile
  zIndex: number
}) {
  const tileSize = useSmallerTileSize(0.75)
  const shop = useShopState()

  function onClick() {
    const deckTile = props.deckTile
    const cardId = deckTile.cardId

    shop.currentItem = {
      id: deckTile.id,
      type: "deckTile",
      cardId,
      material: deckTile.material,
    }
  }

  return (
    <div
      class={deckItemClass}
      style={{
        "z-index": props.zIndex,
      }}
      onMouseEnter={() => play("click2")}
      onClick={onClick}
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

export function ItemTile(props: {
  item: TileItem
  selected: boolean
  onClick?: (item: TileItem) => void
}) {
  const run = useRunState()
  const deck = useDeckState()
  const frozen = createMemo(() => run.freeze?.active)
  const cost = createMemo(() => itemCost(props.item))
  const tileSize = useSmallerTileSize(0.75)

  const disabled = createMemo(
    () => frozen() || cost() > run.money || deck.size >= DECK_CAPACITY,
  )

  return (
    <ShopItem
      frozen={frozen()}
      cost={cost()}
      disabled={disabled()}
      selected={props.selected}
      onClick={props.onClick ? () => props.onClick?.(props.item) : undefined}
    >
      <BasicTile
        cardId={props.item.cardId}
        width={tileSize().width}
        style={{
          transform: `translate(${-tileSize().sideSize}px, ${-tileSize().sideSize}px)`,
        }}
      />
      <BasicTile
        class={pairClass}
        cardId={props.item.cardId}
        width={tileSize().width}
      />
    </ShopItem>
  )
}

function CardDetails(props: {
  item: TileItem | DeckTileItem
  material: Material
}) {
  const cardId = createMemo(() => props.item.cardId)
  const shop = useShopState()
  const run = useRunState()
  const deck = useDeckState()
  const t = useTranslation()

  return (
    <Dialog.Content class={dialogContentClass({ type: "tile" })}>
      <CloseButton />
      <div class={modalDetailsClass}>
        <BasicTile cardId={cardId()} material={props.material} />
        <div class={modalDetailsContentClass}>
          <div class={detailTitleClass}>
            {cardName(t, cardId())}{" "}
            <Show when={props.material !== "bone"}>
              ({t.material[props.material]()})
            </Show>
          </div>
          <CardPoints cardId={cardId()} material={props.material} />
          <MaterialCoins material={props.material} />
          <MaterialFreedom material={props.material} />
          <Explanation cardId={cardId()} />
          <CardVideo
            suit={getCard(cardId()).suit}
            class={videoContainerClass}
          />
        </div>
      </div>
      <div class={buttonsClass}>
        <Show when={isTile(props.item)}>
          {(item) => (
            <ShopButton
              type="button"
              hue="bam"
              disabled={itemCost(item()) > run.money}
              onClick={() => {
                buyTile({ run, shop, item: item(), deck })
              }}
            >
              <Buy />
              {t.common.buy()} ${itemCost(item())}
            </ShopButton>
          )}
        </Show>
      </div>
    </Dialog.Content>
  )
}

function TileItemDetails(props: { item: TileItem }) {
  const deck = useDeckState()
  const t = useTranslation()

  const item = createMemo(() => props.item)
  const tilesWithSameCard = createMemo(() =>
    deck.filterBy({ cardId: item().cardId }),
  )
  const upgrades = createMemo(() =>
    getCard(item().cardId).colors.map((color) => ({
      path: color,
      material: getNextMaterial(tilesWithSameCard(), color),
    })),
  )
  const isUpgrading = createMemo(() =>
    upgrades().some((upgrade) => upgrade.material !== "bone"),
  )

  return (
    <Show
      when={isUpgrading()}
      fallback={<CardDetails item={item()} material="bone" />}
    >
      <Dialog.Content class={dialogContentClass({ type: "tileUpgrade" })}>
        <CloseButton />
        <div class={modalDetailsContentClass}>
          <div class={upgradeDescriptionClass}>
            <h2 class={upgradeTitleClass}>{t.shop.upgrade.title()}</h2>
            {t.shop.upgrade.description()}
          </div>
          <div class={materialUpgradesClass}>
            <For each={upgrades()}>
              {({ material, path }) => (
                <MaterialUpgradeButton
                  material={material}
                  item={item()}
                  path={path}
                />
              )}
            </For>
          </div>
        </div>
      </Dialog.Content>
    </Show>
  )
}

export function RerollButton(props: {
  onClick?: () => void
  cost: number
  disabled: boolean
}) {
  return (
    <ShopItem
      cost={props.cost}
      onClick={props.onClick}
      disabled={props.disabled}
      selected={false}
    >
      <div class={shopItemButtonClass({ hue: "bam" })}>
        <Dices />
      </div>
    </ShopItem>
  )
}

export function FreezeButton(props: { onClick?: () => void }) {
  const run = useRunState()
  return (
    <ShopItem
      cost={0}
      onClick={props.onClick}
      disabled={false}
      selected={!!run.freeze?.active}
    >
      <div class={shopItemButtonClass({ hue: "dot" })}>
        <Freeze />
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
  const shop = useShopState()
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
          <Switch>
            <Match
              when={
                props.material === "quartz" || props.material === "obsidian"
              }
            >
              TODO: stop the time
            </Match>
            <Match
              when={props.material === "jade" || props.material === "emerald"}
            >
              {t.shop.upgrade.morePoints()}
            </Match>
            <Match
              when={props.material === "garnet" || props.material === "ruby"}
            >
              {t.shop.upgrade.getCoins()}
            </Match>
            <Match
              when={props.material === "topaz" || props.material === "sapphire"}
            >
              {t.shop.upgrade.easierToMatch()}
            </Match>
          </Switch>
        </div>
      </div>
      <ShopButton
        type="button"
        hue={hueFromMaterial(props.material)}
        disabled={false}
        onClick={() => {
          upgradeTile({ run, shop, item: props.item, deck, path: props.path })
        }}
      >
        <Buy />
        {t.shop.upgrade.button()}
      </ShopButton>
    </div>
  )
}

function Deck() {
  const deck = useDeckState()
  const t = useTranslation()
  const totalPairs = createMemo(() => deck.all.length * 2)

  const sortedDeck = createMemo(() =>
    deck.all.sort((a, b) => {
      const cardA = getCard(a.cardId)
      const cardB = getCard(b.cardId)
      const suitA = cardA.suit
      const suitB = cardB.suit
      if (suitA !== suitB) {
        const suitOrder: Suit[] = [
          "b",
          "c",
          "o",
          "t",
          "w",
          "d",
          "r",
          "f",
          "p",
          "m",
          "j",
          "e",
          "g",
          "a",
        ]
        return suitOrder.indexOf(suitA) - suitOrder.indexOf(suitB)
      }
      return cardA.rank.localeCompare(cardB.rank)
    }),
  )

  return (
    <div class={areaClass({ hue: "dot" })}>
      <div class={areaTitleClass({ hue: "dot" })}>
        {t.common.deck()}
        {" ("}
        {totalPairs()}
        {" / "}
        {DECK_CAPACITY}
        {")"}
      </div>
      <div class={deckRowsClass}>
        <Key each={sortedDeck()} by={(deckTile) => deckTile.id}>
          {(deckTile, i) => (
            <DeckTileComponent deckTile={deckTile()} zIndex={i()} />
          )}
        </Key>
      </div>
    </div>
  )
}

function Items() {
  const run = useRunState()
  const shop = useShopState()
  const t = useTranslation()
  const items = createMemo(() => generateItems(run, shop), {
    equals: isDeepEqual,
  })
  const rerollDisabled = createMemo(() => REROLL_COST > run.money)
  const isSelected = createSelector(() => shop.currentItem?.id)

  createEffect(() => {
    console.log(JSON.stringify(items(), null, 2))
  })

  function selectItem(item: TileItem | null) {
    if (item?.id === shop.currentItem?.id) {
      shop.currentItem = null
    } else {
      shop.currentItem = item
    }
  }

  function reroll() {
    const money = run.money
    if (REROLL_COST > money) throw Error("You don't have enough money")

    batch(() => {
      const freeze = run.freeze

      if (freeze && !freeze.active) {
        run.freeze = undefined
      }

      run.money = money - REROLL_COST
      shop.reroll++
    })

    play("dice")
    setTimeout(() => {
      play("coin2")
    }, 100)
    captureEvent("reroll", { reroll: shop.reroll })
  }

  function freeze() {
    play("freeze")

    if (run.freeze) {
      run.freeze.active = !run.freeze.active
      return
    }

    run.freeze = {
      round: run.round,
      reroll: shop.reroll,
      active: true,
    }
    captureEvent("freeze", { reroll: shop.reroll })
  }

  return (
    <div class={shopContainerClass}>
      <div class={areaTitleClass({ hue: "bam" })}>{t.common.shop()}</div>
      <div class={shopItemsClass}>
        <Key each={items()} by={(item) => item.id}>
          {(tileItem) => (
            <ItemTile
              item={tileItem()}
              selected={isSelected(tileItem().id as any)}
              onClick={selectItem}
            />
          )}
        </Key>
        <RerollButton
          onClick={reroll}
          disabled={rerollDisabled()}
          cost={REROLL_COST}
        />
        <FreezeButton onClick={freeze} />
      </div>
    </div>
  )
}

function Header() {
  const run = useRunState()
  const t = useTranslation()
  const nextRound = createMemo(() => generateRound(run.round, run))

  function continueRun() {
    run.stage = "game"
  }

  return (
    <div class={shopHeaderClass}>
      <div class={shopHeaderItemsClass}>
        <LinkButton hue="dot" href="/">
          <Home />
        </LinkButton>
      </div>

      <div class={shopHeaderItemsClass}>
        <div class={shopHeaderItemClass({ hue: "gold" })}>
          {t.common.coins()}
          <span class={coinsClass}>${run.money}</span>
        </div>
      </div>
      <div class={continueClass}>
        <ShopButton hue="bone" onClick={continueRun}>
          {t.common.roundN({ round: nextRound().id })}
          <ArrowRight />
        </ShopButton>
      </div>
    </div>
  )
}

function CloseButton() {
  const shop = useShopState()

  return (
    <Dialog.CloseButton
      class={closeButtonClass}
      onClick={() => {
        shop.currentItem = null
      }}
    >
      <X />
    </Dialog.CloseButton>
  )
}

function ShopItem(
  props: {
    frozen?: boolean
    cost: number
    disabled: boolean
    selected: boolean
    onClick?: () => void
  } & ParentProps,
) {
  return (
    <button
      type="button"
      onMouseEnter={() => !props.disabled && props.onClick && play("click2")}
      class={shopItemClass({
        disabled: props.disabled,
        hoverable: !!props.onClick,
        selected: props.selected,
        frozen: props.frozen,
      })}
      onClick={props.onClick}
      style={assignInlineVars({
        [rotation]: `${5 - Math.random() * 10}deg`,
      })}
    >
      <div class={shopItemContentClass}>{props.children}</div>
      <div class={coinsClass}>${props.cost}</div>
    </button>
  )
}
