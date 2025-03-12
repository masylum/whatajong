import { useRunState } from "@/state/runState"
import {
  batch,
  createMemo,
  createSelector,
  createSignal,
  For,
  Match,
  Show,
  Switch,
  type JSXElement,
} from "solid-js"
import {
  continueClass,
  deckClass,
  deckItemClass,
  deckRowClass,
  deckRowsClass,
  itemClass,
  itemCostClass,
  itemsClass,
  itemsContainerClass,
  itemTitleClass,
  pairClass,
  shopExtraClass,
  shopClass,
  detailsClass,
  titleClass,
  detailTitleClass,
  detailTermClass,
  detailDescriptionClass,
  detailListClass,
  detailInfoClass,
  statusClass,
  moneyClass,
  buttonsClass,
  buttonClass,
  detailsContentClass,
  itemsTitleClass,
  detailFreedomClass,
  detailFreedomTitleClass,
} from "./runShop.css"
import {
  generateItems,
  type Item,
  type MaterialItem,
  type TileItem,
  ShopStateProvider,
  createShopState,
  useShopState,
  ITEM_COST,
  buyItem,
  type UpgradeItem,
  TILE_ITEMS,
  MATERIAL_ITEMS,
  sellDeckTile,
} from "@/state/shopState"
import { DECK_SIZE_LEVEL } from "@repo/game/deck"
import { BasicTile } from "@/components/game/basicTile"
import { useDeckState } from "@/state/deckState"
import {
  type Card,
  type DeckTile,
  isDragon,
  isWind,
  getSuit,
  getRank,
  matchesSuit,
} from "@repo/game/deck"
import { cardName, suitName, type Material } from "@repo/game/tile"
import { Button } from "@/components/button"
import { ArrowRight, Dices, Upgrade, X, Buy } from "@/components/icon"
import { nanoid } from "nanoid"
import { shopUpgradeCost } from "@/state/runState"
import {
  getCardPoints,
  getMaterialPoints,
  getMaterialMultiplier,
  getCoins,
} from "@repo/game/game"
import { splitIntoRows } from "@/lib/splitIntoRows"
import { sortBy } from "remeda"

const REROLL_COST = 1
const MIN_ROWS = 4
const MIN_COLS = 9
const MAX_COLS = 12

export default function RunShop() {
  const run = useRunState()
  const shop = createShopState(run.get())

  return (
    <ShopStateProvider shop={shop}>
      <Shop />
    </ShopStateProvider>
  )
}

function Shop() {
  const run = useRunState()
  const deck = useDeckState()
  const shop = useShopState()

  const deckByRows = createMemo(() => {
    function sortDeckTiles(tiles: DeckTile[]) {
      return tiles.sort((a, b) => {
        const suitA = getSuit(a.card)
        const suitB = getSuit(b.card)
        if (suitA !== suitB) {
          const suitOrder = ["b", "c", "o", "d", "w", "f", "s"]
          return suitOrder.indexOf(suitA) - suitOrder.indexOf(suitB)
        }
        return getRank(a.card).localeCompare(getRank(b.card))
      })
    }

    return splitIntoRows(sortDeckTiles(deck.all), {
      minCols: MIN_COLS,
      maxCols: MAX_COLS,
      minRows: MIN_ROWS,
    })
  })

  const shopLevel = createMemo(() => run.get().shopLevel)
  const totalPairs = createMemo(() => deck.all.length)
  const items = createMemo(() => generateItems(run.get(), shop.reroll))

  function selectItem(item: Item | null) {
    batch(() => {
      if (item?.id === shop.currentItem?.id) {
        shop.currentItem = null
      } else {
        shop.currentItem = item
      }
      shop.currentDeckTile = null
    })
  }

  function continueRun() {
    run.set({
      round: run.get().round + 1,
      stage: "select",
    })
  }

  return (
    <div class={shopClass}>
      <h1 class={titleClass}>The parlor</h1>

      <div class={itemsContainerClass}>
        <div class={itemsTitleClass}>Shop (level {shopLevel()})</div>
        <div class={itemsClass}>
          <UpgradeButton />
          <For each={items()}>
            {(item) => (
              <Switch>
                <Match when={item.type === "material" && item}>
                  {(materialItem) => (
                    <ItemMaterial item={materialItem()} onClick={selectItem} />
                  )}
                </Match>
                <Match when={item.type === "tile" && item}>
                  {(tileItem) => (
                    <ItemTile item={tileItem()} onClick={selectItem} />
                  )}
                </Match>
              </Switch>
            )}
          </For>
          <RerollButton />
        </div>
      </div>

      <div class={deckClass}>
        <div class={statusClass}>
          <span>
            Your Deck ({totalPairs()} /{" "}
            {DECK_SIZE_LEVEL[(shopLevel() + 1) as keyof typeof DECK_SIZE_LEVEL]}{" "}
            pairs)
          </span>
          <span class={moneyClass}>${run.get().money} coins</span>
        </div>
        <div class={deckRowsClass}>
          <For each={deckByRows()}>
            {(deckTiles, i) => (
              <div class={deckRowClass}>
                <For each={deckTiles}>
                  {(deckTile, j) => (
                    <DeckTileComponent
                      deckTile={deckTile}
                      zIndex={i() * MAX_COLS + deckTiles.length - j()}
                    />
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
      </div>

      <div class={detailsClass}>
        <Show when={shop.currentDeckTile}>
          {(deckTile) => <TileDetails deckTile={deckTile()} />}
        </Show>
        <Show when={shop.currentItem}>
          {(currentItem) => (
            <Switch>
              <Match when={currentItem()?.type === "tile"}>
                <TileItemDetails />
              </Match>
              <Match when={currentItem()?.type === "material"}>
                <MaterialItemDetails />
              </Match>
              <Match when={currentItem()?.type === "upgrade"}>
                <UpgradeItemDetails />
              </Match>
            </Switch>
          )}
        </Show>
      </div>

      <div class={continueClass}>
        <Button hue="bamboo" onClick={continueRun}>
          Next Game
          <ArrowRight />
        </Button>
      </div>
    </div>
  )
}

function DeckTileComponent(props: {
  deckTile: DeckTile
  zIndex: number
}) {
  const shop = useShopState()

  function onClickDeckTile(deckTile: DeckTile) {
    batch(() => {
      shop.currentItem = null

      if (shop.currentDeckTile?.id === deckTile.id) {
        shop.currentDeckTile = null
      } else {
        shop.currentDeckTile = deckTile
      }
    })
  }

  return (
    <div
      class={deckItemClass({
        selected: shop.currentDeckTile?.id === props.deckTile.id,
      })}
      style={{
        "z-index": props.zIndex,
      }}
      onClick={() => onClickDeckTile(props.deckTile)}
    >
      <BasicTile
        card={props.deckTile.card}
        material={props.deckTile.material}
      />
      <BasicTile class={pairClass} material={props.deckTile.material} />
    </div>
  )
}

function ItemMaterial(props: {
  item: MaterialItem
  onClick: (item: MaterialItem) => void
}) {
  const shop = useShopState()
  const run = useRunState()
  const disabled = createMemo(() => ITEM_COST > run.get().money)

  return (
    <button
      class={itemClass({
        selected: shop.currentItem?.id === props.item.id,
        disabled: disabled(),
      })}
      type="button"
      disabled={disabled()}
      onClick={() => props.onClick?.(props.item)}
    >
      <BasicTile material={props.item.material} card={props.item.suit} />
      <span class={itemCostClass}>${ITEM_COST}</span>
    </button>
  )
}

function ItemTile(props: {
  item: TileItem
  onClick?: (item: TileItem) => void
}) {
  const shop = useShopState()
  const run = useRunState()
  const disabled = createMemo(() => ITEM_COST > run.get().money)

  return (
    <button
      class={itemClass({
        selected: shop.currentItem?.id === props.item.id,
        disabled: disabled(),
      })}
      type="button"
      disabled={disabled()}
      onClick={() => props.onClick?.(props.item)}
    >
      <BasicTile card={props.item.card} />
      <span class={itemCostClass}>${ITEM_COST}</span>
    </button>
  )
}

function CardDetails(props: {
  card: Card
  material: Material
}) {
  return (
    <div class={detailsContentClass}>
      <div class={detailTitleClass}>
        {cardName(props.card)} ({props.material})
        <BasicTile card={props.card} material={props.material} />
      </div>
      <Switch>
        <Match when={isWind(props.card)}>
          <div class={detailInfoClass}>
            Wind tiles move the pieces in the direction of the wind.
          </div>
        </Match>
        <Match when={isDragon(props.card)}>
          <div class={detailInfoClass}>
            Dragon tiles start a "dragon run". Chain pairs of the dragon suit to
            increase the multiplier.
          </div>
        </Match>
      </Switch>
      <MaterialFreedom material={props.material} />
      <MaterialCoins material={props.material} />

      <dl class={detailListClass({ type: "points" })}>
        <dt class={detailTermClass}>Base points:</dt>
        <dd class={detailDescriptionClass}>+{getCardPoints(props.card)}</dd>
        <MaterialPoints material={props.material} />
      </dl>

      <dl class={detailListClass({ type: "multiplier" })}>
        <dt class={detailTermClass}>Base multiplier:</dt>{" "}
        <dd class={detailDescriptionClass}>+1</dd>
        <MaterialMultiplier material={props.material} />
      </dl>

      <dl class={detailListClass({ type: "total" })}>
        <dt class={detailTermClass}>Total points:</dt>{" "}
        <dd class={detailDescriptionClass}>
          {(getCardPoints(props.card) + getMaterialPoints(props.material)) *
            (1 + getMaterialMultiplier(props.material))}
        </dd>
      </dl>
    </div>
  )
}

function TileDetails(props: {
  deckTile: DeckTile
}) {
  const shop = useShopState()
  const run = useRunState()
  const deck = useDeckState()

  return (
    <>
      <CardDetails
        card={props.deckTile.card}
        material={props.deckTile.material}
      />
      <div class={buttonsClass}>
        <button
          type="button"
          class={buttonClass({ suit: "tile", disabled: false })}
          onClick={() => {
            shop.currentDeckTile = null
          }}
        >
          <X />
          close
        </button>
        <button
          type="button"
          class={buttonClass({ suit: "circle", disabled: false })}
          onClick={() => {
            sellDeckTile(run, deck, shop, props.deckTile)
          }}
        >
          <Buy />
          sell
        </button>
      </div>
    </>
  )
}

function TileItemDetails() {
  const shop = useShopState()
  const run = useRunState()
  const deck = useDeckState()
  const item = createMemo(() => shop.currentItem as TileItem)

  function buyTile(item: TileItem) {
    buyItem(run, shop, item, () => {
      const deckTile = deck.filterBy({ card: item.card })

      if (deckTile.length > 3) {
        // TODO: check if 3 for premium tiles
      }

      const id = nanoid()
      deck.set(id, { id, material: "bone", card: item.card })
    })
  }

  return (
    <>
      <CardDetails card={item().card} material="bone" />
      <div class={buttonsClass}>
        <button
          type="button"
          class={buttonClass({ suit: "tile", disabled: false })}
          onClick={() => {
            shop.currentItem = null
          }}
        >
          <X />
          close
        </button>
        <button
          type="button"
          class={buttonClass({ suit: "bamboo", disabled: false })}
          onClick={() => {
            buyTile(item())
          }}
        >
          <Buy />
          buy
        </button>
      </div>
    </>
  )
}

function UpgradeItemDetails() {
  const run = useRunState()
  const shop = useShopState()
  const item = createMemo(() => shop.currentItem as UpgradeItem)
  const cost = createMemo(() => shopUpgradeCost(run.get()))
  const disabled = createMemo(() => cost() > run.get().money)

  function buyUpgrade() {
    const money = run.get().money
    if (money < cost()) return

    batch(() => {
      run.set({
        money: money - cost(),
        shopLevel: item().level,
      })
      shop.currentItem = null
    })
  }

  return (
    <>
      <div class={detailsContentClass}>
        <div class={detailTitleClass}>Shop level {item().level}</div>
        <dl class={detailListClass({ type: "points" })}>
          <dt class={detailTermClass}>Deck size:</dt>
          <dd class={detailDescriptionClass}>
            {DECK_SIZE_LEVEL[item().level as keyof typeof DECK_SIZE_LEVEL]} /{" "}
            {
              DECK_SIZE_LEVEL[
                (item().level + 1) as keyof typeof DECK_SIZE_LEVEL
              ]
            }{" "}
            pairs
          </dd>
        </dl>
        <dl class={detailListClass({ type: "gold" })}>
          <dt class={detailTermClass}>gold per game:</dt>
          <dd class={detailDescriptionClass}>{item().level} coins</dd>
        </dl>
        <div class={detailListClass({ type: "bronze" })}>
          <span class={detailTermClass}>new tiles:</span>
          <TilesByRows
            tiles={TILE_ITEMS.filter((i) => i.level === item().level)}
            minCols={4}
            maxCols={6}
            minRows={2}
            tile={({ tile, zIndex }) => (
              <BasicTile
                card={tile.card}
                style={{ "z-index": zIndex }}
                width={35}
              />
            )}
          />
        </div>
        <div class={detailListClass({ type: "multiplier" })}>
          <span class={detailTermClass}>new materials:</span>
          <TilesByRows
            tiles={sortBy<MaterialItem[]>(
              MATERIAL_ITEMS.filter((i) => i.level === item().level),
              (i) => i.material,
            )}
            minCols={4}
            maxCols={6}
            minRows={2}
            tile={({ tile, zIndex }) => (
              <BasicTile
                card={tile.suit}
                material={tile.material}
                style={{ "z-index": zIndex }}
                width={35}
              />
            )}
          />
        </div>
      </div>
      <div class={buttonsClass}>
        <button
          type="button"
          class={buttonClass({ suit: "tile", disabled: false })}
          onClick={() => {
            shop.currentItem = null
          }}
        >
          <X />
          close
        </button>
        <button
          type="button"
          class={buttonClass({ suit: "bamboo", disabled: disabled() })}
          disabled={disabled()}
          onClick={buyUpgrade}
        >
          <Buy />
          buy
        </button>
      </div>
    </>
  )
}

function MaterialItemDetails() {
  const run = useRunState()
  const shop = useShopState()
  const item = createMemo(() => shop.currentItem as MaterialItem)

  const [selectedDeckTile, setSelectedDeckTile] = createSignal<DeckTile | null>(
    null,
  )
  const [hoveredDeckTile, setHoveredDeckTile] = createSignal<DeckTile | null>(
    null,
  )
  const isHovered = createSelector(hoveredDeckTile)
  const isSelected = createSelector(selectedDeckTile)
  const material = createMemo(() => item().material)

  const deck = useDeckState()
  const deckTiles = createMemo(() =>
    deck.all.filter((dt) => matchesSuit(dt.card, item().suit)),
  )
  const sortedTiles = createMemo(() =>
    deckTiles().sort((a, b) => getRank(a.card).localeCompare(getRank(b.card))),
  )

  function buyMaterial() {
    const deckTile = selectedDeckTile()
    if (!deckTile) return

    buyItem(run, shop, item(), () => {
      deck.set(deckTile.id, { ...deckTile, material: material() })
    })
  }

  return (
    <>
      <div class={detailsContentClass}>
        <div class={detailTitleClass}>
          {material()} ({suitName(item().suit)})
          <BasicTile material={material()} card={item().suit} />
        </div>

        <MaterialFreedom material={material()} />
        <dl class={detailListClass({ type: "points" })}>
          <MaterialPoints material={material()} />
        </dl>
        <Show when={getMaterialMultiplier(material())}>
          <dl class={detailListClass({ type: "multiplier" })}>
            <MaterialMultiplier material={material()} />
          </dl>
        </Show>
        <MaterialCoins material={material()} />

        <TilesByRows
          tiles={sortedTiles()}
          minCols={4}
          maxCols={6}
          minRows={2}
          tile={({ tile, zIndex }) => (
            <div
              class={deckItemClass({
                selected: isSelected(tile),
              })}
              onClick={() => setSelectedDeckTile(tile)}
              onMouseEnter={() => setHoveredDeckTile(tile)}
              onMouseLeave={() => setHoveredDeckTile(null)}
              style={{
                "z-index": zIndex,
              }}
            >
              <BasicTile
                card={tile.card}
                material={
                  isHovered(tile) || isSelected(tile)
                    ? material()
                    : tile.material
                }
                width={35}
              />
            </div>
          )}
        />
      </div>

      <div class={buttonsClass}>
        <button
          type="button"
          class={buttonClass({ suit: "tile", disabled: false })}
          onClick={() => {
            shop.currentItem = null
          }}
        >
          <X />
          close
        </button>
        <Show when={selectedDeckTile()}>
          <button
            type="button"
            class={buttonClass({ suit: "bamboo", disabled: false })}
            onClick={() => buyMaterial()}
          >
            <Buy />
            upgrade
          </button>
        </Show>
      </div>
    </>
  )
}

function MaterialFreedom(props: { material: Material }) {
  return (
    <div class={detailFreedomClass}>
      <span class={detailFreedomTitleClass}>Freedom</span>
      <Switch>
        <Match when={props.material === "ivory"}>
          Ivory tiles are always free.
        </Match>
        <Match when={props.material === "wood"}>
          Wood tiles are free if any side is open.
        </Match>
        <Match when={props.material === "glass"}>
          Glass tiles are free if at least 2 sides are open.
        </Match>
        <Match when={props.material === "bone"}>
          Bone tiles are free if left or right is open.
        </Match>
        <Match when={props.material === "bronze"}>
          Bronze tiles are free if at least 3 sides are open.
        </Match>
        <Match when={props.material === "gold"}>
          Gold tiles are free if at least 3 sides are open.
        </Match>
        <Match when={props.material === "jade"}>
          Jade tiles are free if only all sides are open.
        </Match>
      </Switch>
    </div>
  )
}

function MaterialMultiplier(props: { material: Material }) {
  return (
    <Show when={getMaterialMultiplier(props.material)}>
      {(multiplier) => (
        <>
          <dt class={detailTermClass}>{props.material} multiplier:</dt>{" "}
          <dd class={detailDescriptionClass}>+{multiplier()}</dd>
        </>
      )}
    </Show>
  )
}

function MaterialPoints(props: { material: Material }) {
  return (
    <>
      <dt class={detailTermClass}>{props.material} points:</dt>{" "}
      <dd class={detailDescriptionClass}>
        +{getMaterialPoints(props.material)}
      </dd>
    </>
  )
}

function MaterialCoins(props: { material: Material }) {
  return (
    <Show when={getCoins(props.material)}>
      {(coins) => (
        <dl class={detailListClass({ type: "gold" })}>
          <dt class={detailTermClass}>{props.material} coins:</dt>{" "}
          <dd class={detailDescriptionClass}>{coins()}</dd>
        </dl>
      )}
    </Show>
  )
}

function RerollButton() {
  const shop = useShopState()
  const run = useRunState()
  const disabled = createMemo(() => REROLL_COST > run.get().money)

  function reroll() {
    const cost = REROLL_COST
    const money = run.get().money
    if (cost > money) throw Error("You don't have enough money")

    batch(() => {
      run.set({ money: money - cost })
      shop.reroll++
    })
  }

  return (
    <div class={shopExtraClass({ disabled: disabled() })}>
      <h3 class={itemTitleClass}>refresh</h3>
      <button
        class={buttonClass({ suit: "circle", disabled: disabled() })}
        type="button"
        title="refresh items"
        onClick={reroll}
        disabled={disabled()}
      >
        <Dices />
      </button>
      <span class={itemCostClass}>${REROLL_COST}</span>
    </div>
  )
}

function UpgradeButton() {
  const run = useRunState()
  const shop = useShopState()
  const cost = createMemo(() => shopUpgradeCost(run.get()))
  const deck = useDeckState()
  const upgradeDeckSize = createMemo(
    () =>
      DECK_SIZE_LEVEL[
        (run.get().shopLevel + 1) as keyof typeof DECK_SIZE_LEVEL
      ],
  )
  const disabled = createMemo(
    () => cost() > run.get().money || deck.all.length < upgradeDeckSize(),
  )
  const shopLevel = createMemo(() => run.get().shopLevel)

  function selectUpgrade(level: number) {
    const item: UpgradeItem = {
      id: `upgrade-${level}`,
      type: "upgrade",
      level,
    }

    batch(() => {
      if (shop.currentItem?.id === item.id) {
        shop.currentItem = null
      } else {
        shop.currentItem = item
      }
      shop.currentDeckTile = null
    })
  }

  return (
    <div class={shopExtraClass({ disabled: disabled() })}>
      <h3 class={itemTitleClass}>upgrade</h3>
      <button
        class={buttonClass({ suit: "circle", disabled: disabled() })}
        type="button"
        title="upgrade shop"
        disabled={disabled()}
        onClick={() => selectUpgrade(shopLevel() + 1)}
      >
        <Upgrade />
      </button>
      <span class={itemCostClass}>${shopUpgradeCost(run.get())}</span>
    </div>
  )
}

function TilesByRows<T>(props: {
  tiles: T[]
  minCols: number
  maxCols: number
  minRows: number
  tile: ({
    tile,
    zIndex,
  }: {
    tile: T
    zIndex: number
  }) => JSXElement
}) {
  const tilesByRows = createMemo(() =>
    splitIntoRows(props.tiles, {
      minCols: props.minCols,
      maxCols: props.maxCols,
      minRows: props.minRows,
    }),
  )

  return (
    <div class={deckRowsClass}>
      <For each={tilesByRows()}>
        {(tiles, i) => (
          <div class={deckRowClass}>
            <For each={tiles}>
              {(tile, j) =>
                props.tile({
                  tile,
                  zIndex: i() * props.maxCols + tiles.length - j(),
                })
              }
            </For>
          </div>
        )}
      </For>
    </div>
  )
}
