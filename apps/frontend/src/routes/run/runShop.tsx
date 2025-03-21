import { useRunState } from "@/state/runState"
import { Dialog } from "@kobalte/core/dialog"
import { batch, createMemo, For, Match, Show, Switch } from "solid-js"
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
  bams,
  getRawMultiplier,
  getMaterialCoins,
} from "@/lib/game"
import { Button } from "@/components/button"
import { ArrowRight, Dices, Upgrade, X, Buy } from "@/components/icon"
import { nanoid } from "nanoid"
import { shopUpgradeCost } from "@/state/runState"
import { splitIntoRows } from "@/lib/splitIntoRows"
import { chunk, entries } from "remeda"
import { MiniTile } from "@/components/miniTile"
import { Emperor } from "@/components/emperor"
import { TileHover } from "@/components/game/tileHover"
import { useHover } from "@/components/game/useHover"

const REROLL_COST = 5
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
    if (item?.id === shop.currentItem?.id) {
      shop.currentItem = null
    } else {
      shop.currentItem = item
    }
  }

  function continueRun() {
    batch(() => {
      run.round = run.round + 1
      run.stage = "select"
    })
  }

  return (
    <div class={shopClass}>
      <div class={shopHeaderClass}>
        <h1 class={titleClass}>The parlor</h1>
        <div class={continueClass}>
          <Button hue="bam" onClick={continueRun}>
            Next Game
            <ArrowRight />
          </Button>
        </div>
      </div>
      <div class={itemsContainerClass}>
        <div class={itemsTitleClass}>Shop (level {shopLevel()})</div>
        <div class={itemsClass}>
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
        </div>
      </div>

      <OwnedEmperors />

      <div class={deckClass}>
        <div class={deckTitleClass}>
          <span>Your Deck ({totalPairs()} / 77 pairs)</span>
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
                      zIndex={i() * MAX_COLS + j()}
                    />
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
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
                <Dialog.Content class={detailsContentClass}>
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
                </Dialog.Content>
              </div>
            </Dialog.Portal>
          </Dialog>
        )}
      </Show>
    </div>
  )
}

function DeckTileComponent(props: {
  deckTile: DeckTile
  zIndex: number
}) {
  const { isHovering, hoverProps, mousePosition } = useHover({
    delay: 500,
  })

  return (
    <>
      <div
        class={deckItemClass}
        style={{
          "z-index": props.zIndex,
        }}
        {...hoverProps}
      >
        <BasicTile
          card={props.deckTile.card}
          material={props.deckTile.material}
        />
        <BasicTile class={pairClass} material={props.deckTile.material} />
      </div>

      <Show when={isHovering()}>
        <TileHover
          mousePosition={mousePosition()}
          card={props.deckTile.card}
          material={props.deckTile.material}
        />
      </Show>
    </>
  )
}

function ItemTile(props: {
  item: TileItem
  onClick?: (item: TileItem) => void
}) {
  const shop = useShopState()
  const run = useRunState()
  const disabled = createMemo(() => ITEM_COST > run.money)
  const { isHovering, hoverProps, mousePosition } = useHover({
    delay: 500,
  })

  return (
    <>
      <button
        class={itemClass({
          selected: shop.currentItem?.id === props.item.id,
          disabled: disabled(),
        })}
        type="button"
        disabled={disabled()}
        onClick={() => props.onClick?.(props.item)}
        {...hoverProps}
      >
        <div class={itemPairClass}>
          <BasicTile card={props.item.card} />
          <BasicTile class={pairClass} card={props.item.card} />
        </div>
        <span class={itemCostClass}>${ITEM_COST}</span>
      </button>

      <Show when={isHovering()}>
        <TileHover
          mousePosition={mousePosition()}
          card={props.item.card}
          material="bone"
        />
      </Show>
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
  const disabled = createMemo(
    () => EMPEROR_COST > run.money || props.emperorCount >= maxEmperors(run),
  )

  return (
    <>
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
    </>
  )
}

function CardDetails(props: {
  card: Card
  material: Material
}) {
  const run = useRunState()

  return (
    <div class={modalDetailsClass}>
      <BasicTile card={props.card} material={props.material} />
      <div class={modalDetailsContentClass}>
        <div class={detailTitleClass}>
          {cardName(props.card)} ({props.material})
        </div>
        <Switch>
          <Match when={isWind(props.card)}>
            <div class={detailInfoClass}>
              Wind tiles move the pieces in the direction of the wind.
            </div>
          </Match>
          <Match when={isDragon(props.card)}>
            <div class={detailInfoClass}>
              Dragon tiles start a "dragon run". Chain pairs of the dragon suit
              to increase the multiplier.
            </div>
          </Match>
        </Switch>
        <MaterialFreedom material={props.material} />
        <MaterialCoins material={props.material} />

        <dl class={detailListClass({ type: "bam" })}>
          <dt class={detailTermClass}>Points:</dt>
          <dd class={detailDescriptionClass}>
            {getRawPoints({ card: props.card, material: props.material, run })}
          </dd>
        </dl>

        <Show when={getRawMultiplier({ material: props.material, run })}>
          {(multiplier) => (
            <dl class={detailListClass({ type: "crack" })}>
              <dt class={detailTermClass}>Multiplier:</dt>{" "}
              <dd class={detailDescriptionClass}>{multiplier() + 1}</dd>
            </dl>
          )}
        </Show>
      </div>
    </div>
  )
}

function TileItemDetails() {
  const shop = useShopState()
  const run = useRunState()
  const deck = useDeckState()

  const item = createMemo(() => shop.currentItem as TileItem)
  const tilesWithSameCard = createMemo(() =>
    deck.filterBy({ card: item().card }),
  )
  const mineralUpgrade = createMemo(() =>
    getNextMaterial(tilesWithSameCard(), "mineral"),
  )
  const metalUpgrade = createMemo(() =>
    getNextMaterial(tilesWithSameCard(), "metal"),
  )
  const isUpgrading = createMemo(
    () => mineralUpgrade() !== "bone" || metalUpgrade() !== "bone",
  )

  function buyTile(item: TileItem) {
    buyItem(run, shop, item, () => {
      const id = nanoid()
      deck.set(id, { id, material: "bone", card: item.card })
    })
  }

  return (
    <>
      <Show
        when={isUpgrading()}
        fallback={<CardDetails card={item().card} material="bone" />}
      >
        <div class={modalDetailsContentClass}>
          <div class={upgradeDescriptionClass}>
            <h2 class={upgradeTitleClass}>Upgrade available!</h2>
            Collecting 3 identical pairs lets you upgrade them into a stronger
            version.
          </div>
          <div class={buttonsClass}>
            <Show when={mineralUpgrade()}>
              {(material) => (
                <MaterialUpgradeButton
                  material={material()}
                  item={item()}
                  path="mineral"
                />
              )}
            </Show>
            <Show when={metalUpgrade()}>
              {(material) => (
                <MaterialUpgradeButton
                  material={material()}
                  item={item()}
                  path="metal"
                />
              )}
            </Show>
          </div>
        </div>
      </Show>

      <div class={buttonsClass}>
        <button
          type="button"
          class={buttonClass({ hue: "bone", disabled: false })}
          onClick={() => {
            shop.currentItem = null
          }}
        >
          <X />
          close
        </button>

        <Show when={!isUpgrading()}>
          <button
            type="button"
            class={buttonClass({ hue: "bam", disabled: false })}
            onClick={() => {
              buyTile(item())
            }}
          >
            <Buy />
            buy
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
      <div class={modalDetailsClass}>
        <div class={modalDetailsContentClass}>
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
                <For each={bams}>{(card) => <MiniTile card={card} />}</For>
                <br />
              </Match>
            </Switch>
            {item().description}
          </div>
        </div>
        <Emperor name={item().name} />
      </div>

      <div class={buttonsClass}>
        <button
          type="button"
          class={buttonClass({ hue: "bone", disabled: false })}
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
              class={buttonClass({ hue: "bam", disabled: disabled() })}
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
            class={buttonClass({ hue: "dot", disabled: false })}
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
      <div class={modalDetailsContentClass}>
        <div class={detailTitleClass}>Shop level {item().level}</div>
        <dl class={detailListClass({ type: "gold" })}>
          <dt class={detailTermClass}>passive income:</dt>
          <dd class={detailDescriptionClass}>{item().level - 1} coins</dd>
        </dl>
        <dl class={detailListClass({ type: "crack" })}>
          <dt class={detailTermClass}>emperors:</dt>
          <dd class={detailDescriptionClass}>+{item().level - 1}</dd>
        </dl>
        <div class={detailListClass({ type: "bam" })}>
          <span class={detailTermClass}>new tiles:</span>
          <div class={deckRowsClass}>
            <For each={chunk(tileItems(), 9)}>
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
        <button
          type="button"
          class={buttonClass({ hue: "bone", disabled: false })}
          onClick={() => {
            shop.currentItem = null
          }}
        >
          <X />
          close
        </button>
        <button
          type="button"
          class={buttonClass({ hue: "bam", disabled: disabled() })}
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

function UpgradeCardPreview(props: {
  card: Card
  material: Material
  zIndex: number
}) {
  const { isHovering, hoverProps, mousePosition } = useHover({
    delay: 500,
  })

  return (
    <>
      <BasicTile
        card={props.card}
        width={MINI_TILE_SIZE}
        style={{ "z-index": props.zIndex }}
        {...hoverProps}
      />
      <Show when={isHovering()}>
        <TileHover
          mousePosition={mousePosition()}
          card={props.card}
          material={props.material}
        />
      </Show>
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
          Bone tiles are free if the left or right side are open.
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
    <Show when={getMaterialCoins(props.material)}>
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
      run.money = money + cost
      shop.reroll++
    })
  }

  return (
    <div class={shopExtraClass({ disabled: disabled() })}>
      <h3 class={itemTitleClass}>refresh</h3>
      <button
        class={buttonClass({ hue: "dot", disabled: disabled() })}
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
    })
  }

  return (
    <div class={shopExtraClass({ disabled: disabled() })}>
      <h3 class={itemTitleClass}>upgrade</h3>
      <button
        class={buttonClass({ hue: "dot", disabled: disabled() })}
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
  item: TileItem
  path: "mineral" | "metal"
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
  }

  return (
    <div class={materialUpgradeClass}>
      <span class={materialUpgradeTitleClass({ material: props.material })}>
        {props.material}
      </span>
      <BasicTile card={props.item.card} material={props.material} />
      <dl class={detailListClass({ type: "crack" })}>
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

      <dl class={detailListClass({ type: "gold" })}>
        <dt class={detailTermClass}>Coins</dt>
        <dd class={detailDescriptionClass}>
          +{getMaterialCoins(props.material)}
        </dd>
      </dl>
      <MaterialFreedom material={props.material} />
      <button
        type="button"
        class={buttonClass({ hue: "bam", disabled: false })}
        onClick={() => {
          upgradeTile(props.item)
        }}
      >
        <Buy />
        upgrade
      </button>
    </div>
  )
}

function OwnedEmperors() {
  const run = useRunState()
  const shop = useShopState()

  const ownedEmperors = createMemo(
    () => run.items.filter((item) => item.type === "emperor") as EmperorItem[],
  )

  function selectEmperor(emperor: EmperorItem) {
    shop.currentItem = emperor
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
          <For
            each={Array.from({
              length: maxEmperors(run) - ownedEmperors().length,
            })}
          >
            {() => <div class={emptyEmperorClass} />}
          </For>
        </div>
      </div>
    </Show>
  )
}
