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
  deckTitleClass,
  moneyClass,
  buttonsClass,
  buttonClass,
  detailsContentClass,
  itemsTitleClass,
  detailFreedomClass,
  detailFreedomTitleClass,
  materialUpgradeClass,
  materialUpgradeTitleClass,
  emperorClass,
  emperorDetailsClass,
  emperorDetailsTitleClass,
  emperorDetailsDescriptionClass,
  ownedEmperorsClass,
  ownedEmperorsTitleClass,
  ownedEmperorsListClass,
  MINI_TILE_SIZE,
} from "./runShop.css"
import {
  generateItems,
  type Item,
  type TileItem,
  ShopStateProvider,
  createShopState,
  useShopState,
  ITEM_COST,
  EMPEROR_COST,
  buyItem,
  type UpgradeItem,
  sellDeckTile,
  getNextMaterial,
  getTransformation,
  type EmperorItem,
  sellEmperor,
  SELL_EMPEROR_AMOUNT,
  ITEMS,
  maxEmperors,
} from "@/state/shopState"
import { BasicTile } from "@/components/game/basicTile"
import { useDeckState } from "@/state/deckState"
import {
  getCoins,
  cardName,
  type Material,
  type Card,
  type DeckTile,
  isDragon,
  isWind,
  getSuit,
  getRank,
  getRawPoints,
  getMaterialMultiplier,
  getMaterialPoints,
  bamboo,
  getRawMultiplier,
} from "@/lib/game"
import { Button } from "@/components/button"
import { ArrowRight, Dices, Upgrade, X, Buy } from "@/components/icon"
import { nanoid } from "nanoid"
import { shopUpgradeCost } from "@/state/runState"
import { splitIntoRows } from "@/lib/splitIntoRows"
import { chunk, entries } from "remeda"
import { MiniTile } from "@/components/miniTile"
import { Emperor } from "@/components/emperor"

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
  const emperorCount = createMemo(
    () => run.items.filter((item) => item.type === "emperor").length,
  )

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
        </div>
      </div>

      <OwnedEmperors />

      <div class={deckClass}>
        <div class={deckTitleClass}>
          <span>Your Deck ({totalPairs()} / 144 pairs)</span>
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
              <Match when={currentItem()?.type === "emperor"}>
                <EmperorItemDetails />
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

function EmperorItemComponent(props: {
  item: EmperorItem
  onClick?: (item: EmperorItem) => void
  emperorCount: number
}) {
  const shop = useShopState()
  const run = useRunState()
  const disabled = createMemo(
    () => EMPEROR_COST > run.money || props.emperorCount >= maxEmperors(run),
  )

  return (
    <button
      class={emperorClass({
        selected: shop.currentItem?.id === props.item.id,
        disabled: disabled(),
      })}
      type="button"
      disabled={disabled()}
      onClick={() => props.onClick?.(props.item)}
    >
      <Emperor name={props.item.name} />
      <span class={itemCostClass}>${EMPEROR_COST}</span>
    </button>
  )
}

function CardDetails(props: {
  card: Card
  material: Material
}) {
  const run = useRunState()

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

      <dl class={detailListClass({ type: "circle" })}>
        <dt class={detailTermClass}>Points:</dt>
        <dd class={detailDescriptionClass}>
          {getRawPoints({ card: props.card, material: props.material, run })}
        </dd>
      </dl>

      <Show when={getRawMultiplier({ material: props.material, run })}>
        {(multiplier) => (
          <dl class={detailListClass({ type: "character" })}>
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
  const canSell = createMemo(() => deck.all.length > 34)

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
  const transformation = createMemo(() =>
    getTransformation(tilesWithSameCard(), path()!),
  )
  const isUpgrading = createMemo(() => !transformation().adds)
  const mineralUpgrade = createMemo(() =>
    getNextMaterial(tilesWithSameCard(), "mineral"),
  )
  const metalUpgrade = createMemo(() =>
    getNextMaterial(tilesWithSameCard(), "metal"),
  )

  function buyTile(item: TileItem) {
    buyItem(run, shop, item, () => {
      const { updates, removes } = transformation()

      if (!isUpgrading()) {
        const id = nanoid()
        deck.set(id, { id, material: "bone", card: item.card })
        return
      }

      const p = path()
      if (!p) throw Error("No path")

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

      <Show when={isUpgrading()}>
        <div class={detailsContentClass}>
          <div class={detailTitleClass}>Upgrade Options</div>
          <p>
            Collecting 3 identical pairs lets you upgrade them into a stronger
            version.
          </p>
          <div class={buttonsClass}>
            <Show when={mineralUpgrade()}>
              {(material) => (
                <MaterialUpgradeButton
                  card={item().card}
                  material={material()}
                  onClick={() => setPath("mineral")}
                />
              )}
            </Show>
            <Show when={metalUpgrade()}>
              {(material) => (
                <MaterialUpgradeButton
                  card={item().card}
                  material={material()}
                  onClick={() => setPath("metal")}
                />
              )}
            </Show>
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

        <Show when={!isUpgrading() || path()}>
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

function EmperorItemDetails() {
  const shop = useShopState()
  const run = useRunState()
  const item = createMemo(() => shop.currentItem as EmperorItem)
  const emperorCount = createMemo(
    () => run.items.filter((item) => item.type === "emperor").length,
  )
  const disabled = createMemo(
    () => EMPEROR_COST > run.money || emperorCount() >= maxEmperors(run),
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
    <>
      <div class={emperorDetailsClass}>
        <div class={emperorDetailsTitleClass}>
          {item().name.replaceAll("_", " ")}
        </div>

        <div class={emperorDetailsDescriptionClass}>
          <Switch>
            <Match when={item().name === "the_bird_watcher"}>
              <MiniTile card="b1" size={48} />
              <br />
            </Match>
            <Match when={item().name === "the_gardener"}>
              <For each={bamboo}>{(card) => <MiniTile card={card} />}</For>
              <br />
            </Match>
          </Switch>
          {item().description}
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

        <Show
          when={isOwned()}
          fallback={
            <button
              type="button"
              class={buttonClass({ suit: "bamboo", disabled: disabled() })}
              disabled={disabled()}
              onClick={buyEmperor}
            >
              <Buy />
              recruit
            </button>
          }
        >
          <button
            type="button"
            class={buttonClass({ suit: "circle", disabled: false })}
            onClick={sellCurrentEmperor}
          >
            <Buy />
            sell (${SELL_EMPEROR_AMOUNT})
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
  const tileItems = createMemo(() =>
    (
      ITEMS.filter(
        (i) => i.level === item().level && i.type === "tile",
      ) as TileItem[]
    ).sort((a, b) => a.card.localeCompare(b.card)),
  )

  return (
    <>
      <div class={detailsContentClass}>
        <div class={detailTitleClass}>Shop level {item().level}</div>
        <dl class={detailListClass({ type: "gold" })}>
          <dt class={detailTermClass}>passive income:</dt>
          <dd class={detailDescriptionClass}>{item().level - 1} coins</dd>
        </dl>
        <dl class={detailListClass({ type: "character" })}>
          <dt class={detailTermClass}>emperors:</dt>
          <dd class={detailDescriptionClass}>+{item().level - 1}</dd>
        </dl>
        <div class={detailListClass({ type: "bamboo" })}>
          <span class={detailTermClass}>new tiles:</span>
          <div class={deckRowsClass}>
            <For each={chunk(tileItems(), 9)}>
              {(chunk, i) => (
                <div class={deckRowClass}>
                  <For each={chunk}>
                    {(item, j) => (
                      <BasicTile
                        card={item.card}
                        width={MINI_TILE_SIZE}
                        style={{ "z-index": i() * MAX_COLS + 9 - j() }}
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
          Glass tiles are free if at least 1 side is open.
        </Match>
        <Match when={props.material === "jade"}>
          Jade tiles are always free.
        </Match>
        <Match when={props.material === "bone"}>
          Bone tiles are free if left or right is open.
        </Match>
        <Match when={props.material === "bronze"}>
          Bronze tiles are free if at least 2 sides are open.
        </Match>
        <Match when={props.material === "gold"}>
          Gold tiles are free if at least 3 sides are open.
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
  const disabled = createMemo(() => cost() > run.money)
  const shopLevel = createMemo(() => run.shopLevel)

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
      <span class={itemCostClass}>${shopUpgradeCost(run)}</span>
    </div>
  )
}

function MaterialUpgradeButton(props: {
  material: Material
  card: Card
  onClick: (material: Material) => void
}) {
  return (
    <button
      type="button"
      onClick={() => props.onClick(props.material)}
      class={materialUpgradeClass}
    >
      <span class={materialUpgradeTitleClass({ material: props.material })}>
        {props.material}
      </span>
      <BasicTile card={props.card} material={props.material} />
      <dl class={detailListClass({ type: "circle" })}>
        <dt class={detailTermClass}>Points</dt>
        <dd class={detailDescriptionClass}>
          +{getMaterialPoints(props.material)}
        </dd>
        <Show when={getMaterialMultiplier(props.material)}>
          {(multiplier) => (
            <>
              <dt class={detailTermClass}>Multiplier</dt>
              <dd class={detailDescriptionClass}>+{multiplier()}</dd>
            </>
          )}
        </Show>
      </dl>
      <Show when={getCoins(props.material)}>
        {(coins) => (
          <dl class={detailListClass({ type: "gold" })}>
            <dt class={detailTermClass}>Coins</dt>
            <dd class={detailDescriptionClass}>+{coins()}</dd>
          </dl>
        )}
      </Show>
      <MaterialFreedom material={props.material} />
    </button>
  )
}

function OwnedEmperors() {
  const run = useRunState()
  const shop = useShopState()

  const ownedEmperors = createMemo(
    () => run.items.filter((item) => item.type === "emperor") as EmperorItem[],
  )

  function selectEmperor(emperor: EmperorItem) {
    batch(() => {
      shop.currentItem = emperor
      shop.currentDeckTile = null
    })
  }

  return (
    <Show when={ownedEmperors().length > 0}>
      <div class={ownedEmperorsClass}>
        <div class={ownedEmperorsTitleClass}>
          Your Emperors ({ownedEmperors().length} / {maxEmperors(run)})
        </div>
        <div class={ownedEmperorsListClass}>
          <For each={ownedEmperors()}>
            {(emperor) => (
              <div
                class={emperorClass({
                  disabled: false,
                  selected: emperor.id === shop.currentItem?.id,
                })}
                onClick={() => selectEmperor(emperor)}
              >
                <Emperor name={emperor.name} />
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  )
}
