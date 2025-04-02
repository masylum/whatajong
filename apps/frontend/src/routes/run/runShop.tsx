import {
  generateRound,
  useRunState,
  DECK_CAPACITY_PER_LEVEL,
} from "@/state/runState"
import { Dialog } from "@kobalte/core/dialog"
import { batch, createMemo, For, Match, Show, Switch } from "solid-js"
import {
  continueClass,
  deckClass,
  deckItemClass,
  deckRowClass,
  deckRowsClass,
  tileItemClass,
  shopItemsClass,
  pairClass,
  shopExtraClass,
  shopClass,
  detailTitleClass,
  detailTermClass,
  detailDescriptionClass,
  detailListClass,
  deckTitleClass,
  pillClass,
  buttonsClass,
  detailsContentClass,
  materialUpgradeClass,
  materialUpgradeTitleClass,
  emperorItemClass,
  modalDetailsClass,
  emperorDetailsTitleClass,
  emperorDetailsDescriptionClass,
  ownedEmperorsClass,
  ownedEmperorsTitleClass,
  ownedEmperorsListClass,
  MINI_TILE_SIZE,
  itemPairClass,
  shopHeaderClass,
  emptyEmperorClass,
  detailsOverlayClass,
  detailsPositionerClass,
  modalDetailsContentClass,
  upgradeTitleClass,
  upgradeDescriptionClass,
  fullExplanationClass,
  materialUpgradesClass,
  shopHeaderItemsClass,
  shopHeaderItemClass,
  emperorImageClass,
  propertiesClass,
  backgroundClass,
  emperorWrapperClass,
  shopHeaderTitleClass,
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
  type Card,
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
} from "@/components/icon"
import { nanoid } from "nanoid"
import { shopUpgradeCost } from "@/state/runState"
import { chunk, entries, uniqueBy } from "remeda"
import { BasicEmperor } from "@/components/emperor"
import {
  CardMultiplier,
  CardPoints,
  Explanation,
  MaterialCoins,
  MaterialFreedom,
} from "@/components/game/tileHover"
import { SOUNDS } from "@/components/audio"
import { play } from "@/components/audio"
import { useGlobalState } from "@/state/globalState"
import { captureEvent } from "@/lib/observability"
import { getSideSize, useTileSize } from "@/state/constants"
import { getEmperors } from "@/state/emperors"
import { RunPickEmperor } from "./runPickEmperor"

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

  return (
    <Show when={hasEmperor()} fallback={<RunPickEmperor />}>
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
                  <Dialog.Overlay class={detailsOverlayClass} />
                  <div class={detailsPositionerClass}>
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
    <>
      <div
        class={deckItemClass}
        style={{
          "z-index": props.zIndex,
        }}
        onClick={onClick}
      >
        <BasicTile
          card={props.deckTile.card}
          material={props.deckTile.material}
          width={tileSize().width}
        />
      </div>
    </>
  )
}

function ItemTile(props: {
  item: TileItem
  onClick?: (item: TileItem) => void
}) {
  const shop = useShopState()
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
  const material = createMemo(() => (frozen() ? "glass" : "bone"))
  const tileSize = useTileSize(0.9)
  const sideSize = createMemo(() => getSideSize(tileSize().height))

  return (
    <>
      <button
        class={tileItemClass({
          selected: shop.currentItem?.id === props.item.id,
          disabled: disabled(),
        })}
        type="button"
        disabled={disabled()}
        onClick={() => props.onClick?.(props.item)}
      >
        <div
          class={itemPairClass}
          style={{
            transform: `translate(-${sideSize()}px, -${sideSize()}px)`,
          }}
        >
          <BasicTile
            card={props.item.card}
            material={material()}
            width={tileSize().width}
          />
          <BasicTile
            style={{
              top: `${sideSize()}px`,
              left: `${sideSize()}px`,
            }}
            class={pairClass}
            card={props.item.card}
            material={material()}
            width={tileSize().width}
          />
        </div>
        <span
          class={pillClass({
            hue: frozen() ? "glass" : "gold",
          })}
        >
          ${itemCost(props.item.level)}
        </span>
      </button>
    </>
  )
}

function EmperorItemComponent(props: {
  item: EmperorItem
  onClick?: (item: EmperorItem) => void
  emperorCount: number
}) {
  const shop = useShopState()
  const run = useRunState()
  const frozen = createMemo(() => run.freeze?.active)
  const disabled = createMemo(
    () =>
      frozen() ||
      emperorCost(props.item.level) > run.money ||
      props.emperorCount >= maxEmperors(run),
  )
  const tileSize = useTileSize()

  return (
    <>
      <button
        class={emperorItemClass({
          selected: shop.currentItem?.id === props.item.id,
          disabled: disabled(),
        })}
        type="button"
        disabled={disabled()}
        onClick={() => props.onClick?.(props.item)}
      >
        <div class={emperorImageClass({ frozen: frozen() })}>
          <BasicEmperor
            name={props.item.name}
            style={{
              "max-height": `${tileSize().height}px`,
            }}
          />
        </div>
        <span
          class={pillClass({
            hue: frozen() ? "glass" : "gold",
          })}
        >
          ${emperorCost(props.item.level)}
        </span>
      </button>
    </>
  )
}

function CardDetails(props: {
  item: TileItem | DeckTileItem
  material: Material
}) {
  const card = createMemo(() => props.item.card)
  const shop = useShopState()
  const run = useRunState()
  const globalState = useGlobalState()
  const deck = useDeckState()

  function buyTile(item: TileItem) {
    buyItem(run, shop, item, globalState, () => {
      const id = nanoid()
      deck.set(id, { id, material: "bone", card: item.card })
    })
  }

  return (
    <Dialog.Content class={detailsContentClass({ type: "tile" })}>
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
              disabled={false}
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
  const shop = useShopState()
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
      <Dialog.Content class={detailsContentClass({ type: "tileUpgrade" })}>
        <Dialog.CloseButton onClick={() => (shop.currentItem = null)}>
          <X />
        </Dialog.CloseButton>
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
  const globalState = useGlobalState()
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
    buyItem(run, shop, item(), globalState, () => {})
  }

  function sellCurrentEmperor() {
    sellEmperor(run, shop, item())
  }

  return (
    <Dialog.Content class={detailsContentClass({ type: "emperor" })}>
      <div class={modalDetailsClass}>
        <BasicEmperor name={item().name} />
        <div class={modalDetailsContentClass}>
          <div class={emperorDetailsTitleClass}>
            {item().name.replaceAll("_", " ")}
          </div>

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
    <Dialog.Content class={detailsContentClass({ type: "upgrade" })}>
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
                <div class={deckRowClass}>
                  <For each={chunk}>
                    {(item, j) => (
                      <UpgradeCardPreview
                        card={item.card}
                        material={item.material}
                        zIndex={i() * MAX_COLS + 9 + j()}
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

function UpgradeCardPreview(props: {
  card: Card
  material: Material
  zIndex: number
}) {
  return (
    <BasicTile
      card={props.card}
      width={MINI_TILE_SIZE}
      style={{ "z-index": props.zIndex }}
    />
  )
}

function RerollButton() {
  const shop = useShopState()
  const run = useRunState()
  const globalState = useGlobalState()
  const disabled = createMemo(() => REROLL_COST > run.money)

  function reroll() {
    const cost = REROLL_COST
    const money = run.money
    if (cost > money) throw Error("You don't have enough money")

    batch(() => {
      const freeze = run.freeze

      if (freeze && !freeze.active) {
        run.freeze = undefined
      }

      run.money = money + cost
      shop.reroll++
    })

    play(SOUNDS.DICE, globalState.muted)
    captureEvent("reroll", { reroll: shop.reroll })
  }

  return (
    <div class={shopExtraClass({ disabled: disabled() })}>
      <ShopButton
        hue="dot"
        type="button"
        title="refresh items"
        onClick={reroll}
        disabled={disabled()}
      >
        <Dices />
      </ShopButton>
      <span class={pillClass()}>${REROLL_COST}</span>
    </div>
  )
}

function FreezeButton() {
  const shop = useShopState()
  const run = useRunState()
  const globalState = useGlobalState()

  function freeze() {
    play(SOUNDS.FREEZE, globalState.muted)

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
    <div class={shopExtraClass({ disabled: false })}>
      <ShopButton
        hue="glass"
        type="button"
        title="freeze items"
        onClick={freeze}
      >
        <Freeze />
      </ShopButton>
      <span class={pillClass()}>$0</span>
    </div>
  )
}

function UpgradeButton() {
  const run = useRunState()
  const shop = useShopState()
  const cost = createMemo(() => shopUpgradeCost(run))
  const disabled = createMemo(() => cost() > run.money)
  const shopLevel = createMemo(() => run.shopLevel)

  function selectUpgrade(level: Level) {
    console.log("selectUpgrade", level)
    const item: UpgradeItem = {
      id: `upgrade-${level}`,
      type: "upgrade",
      level,
    }

    shop.currentItem = item
  }

  return (
    <div class={shopExtraClass({ disabled: disabled() })}>
      <ShopButton
        hue="bam"
        type="button"
        title="upgrade shop"
        disabled={disabled()}
        onClick={() => selectUpgrade((shopLevel() + 1) as Level)}
      >
        <Upgrade />
      </ShopButton>
      <span class={pillClass()}>${shopUpgradeCost(run)}</span>
    </div>
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
  const globalState = useGlobalState()

  const tilesWithSameCard = createMemo(() =>
    deck.filterBy({ card: props.item.card }),
  )
  const transformation = createMemo(() =>
    getTransformation(tilesWithSameCard(), props.path),
  )

  function upgradeTile(item: TileItem) {
    buyItem(run, shop, item, globalState, () => {
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
            <div class={emperorWrapperClass}>
              <BasicEmperor
                name={emperor.name}
                onClick={() => selectEmperor(emperor)}
              />
            </div>
          )}
        </For>
        <For
          each={Array.from({
            length: maxEmperors(run) - ownedEmperors().length,
          })}
        >
          {() => (
            <div class={emperorWrapperClass}>
              <div class={emptyEmperorClass} />
            </div>
          )}
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
  const full = createMemo(() => totalPairs() === capacity())

  return (
    <div class={deckClass}>
      <div class={deckTitleClass({ full: full() })}>
        Deck
        <Show when={full()}> is full</Show> ({totalPairs()}
        {" / "}
        {capacity()})
        <Show when={full()}>
          <span class={fullExplanationClass({ hue: "bam" })}>
            Upgrade your shop to buy more tiles
          </span>
        </Show>
      </div>
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
  const emperorCount = createMemo(
    () => run.items.filter((item) => item.type === "emperor").length,
  )

  function selectItem(item: Item | null) {
    if (item?.id === shop.currentItem?.id) {
      shop.currentItem = null
    } else {
      shop.currentItem = item
    }
  }
  return (
    <div class={shopItemsClass}>
      <Show when={shopLevel() < 5}>
        <UpgradeButton />
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
                  emperorCount={emperorCount()}
                />
              )}
            </Match>
          </Switch>
        )}
      </For>
      <RerollButton />
      <FreezeButton />
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
        <h1 class={shopHeaderTitleClass}>Shop</h1>
        <div class={shopHeaderItemClass({ hue: "bam" })}>
          <Star />
          level
          <span class={pillClass({ hue: "bam" })}>{shopLevel()}</span>
        </div>
        <div class={shopHeaderItemClass({ hue: "gold" })}>
          <Coins />
          c&zwnj;oins
          <span class={pillClass()}>${run.money}</span>
        </div>
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
