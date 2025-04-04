import {
  generateRound,
  useRunState,
  DECK_CAPACITY_PER_LEVEL,
} from "@/state/runState"
import { Dialog } from "@kobalte/core/dialog"
import { assignInlineVars } from "@vanilla-extract/dynamic"

import {
  batch,
  createEffect,
  createMemo,
  For,
  Match,
  on,
  Show,
  Switch,
  type ParentProps,
} from "solid-js"
import {
  continueClass,
  deckClass,
  deckItemClass,
  deckRowsClass,
  shopItemsClass,
  shopClass,
  detailTitleClass,
  detailTermClass,
  detailDescriptionClass,
  detailListClass,
  deckTitleClass,
  pillClass,
  buttonsClass,
  dialogContentClass,
  materialUpgradeClass,
  materialUpgradeTitleClass,
  modalDetailsClass,
  emperorDetailsTitleClass,
  emperorDetailsDescriptionClass,
  ownedEmperorsClass,
  ownedEmperorsTitleClass,
  ownedEmperorsListClass,
  MINI_TILE_SIZE,
  emptyEmperorClass,
  dialogOverlayClass,
  dialogPositionerClass,
  modalDetailsContentClass,
  upgradeTitleClass,
  upgradeDescriptionClass,
  fullExplanationClass,
  materialUpgradesClass,
  shopHeaderItemsClass,
  shopHeaderItemClass,
  propertiesClass,
  backgroundClass,
  shopHeaderTitleClass,
  closeButtonClass,
  shopItemClass,
  shopItemContentClass,
  shopItemCostClass,
  rotation,
  emperorClass,
  modalEmperorClass,
  upgradeCardPreviewClass,
  shopHeaderClass,
} from "./runShop.css"
import {
  generateItems,
  type Item,
  type TileItem,
  ShopStateProvider,
  createShopState,
  useShopState,
  itemCost,
  buyItem,
  type UpgradeItem,
  getNextMaterial,
  getTransformation,
  type EmperorItem,
  sellEmperor,
  SELL_EMPEROR_AMOUNT,
  generateShopItems,
  maxEmperors,
  emperorCost,
  type Path,
  type DeckTileItem,
  isTile,
} from "@/state/shopState"
import { BasicTile } from "@/components/game/basicTile"
import { useDeckState } from "@/state/deckState"
import {
  cardName,
  type Material,
  type DeckTile,
  getSuit,
  getRank,
  getMaterialMultiplier,
  getMaterialPoints,
  getMaterialCoins,
  type Level,
} from "@/lib/game"
import { ShopButton } from "@/components/button"
import {
  ArrowRight,
  Dices,
  Upgrade,
  X,
  Buy,
  Freeze,
  Coins,
  Star,
  Home,
} from "@/components/icon"
import { nanoid } from "nanoid"
import { shopUpgradeCost } from "@/state/runState"
import { chunk, entries, uniqueBy } from "remeda"
import {
  CardMultiplier,
  CardPoints,
  Explanation,
  MaterialCoins,
  MaterialFreedom,
} from "@/components/game/tileDetails"
import { play } from "@/components/audio"
import { captureEvent } from "@/lib/observability"
import { getSideSize, useTileSize } from "@/state/constants"
import { emperorName, getEmperors } from "@/state/emperors"
import { RunPickEmperor } from "./runPickEmperor"
import type { AccentHue } from "@/styles/colors"
import { LinkButton } from "@/components/button"
import { BasicEmperor } from "@/components/emperor"

const REROLL_COST = 10
const MAX_COLS = 12

export default function RunShop() {
  const run = useRunState()
  const shop = createShopState({ id: () => run.runId })

  return (
    <ShopStateProvider shop={shop}>
      <Shop />
    </ShopStateProvider>
  )
}

function Shop() {
  const shop = useShopState()
  const run = useRunState()
  const hasEmperor = createMemo(() => run.items.length > 0)
  const shouldPickEmperor = createMemo(() => !hasEmperor() && run.round === 1)

  createEffect(
    on(
      () => shop.currentItem,
      () => play("click"),
    ),
  )

  return (
    <Show when={!shouldPickEmperor()} fallback={<RunPickEmperor />}>
      <div class={backgroundClass}>
        <div class={shopClass}>
          <ShopHeader />
          <ShopItems />
          <div class={propertiesClass}>
            <OwnedEmperors />
            <Deck />
          </div>

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
                      <Match when={currentItem()?.type === "upgrade"}>
                        <UpgradeItemDetails />
                      </Match>
                      <Match when={currentItem()?.type === "emperor"}>
                        <EmperorItemDetails />
                      </Match>
                    </Switch>
                  </div>
                </Dialog.Portal>
              </Dialog>
            )}
          </Show>
        </div>
      </div>
    </Show>
  )
}

function DeckTileComponent(props: {
  deckTile: DeckTile
  zIndex: number
}) {
  const tileSize = useTileSize(0.75)
  const shop = useShopState()

  function onClick() {
    const deckTile = props.deckTile
    const card = deckTile.card

    shop.currentItem = {
      id: deckTile.id,
      type: "deckTile",
      card,
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
        card={props.deckTile.card}
        material={props.deckTile.material}
        width={tileSize().width}
      />
    </div>
  )
}

export function ItemTile(props: {
  item: TileItem
  onClick?: (item: TileItem) => void
}) {
  const run = useRunState()
  const deck = useDeckState()
  const frozen = createMemo(() => run.freeze?.active)

  const disabled = createMemo(
    () =>
      frozen() ||
      itemCost(props.item.level) > run.money ||
      deck.size >=
        DECK_CAPACITY_PER_LEVEL[
          run.shopLevel as keyof typeof DECK_CAPACITY_PER_LEVEL
        ],
  )

  return (
    <ShopItem
      hue="bone"
      frozen={frozen()}
      cost={itemCost(props.item.level)}
      disabled={disabled()}
      onClick={() => props.onClick?.(props.item)}
    >
      <img src={`/tiles/xs/${props.item.card}.webp`} alt={props.item.card} />
    </ShopItem>
  )
}

export function EmperorItemComponent(props: {
  item: EmperorItem
  onClick?: (item: EmperorItem) => void
}) {
  const run = useRunState()
  const frozen = createMemo(() => run.freeze?.active)
  const emperorCount = createMemo(
    () => run.items.filter((item) => item.type === "emperor").length,
  )
  const disabled = createMemo(
    () =>
      frozen() ||
      emperorCost(props.item.level) > run.money ||
      emperorCount() >= maxEmperors(run),
  )

  return (
    <ShopItem
      hue="wood"
      frozen={frozen()}
      cost={emperorCost(props.item.level)}
      disabled={disabled()}
      onClick={() => props.onClick?.(props.item)}
    >
      <img
        src={`/occupations/m/${props.item.name}.webp`}
        alt={props.item.name}
      />
    </ShopItem>
  )
}

function CardDetails(props: {
  item: TileItem | DeckTileItem
  material: Material
}) {
  const card = createMemo(() => props.item.card)
  const shop = useShopState()
  const run = useRunState()
  const deck = useDeckState()

  function buyTile(item: TileItem) {
    buyItem(run, shop, item, () => {
      const id = nanoid()
      deck.set(id, { id, material: "bone", card: item.card })
    })
  }

  return (
    <Dialog.Content class={dialogContentClass({ type: "tile" })}>
      <CloseButton />
      <div class={modalDetailsClass}>
        <BasicTile card={card()} material={props.material} />
        <div class={modalDetailsContentClass}>
          <div class={detailTitleClass}>
            {cardName(card())}{" "}
            <Show when={props.material !== "bone"}>({props.material})</Show>
          </div>
          <CardPoints card={card()} material={props.material} />
          <CardMultiplier card={card()} material={props.material} />
          <MaterialFreedom material={props.material} />
          <MaterialCoins material={props.material} />
          <Explanation card={card()} />
        </div>
      </div>
      <div class={buttonsClass}>
        <Show when={isTile(props.item)}>
          {(item) => (
            <ShopButton
              type="button"
              hue="bam"
              disabled={itemCost(item().level) > run.money}
              onClick={() => {
                buyTile(item())
              }}
            >
              <Buy />
              buy ${itemCost(item().level)}
            </ShopButton>
          )}
        </Show>
      </div>
    </Dialog.Content>
  )
}

function TileItemDetails(props: { item: TileItem }) {
  const deck = useDeckState()

  const item = createMemo(() => props.item)
  const tilesWithSameCard = createMemo(() =>
    deck.filterBy({ card: item().card }),
  )
  const freedomUpgrade = createMemo(() =>
    getNextMaterial(tilesWithSameCard(), "freedom"),
  )
  const pointsUpgrade = createMemo(() =>
    getNextMaterial(tilesWithSameCard(), "points"),
  )
  const coinsUpgrade = createMemo(() =>
    getNextMaterial(tilesWithSameCard(), "coins"),
  )
  const isUpgrading = createMemo(
    () =>
      freedomUpgrade() !== "bone" ||
      pointsUpgrade() !== "bone" ||
      coinsUpgrade() !== "bone",
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
            <h2 class={upgradeTitleClass}>Upgrade available!</h2>
            Collecting 3 identical pairs of tiles lets you upgrade them into a
            stronger version.
          </div>
          <div class={materialUpgradesClass}>
            <Show when={freedomUpgrade()}>
              {(material) => (
                <MaterialUpgradeButton
                  material={material()}
                  item={item()}
                  path="freedom"
                />
              )}
            </Show>
            <Show when={pointsUpgrade()}>
              {(material) => (
                <MaterialUpgradeButton
                  material={material()}
                  item={item()}
                  path="points"
                />
              )}
            </Show>
            <Show when={coinsUpgrade()}>
              {(material) => (
                <MaterialUpgradeButton
                  material={material()}
                  item={item()}
                  path="coins"
                />
              )}
            </Show>
          </div>
        </div>
      </Dialog.Content>
    </Show>
  )
}

function EmperorItemDetails() {
  const shop = useShopState()
  const run = useRunState()
  const item = createMemo(() => shop.currentItem as EmperorItem)
  const emperor = createMemo(
    () => getEmperors().find((emperor) => emperor.name === item().name)!,
  )
  const emperorCount = createMemo(
    () => run.items.filter((item) => item.type === "emperor").length,
  )
  const disabled = createMemo(
    () =>
      emperorCost(item().level) > run.money ||
      emperorCount() >= maxEmperors(run),
  )
  const isOwned = createMemo(() =>
    run.items.some((i) => i.id === item().id && i.type === "emperor"),
  )

  function buyEmperor() {
    buyItem(run, shop, item(), () => {})
  }

  function sellCurrentEmperor() {
    sellEmperor(run, shop, item())
  }

  return (
    <Dialog.Content class={dialogContentClass({ type: "emperor" })}>
      <CloseButton />
      <div class={modalDetailsClass}>
        <BasicEmperor name={item().name} class={modalEmperorClass} />
        <div class={modalDetailsContentClass}>
          <div class={emperorDetailsTitleClass}>{emperorName(item().name)}</div>

          <div class={emperorDetailsDescriptionClass}>
            {emperor().description()}
          </div>
        </div>
      </div>

      <div class={buttonsClass}>
        <Show
          when={isOwned()}
          fallback={
            <ShopButton
              type="button"
              hue="bam"
              disabled={disabled()}
              onClick={buyEmperor}
            >
              <Buy />
              recruit
            </ShopButton>
          }
        >
          <ShopButton type="button" hue="dot" onClick={sellCurrentEmperor}>
            <Buy />
            sell (${SELL_EMPEROR_AMOUNT})
          </ShopButton>
        </Show>
      </div>
    </Dialog.Content>
  )
}

function UpgradeItemDetails() {
  const run = useRunState()
  const shop = useShopState()
  const item = createMemo(() => shop.currentItem as UpgradeItem)
  const cost = createMemo(() => shopUpgradeCost(run))
  const disabled = createMemo(() => cost() > run.money)

  function buyUpgrade() {
    const money = run.money
    if (money < cost()) return

    batch(() => {
      run.money = money - cost()
      run.shopLevel = item().level
      shop.currentItem = null
    })
    play("coin2")
  }

  const tileItems = createMemo(() =>
    uniqueBy(
      generateShopItems().filter(
        (i) => i.type === "tile" && i.level === item().level,
      ) as TileItem[],
      (i) => i.card,
    ).sort((a, b) => a.card.localeCompare(b.card)),
  )
  const tileSize = useTileSize()
  const sideSize = createMemo(() => getSideSize(tileSize().height))

  return (
    <Dialog.Content class={dialogContentClass({ type: "upgrade" })}>
      <CloseButton />
      <div class={modalDetailsContentClass}>
        <div class={detailTitleClass}>Shop level {item().level}</div>
        <dl class={detailListClass({ type: "gold" })}>
          <dt class={detailTermClass}>yield per tiles:</dt>
          <dd class={detailDescriptionClass}>
            <span class={pillClass()}>${item().level}</span>{" "}
          </dd>
        </dl>
        <dl class={detailListClass({ type: "dot" })}>
          <dt class={detailTermClass}>deck capacity:</dt>
          <dd class={detailDescriptionClass}>
            {
              DECK_CAPACITY_PER_LEVEL[
                item().level as keyof typeof DECK_CAPACITY_PER_LEVEL
              ]
            }{" "}
            pairs
          </dd>
        </dl>
        <dl class={detailListClass({ type: "crack" })}>
          <dt class={detailTermClass}>crew capacity:</dt>
          <dd class={detailDescriptionClass}>{1 + item().level}</dd>
        </dl>
        <div class={detailListClass({ type: "bam" })}>
          <span class={detailTermClass}>new tiles:</span>
          <div
            class={deckRowsClass}
            style={{
              "padding-bottom": `${sideSize() * 2}px`,
              "padding-right": `${sideSize() * 2}px`,
            }}
          >
            <For each={chunk(tileItems(), 18)}>
              {(chunk, i) => (
                <div class={upgradeCardPreviewClass}>
                  <For each={chunk}>
                    {(item, j) => (
                      <BasicTile
                        card={item.card}
                        width={MINI_TILE_SIZE}
                        style={{ "z-index": i() * MAX_COLS + 9 + j() }}
                      />
                    )}
                  </For>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
      <div class={buttonsClass}>
        <ShopButton
          type="button"
          hue="bam"
          disabled={disabled()}
          onClick={buyUpgrade}
        >
          <Buy />
          buy (${cost()})
        </ShopButton>
      </div>
    </Dialog.Content>
  )
}

export function RerollButton(props: {
  onClick?: () => void
  disabled: boolean
}) {
  return (
    <ShopItem
      hue="diamond"
      cost={REROLL_COST}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      <Dices />
    </ShopItem>
  )
}

export function FreezeButton(props: { onClick?: () => void }) {
  return (
    <ShopItem hue="glass" cost={0} onClick={props.onClick} disabled={false}>
      <Freeze />
    </ShopItem>
  )
}

export function UpgradeButton(props: {
  onClick?: () => void
  cost: number
  disabled: boolean
}) {
  return (
    <ShopItem
      hue="bam"
      cost={props.cost}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      <Upgrade />
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

  const tilesWithSameCard = createMemo(() =>
    deck.filterBy({ card: props.item.card }),
  )
  const transformation = createMemo(() =>
    getTransformation(tilesWithSameCard(), props.path),
  )

  function upgradeTile(item: TileItem) {
    buyItem(run, shop, item, () => {
      const { updates, removes } = transformation()

      for (const [id, material] of entries(updates)) {
        deck.set(id, { id, material, card: item.card })
      }

      for (const id of removes) {
        deck.del(id)
      }
    })
    captureEvent("tile_upgraded", {
      material: props.material,
      card: props.item.card,
      path: props.path,
    })
  }

  return (
    <div class={materialUpgradeClass({ hue: props.material })}>
      <span class={materialUpgradeTitleClass({ material: props.material })}>
        <BasicTile
          card={props.item.card}
          material={props.material}
          width={30}
        />
        {props.material}
      </span>
      <dl class={detailListClass({ type: props.material })}>
        <dt class={detailTermClass}>Points</dt>
        <dd class={detailDescriptionClass}>
          +{getMaterialPoints(props.material) * 2}
        </dd>
        <Show when={getMaterialMultiplier(props.material)}>
          {(multiplier) => (
            <>
              <dt class={detailTermClass}>Multiplier</dt>
              <dd class={detailDescriptionClass}>+{multiplier() * 2}</dd>
            </>
          )}
        </Show>
        <dt class={detailTermClass}>Coins</dt>
        <dd class={detailDescriptionClass}>
          +{getMaterialCoins(props.material) * 2}
        </dd>
      </dl>

      <MaterialFreedom material={props.material} hue={props.material} />
      <ShopButton
        type="button"
        hue={props.material}
        disabled={false}
        onClick={() => {
          upgradeTile(props.item)
        }}
      >
        <Buy />
        upgrade
      </ShopButton>
    </div>
  )
}

function OwnedEmperors() {
  const run = useRunState()
  const shop = useShopState()

  const ownedEmperors = createMemo(
    () => run.items.filter((item) => item.type === "emperor") as EmperorItem[],
  )
  const capacity = createMemo(() => maxEmperors(run))
  const full = createMemo(() => ownedEmperors().length === capacity())

  function selectEmperor(emperor: EmperorItem) {
    shop.currentItem = emperor
  }

  return (
    <div class={ownedEmperorsClass}>
      <div class={ownedEmperorsTitleClass({ full: full() })}>
        Crew <Show when={full()}>is full</Show> ({ownedEmperors().length} /{" "}
        {capacity()})
      </div>
      <div class={ownedEmperorsListClass}>
        <For each={ownedEmperors()}>
          {(emperor) => (
            <BasicEmperor
              name={emperor.name}
              class={emperorClass}
              onClick={() => selectEmperor(emperor)}
            />
          )}
        </For>
        <For
          each={Array.from({
            length: maxEmperors(run) - ownedEmperors().length,
          })}
        >
          {() => <div class={emptyEmperorClass} />}
        </For>
      </div>
    </div>
  )
}

function Deck() {
  const run = useRunState()
  const deck = useDeckState()

  const sortedDeck = createMemo(() =>
    deck.all.sort((a, b) => {
      const suitA = getSuit(a.card)
      const suitB = getSuit(b.card)
      if (suitA !== suitB) {
        const suitOrder = ["b", "c", "o", "d", "w", "f", "s"]
        return suitOrder.indexOf(suitA) - suitOrder.indexOf(suitB)
      }
      return getRank(a.card).localeCompare(getRank(b.card))
    }),
  )
  const totalPairs = createMemo(() => deck.all.length)
  const shopLevel = createMemo(() => run.shopLevel)
  const capacity = createMemo(() => DECK_CAPACITY_PER_LEVEL[shopLevel()])

  return (
    <div class={deckClass}>
      <DeckTitle pairs={totalPairs()} capacity={capacity()} />
      <div class={deckRowsClass}>
        <For each={sortedDeck()}>
          {(deckTile, i) => (
            <DeckTileComponent deckTile={deckTile} zIndex={i()} />
          )}
        </For>
      </div>
    </div>
  )
}

function ShopItems() {
  const run = useRunState()
  const shop = useShopState()
  const shopLevel = createMemo(() => run.shopLevel)
  const items = createMemo(() => generateItems(run, shop))

  function selectItem(item: Item | null) {
    if (item?.id === shop.currentItem?.id) {
      shop.currentItem = null
    } else {
      shop.currentItem = item
    }
  }

  function reroll() {
    const cost = REROLL_COST
    const money = run.money
    if (cost > money) throw Error("You don't have enough money")

    batch(() => {
      const freeze = run.freeze

      if (freeze && !freeze.active) {
        run.freeze = undefined
      }

      run.money = money - cost
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

  function selectUpgrade(level: Level) {
    const item: UpgradeItem = {
      id: `upgrade-${level}`,
      type: "upgrade",
      level,
    }

    shop.currentItem = item
  }
  const upgradeCost = createMemo(() => shopUpgradeCost(run))
  const upgradeDisabled = createMemo(() => upgradeCost() > run.money)
  const rerollDisabled = createMemo(() => REROLL_COST > run.money)

  return (
    <div class={shopItemsClass}>
      <Show when={shopLevel() < 5}>
        <UpgradeButton
          onClick={() => selectUpgrade((shopLevel() + 1) as Level)}
          cost={upgradeCost()}
          disabled={upgradeDisabled()}
        />
      </Show>
      <For each={items()}>
        {(item) => (
          <Switch>
            <Match when={item.type === "tile" && item}>
              {(tileItem) => (
                <ItemTile item={tileItem()} onClick={selectItem} />
              )}
            </Match>
            <Match when={item.type === "emperor" && item}>
              {(emperorItem) => (
                <EmperorItemComponent
                  item={emperorItem()}
                  onClick={selectItem}
                />
              )}
            </Match>
          </Switch>
        )}
      </For>
      <RerollButton onClick={reroll} disabled={rerollDisabled()} />
      <FreezeButton onClick={freeze} />
    </div>
  )
}

function ShopHeader() {
  const run = useRunState()
  function continueRun() {
    batch(() => {
      run.round = run.round + 1
      run.stage = "select"
    })
  }
  const nextRound = createMemo(() => generateRound(run.round + 1, run))
  const shopLevel = createMemo(() => run.shopLevel)

  return (
    <div class={shopHeaderClass}>
      <div class={shopHeaderItemsClass}>
        <LinkButton hue="glass" href="/">
          <Home />
        </LinkButton>
        <h1 class={shopHeaderTitleClass}>Shop</h1>
      </div>

      <div class={shopHeaderItemsClass}>
        <div class={shopHeaderItemClass({ hue: "bam" })}>
          <Star />
          level {shopLevel()}
        </div>
        <CoinCounter money={run.money} />
      </div>
      <div class={continueClass}>
        <ShopButton hue="bone" onClick={continueRun}>
          Round {nextRound().id}
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
    hue: AccentHue
    frozen?: boolean
    cost: number
    disabled: boolean
    onClick?: () => void
  } & ParentProps,
) {
  return (
    <button
      type="button"
      onMouseEnter={() => !props.disabled && play("click2")}
      class={shopItemClass({
        disabled: props.disabled,
        hue: props.hue,
        frozen: props.frozen,
      })}
      onClick={props.onClick}
      style={assignInlineVars({
        [rotation]: `${5 - Math.random() * 10}deg`,
      })}
    >
      <div class={shopItemContentClass}>{props.children}</div>
      <div class={shopItemCostClass}>${props.cost}</div>
    </button>
  )
}

export function CoinCounter(props: { money: number }) {
  return (
    <div class={shopHeaderItemClass({ hue: "gold" })}>
      <Coins />
      c&zwnj;oins
      <span class={pillClass()}>${props.money}</span>
    </div>
  )
}

export function DeckTitle(props: { pairs: number; capacity: number }) {
  const full = createMemo(() => props.pairs === props.capacity)

  return (
    <div class={deckTitleClass({ full: full() })}>
      Deck
      <Show when={full()}> is full</Show> ({props.pairs}
      {" / "}
      {props.capacity})
      <Show when={full()}>
        <span class={fullExplanationClass({ hue: "bam" })}>
          Upgrade your shop to buy more tiles
        </span>
      </Show>
    </div>
  )
}
