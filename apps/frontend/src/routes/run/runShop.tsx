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
  itemClass,
  itemsClass,
  shopItemsClass,
  itemTitleClass,
  pairClass,
  shopExtraClass,
  shopClass,
  titleClass,
  detailTitleClass,
  detailTermClass,
  detailDescriptionClass,
  detailListClass,
  deckTitleClass,
  moneyClass,
  buttonsClass,
  detailsContentClass,
  itemsTitleClass,
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
  nextRoundClass,
  nextRoundTitleClass,
  nextRoundDetailListClass,
  nextRoundDetailDescriptionClass,
  nextRoundDetailTermClass,
  shopGridClass,
  deckContainerClass,
  deckDescriptionClass,
  deckDetailsClass,
  fullExplanationClass,
  materialUpgradesClass,
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
import { Button, ShopButton } from "@/components/button"
import {
  ArrowRight,
  Dices,
  Upgrade,
  X,
  Buy,
  Goal,
  Hourglass,
  Freeze,
} from "@/components/icon"
import { nanoid } from "nanoid"
import { shopUpgradeCost, getIncome } from "@/state/runState"
import { splitIntoRows } from "@/lib/splitIntoRows"
import { chunk, entries } from "remeda"
import { Emperor } from "@/components/emperor"
import {
  CardMultiplier,
  CardPoints,
  Explanation,
  MaterialCoins,
  MaterialFreedom,
  TileHover,
} from "@/components/game/tileHover"
import { useHover } from "@/components/game/useHover"
import { SOUNDS } from "@/components/audio"
import { play } from "@/components/audio"
import { useGlobalState } from "@/state/globalState"

const REROLL_COST = 10
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
  const shop = useShopState()

  return (
    <div class={shopClass}>
      <div class={shopGridClass}>
        <ShopHeader />
        <ShopItems />
        <OwnedEmperors />
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
                <Dialog.Overlay class={detailsOverlayClass} />
                <div class={detailsPositionerClass}>
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
  const { isHovering, hoverProps, mousePosition } = useHover({
    delay: 500,
  })
  const material = createMemo(() => (frozen() ? "glass" : "bone"))

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
          <BasicTile card={props.item.card} material={material()} />
          <BasicTile
            class={pairClass}
            card={props.item.card}
            material={material()}
          />
        </div>
        <span class={moneyClass({ size: "medium", frozen: frozen() })}>
          ${itemCost(props.item.level)}
        </span>
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
  const frozen = createMemo(() => run.freeze?.active)
  const disabled = createMemo(
    () =>
      frozen() ||
      emperorCost(props.item.level) > run.money ||
      props.emperorCount >= maxEmperors(run),
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
        <Emperor name={props.item.name} frozen={frozen()} />
        <span class={moneyClass({ size: "medium", frozen: frozen() })}>
          ${emperorCost(props.item.level)}
        </span>
      </button>
    </>
  )
}

function CardDetails(props: {
  item: TileItem
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
    <Dialog.Content class={detailsContentClass({ type: "tile" })}>
      <div class={modalDetailsClass}>
        <BasicTile card={card()} material={props.material} />
        <div class={modalDetailsContentClass}>
          <div class={detailTitleClass}>
            {cardName(card())} ({props.material})
          </div>
          <CardPoints card={card()} material={props.material} />
          <CardMultiplier card={card()} material={props.material} />
          <MaterialFreedom material={props.material} />
          <MaterialCoins material={props.material} />
          <Explanation card={card()} />
          <dl class={detailListClass({ type: "gold" })}>
            <dt class={detailTermClass}>Cost:</dt>
            <dd class={detailDescriptionClass}>
              <span class={moneyClass({ size: "medium" })}>
                ${itemCost(props.item.level)}
              </span>
            </dd>
          </dl>
        </div>
      </div>
      <div class={buttonsClass}>
        <ShopButton
          type="button"
          hue="bone"
          onClick={() => {
            shop.currentItem = null
          }}
        >
          <X />
          close
        </ShopButton>

        <ShopButton
          type="button"
          hue="bam"
          disabled={false}
          onClick={() => {
            buyTile(props.item)
          }}
        >
          <Buy />
          buy
        </ShopButton>
      </div>
    </Dialog.Content>
  )
}

function TileItemDetails() {
  const shop = useShopState()
  const deck = useDeckState()

  const item = createMemo(() => shop.currentItem as TileItem)
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
        <div class={buttonsClass}>
          <ShopButton
            type="button"
            hue="bone"
            onClick={() => {
              shop.currentItem = null
            }}
          >
            <X />
            close
          </ShopButton>
        </div>
      </Dialog.Content>
    </Show>
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
    <Dialog.Content class={detailsContentClass({ type: "emperor" })}>
      <div class={modalDetailsClass}>
        <Emperor name={item().name} />
        <div class={modalDetailsContentClass}>
          <div class={emperorDetailsTitleClass}>
            {item().name.replaceAll("_", " ")}
          </div>

          <div class={emperorDetailsDescriptionClass}>{item().description}</div>
        </div>
      </div>

      <div class={buttonsClass}>
        <ShopButton
          type="button"
          hue="bone"
          onClick={() => {
            shop.currentItem = null
          }}
        >
          <X />
          close
        </ShopButton>

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
    (
      generateShopItems().filter(
        (i) => i.level === item().level && i.type === "tile",
      ) as TileItem[]
    ).sort((a, b) => a.card.localeCompare(b.card)),
  )

  return (
    <Dialog.Content class={detailsContentClass({ type: "upgrade" })}>
      <div class={modalDetailsContentClass}>
        <div class={detailTitleClass}>Shop level {item().level}</div>
        <dl class={detailListClass({ type: "gold" })}>
          <dt class={detailTermClass}>yield per pair of tiles:</dt>
          <dd class={detailDescriptionClass}>
            <span class={moneyClass({ size: "small" })}>
              ${item().level}
            </span>{" "}
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
          <dd class={detailDescriptionClass}>{3 + item().level - 1}</dd>
        </dl>
        <div class={detailListClass({ type: "bam" })}>
          <span class={detailTermClass}>new tiles:</span>
          <div class={deckRowsClass}>
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
          hue="bone"
          onClick={() => {
            shop.currentItem = null
          }}
        >
          <X />
          close
        </ShopButton>
        <ShopButton
          type="button"
          hue="bam"
          disabled={disabled()}
          onClick={buyUpgrade}
        >
          <Buy />
          buy
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

      run.money = money - cost
      shop.reroll++
    })

    play(SOUNDS.DICE, globalState.muted)
  }

  return (
    <div class={shopExtraClass({ disabled: disabled() })}>
      <h3 class={itemTitleClass}>refresh</h3>
      <ShopButton
        hue="dot"
        type="button"
        title="refresh items"
        onClick={reroll}
        disabled={disabled()}
      >
        <Dices />
      </ShopButton>
      <span class={moneyClass({ size: "medium" })}>${REROLL_COST}</span>
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
  }

  return (
    <div class={shopExtraClass({ disabled: false })}>
      <h3 class={itemTitleClass}>freeze</h3>
      <ShopButton
        hue="glass"
        type="button"
        title="freeze items"
        onClick={freeze}
      >
        <Freeze />
      </ShopButton>
      <span class={moneyClass({ size: "medium" })}>$0</span>
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
      <ShopButton
        hue="dot"
        type="button"
        title="upgrade shop"
        disabled={disabled()}
        onClick={() => selectUpgrade((shopLevel() + 1) as Level)}
      >
        <Upgrade />
      </ShopButton>
      <span class={moneyClass({ size: "medium" })}>
        ${shopUpgradeCost(run)}
      </span>
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
    <div class={materialUpgradeClass({ hue: props.material })}>
      <span class={materialUpgradeTitleClass({ material: props.material })}>
        {props.material}
      </span>
      <BasicTile card={props.item.card} material={props.material} />
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
      </dl>

      <dl class={detailListClass({ type: props.material })}>
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
        Your Crew <Show when={full()}>is full</Show> ({ownedEmperors().length} /{" "}
        {capacity()})
        <Show when={full()}>
          <span class={fullExplanationClass({ hue: "crack" })}>
            Upgrade your shop to buy more crew members
          </span>
        </Show>
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
  )
}

function Deck() {
  const run = useRunState()
  const deck = useDeckState()

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
  const totalPairs = createMemo(() => deck.all.length)
  const shopLevel = createMemo(() => run.shopLevel)
  const capacity = createMemo(() => DECK_CAPACITY_PER_LEVEL[shopLevel()])
  const full = createMemo(() => totalPairs() === capacity())

  return (
    <div class={deckClass}>
      <div class={deckTitleClass({ full: full() })}>
        Your Deck
        <Show when={full()}> is full</Show> ({totalPairs()}
        {" / "}
        {capacity()})
        <Show when={full()}>
          <span class={fullExplanationClass({ hue: "bam" })}>
            Upgrade your shop to buy more tiles
          </span>
        </Show>
      </div>
      <div class={deckContainerClass}>
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
        <div class={deckDetailsClass}>
          <dl class={detailListClass({ type: "bam" })}>
            <dt class={detailTermClass}>Deck size:</dt>
            <dd class={detailDescriptionClass}>{deck.size} pairs</dd>
            <dt class={detailTermClass}>Yield:</dt>
            <dd class={detailDescriptionClass}>
              <span class={moneyClass({ size: "small" })}>
                ${run.shopLevel}
              </span>
            </dd>
            <dt class={detailTermClass}>Income per round =</dt>
            <dd class={detailDescriptionClass}>
              <span class={moneyClass({ size: "small" })}>
                ${getIncome(deck, run)}
              </span>
            </dd>
            <p class={deckDescriptionClass}>
              Upgrade the shop to increase the yield and capacity of your deck.
            </p>
          </dl>
        </div>
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
      <div class={itemsTitleClass}>
        Shop (level {shopLevel()})
        <span>
          You have <span class={moneyClass({ size: "big" })}>${run.money}</span>
        </span>
      </div>
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
        <FreezeButton />
      </div>
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
  const nextRound = createMemo(() => generateRound(run.round + 1, run.runId))

  return (
    <div class={shopHeaderClass}>
      <h1 class={titleClass}>The parlor</h1>
      <div class={continueClass}>
        <div class={nextRoundClass}>
          <h2 class={nextRoundTitleClass}>Round {nextRound().id}</h2>
          <dl class={nextRoundDetailListClass}>
            <dt class={nextRoundDetailTermClass}>
              <Goal />
            </dt>
            <dd class={nextRoundDetailDescriptionClass}>
              {nextRound().pointObjective} points
            </dd>
            <Show when={nextRound().timerPoints}>
              {(timerPoints) => (
                <>
                  <dt class={nextRoundDetailTermClass}>
                    <Hourglass />
                  </dt>
                  <dd class={nextRoundDetailDescriptionClass}>
                    {timerPoints().toFixed(2)} points
                  </dd>
                </>
              )}
            </Show>
          </dl>
          <Button hue="bone" onClick={continueRun}>
            Play
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
