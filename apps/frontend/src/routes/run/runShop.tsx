import { useRunState } from "@/state/runState"
import {
  batch,
  createMemo,
  For,
  Match,
  Show,
  Switch,
  createSignal,
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
  type TileItem,
  ShopStateProvider,
  createShopState,
  useShopState,
  ITEM_COST,
  buyItem,
  type UpgradeItem,
  sellDeckTile,
  getNextMaterial,
  getTransformation,
} from "@/state/shopState"
import { BasicTile } from "@/components/game/basicTile"
import { useDeckState } from "@/state/deckState"
import {
  getCoins,
  getDeckPairsSize,
  cardName,
  type Material,
  type Card,
  type DeckTile,
  isDragon,
  isWind,
  getSuit,
  getRank,
  type DeckSizeLevel,
  getRawPoints,
  getMaterialMultiplier,
} from "@/lib/game"
import { Button } from "@/components/button"
import { ArrowRight, Dices, Upgrade, X, Buy } from "@/components/icon"
import { nanoid } from "nanoid"
import { shopUpgradeCost } from "@/state/runState"
import { splitIntoRows } from "@/lib/splitIntoRows"
import { entries } from "remeda"

const REROLL_COST = 1
const MIN_ROWS = 4
const MIN_COLS = 9
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

  const shopLevel = createMemo(() => run.shopLevel)
  const totalPairs = createMemo(() => deck.all.length)
  const items = createMemo(() => generateItems(run, shop.reroll))

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
    batch(() => {
      run.round = run.round + 1
      run.stage = "select"
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
            Your Deck ({totalPairs()} / {getDeckPairsSize(shopLevel() + 1)}{" "}
            pairs)
          </span>
          <span class={moneyClass}>${run.money} coins</span>
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

function ItemTile(props: {
  item: TileItem
  onClick?: (item: TileItem) => void
}) {
  const shop = useShopState()
  const run = useRunState()
  const disabled = createMemo(() => ITEM_COST > run.money)

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
        <dt class={detailTermClass}>Points:</dt>
        <dd class={detailDescriptionClass}>
          {getRawPoints(props.card, props.material)}
        </dd>
      </dl>

      <Show when={getMaterialMultiplier(props.material)}>
        {(multiplier) => (
          <dl class={detailListClass({ type: "multiplier" })}>
            <dt class={detailTermClass}>Multiplier:</dt>{" "}
            <dd class={detailDescriptionClass}>{multiplier() + 1}</dd>
          </dl>
        )}
      </Show>
    </div>
  )
}

function TileDetails(props: {
  deckTile: DeckTile
}) {
  const shop = useShopState()
  const run = useRunState()
  const deck = useDeckState()
  const canSell = createMemo(
    () => deck.all.length > getDeckPairsSize(run.shopLevel),
  )

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
        <Show when={canSell()}>
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
        </Show>
      </div>
    </>
  )
}

function TileItemDetails() {
  const shop = useShopState()
  const run = useRunState()
  const deck = useDeckState()

  const item = createMemo(() => shop.currentItem as TileItem)
  const [path, setPath] = createSignal<"mineral" | "metal" | null>(null)
  const tilesWithSameCard = createMemo(() =>
    deck.filterBy({ card: item().card }),
  )
  const existingBoneTile = createMemo(() => existingTile("bone"))

  function existingTile(material: Material) {
    return tilesWithSameCard().find((tile) => tile.material === material)
  }

  function buyTile(item: TileItem) {
    buyItem(run, shop, item, () => {
      const boneTile = existingBoneTile()

      if (!boneTile) {
        const id = nanoid()
        deck.set(id, { id, material: "bone", card: item.card })
        return
      }

      const p = path()
      if (!p) throw Error("No path")

      const { updates, removes } = getTransformation(tilesWithSameCard(), p)

      for (const [id, material] of entries(updates)) {
        deck.set(id, { id, material, card: item.card })
      }

      for (const id of removes) {
        deck.del(id)
      }
    })
  }

  return (
    <>
      <CardDetails card={item().card} material="bone" />

      <Show when={existingBoneTile()}>
        <div class={detailsContentClass}>
          <div class={detailTitleClass}>Upgrade Options</div>
          <p>You already have this tile. Pick an upgrade:</p>
          <div class={buttonsClass}>
            <button type="button" onClick={() => setPath("mineral")}>
              Mineral
              <BasicTile
                card={item().card}
                material={getNextMaterial(tilesWithSameCard(), "mineral")}
              />
              TODO: properties over previous material
            </button>
            <button type="button" onClick={() => setPath("metal")}>
              Metal
              <BasicTile
                card={item().card}
                material={getNextMaterial(tilesWithSameCard(), "metal")}
              />
              TODO: properties over previous material
            </button>
          </div>
        </div>
      </Show>

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

        <Show when={!existingBoneTile() || path()}>
          <button
            type="button"
            class={buttonClass({ suit: "bamboo", disabled: false })}
            onClick={() => {
              buyTile(item())
            }}
          >
            <Buy />
            <Show when={path()} fallback="buy">
              upgrade
            </Show>
          </button>
        </Show>
      </div>
    </>
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

  return (
    <>
      <div class={detailsContentClass}>
        <div class={detailTitleClass}>Shop level {item().level}</div>
        <dl class={detailListClass({ type: "points" })}>
          <dt class={detailTermClass}>Deck size:</dt>
          <dd class={detailDescriptionClass}>
            {getDeckPairsSize(item().level)} /{" "}
            {getDeckPairsSize(item().level + 1)} pairs
          </dd>
        </dl>
        <dl class={detailListClass({ type: "gold" })}>
          <dt class={detailTermClass}>passive income:</dt>
          <dd class={detailDescriptionClass}>{item().level - 1} coins</dd>
        </dl>
        <div class={detailListClass({ type: "bronze" })}>
          <span class={detailTermClass}>new tiles:</span>
        </div>
        <div class={detailListClass({ type: "multiplier" })}>
          <span class={detailTermClass}>new materials:</span>
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

function MaterialFreedom(props: { material: Material }) {
  return (
    <div class={detailFreedomClass}>
      <span class={detailFreedomTitleClass}>Freedom</span>
      <Switch>
        <Match when={props.material === "glass"}>
          Glass tiles are free if at least 2 sides are open.
        </Match>
        <Match when={props.material === "amber"}>
          Amber tiles are free if at least 2 sides are open.
        </Match>
        <Match when={props.material === "jade"}>
          Jade tiles are always free.
        </Match>
        <Match when={props.material === "bone"}>
          Bone tiles are free if left or right is open.
        </Match>
        <Match when={props.material === "bronze"}>
          Bronze tiles are free if at least 3 sides are open.
        </Match>
        <Match when={props.material === "silver"}>
          Silver tiles are free if at least 3 sides are open.
        </Match>
        <Match when={props.material === "gold"}>
          Gold tiles are free if all 4 sides are open.
        </Match>
      </Switch>
    </div>
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
  const disabled = createMemo(() => REROLL_COST > run.money)

  function reroll() {
    const cost = REROLL_COST
    const money = run.money
    if (cost > money) throw Error("You don't have enough money")

    batch(() => {
      run.money = money - cost
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
  const cost = createMemo(() => shopUpgradeCost(run))
  const deck = useDeckState()
  const upgradeDeckSize = createMemo(() => getDeckPairsSize(run.shopLevel + 1))
  const disabled = createMemo(
    () => cost() > run.money || deck.all.length < upgradeDeckSize(),
  )
  const shopLevel = createMemo(() => run.shopLevel)

  function selectUpgrade(level: DeckSizeLevel) {
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
        onClick={() => selectUpgrade((shopLevel() + 1) as DeckSizeLevel)}
      >
        <Upgrade />
      </button>
      <span class={itemCostClass}>${shopUpgradeCost(run)}</span>
    </div>
  )
}
