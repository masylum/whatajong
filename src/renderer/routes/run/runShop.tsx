import {
  DECK_CAPACITY_PER_LEVEL,
  generateRound,
  useRunState,
} from "@/state/runState"
import { Dialog } from "@kobalte/core/dialog"
import { assignInlineVars } from "@vanilla-extract/dynamic"

import { play } from "@/components/audio"
import { ShopButton } from "@/components/button"
import { LinkButton } from "@/components/button"
import { BasicEmperor } from "@/components/emperor"
import { BasicTile } from "@/components/game/basicTile"
import {
  CardMultiplier,
  CardPoints,
  Explanation,
  MaterialCoins,
  MaterialFreedom,
} from "@/components/game/tileDetails"
import {
  ArrowRight,
  Buy,
  Coins,
  Dices,
  Freeze,
  Home,
  Upgrade,
  X,
} from "@/components/icon"
import { useTranslation } from "@/i18n/useTranslation"
import {
  type DeckTile,
  type Level,
  type Material,
  cardName,
  getRank,
  getSuit,
} from "@/lib/game"
import { captureEvent } from "@/lib/observability"
import { getSideSize, useTileSize } from "@/state/constants"
import { useDeckState } from "@/state/deckState"
import { EmperorDescription, EmperorTitle } from "@/state/emperors"
import {
  type DeckTileItem,
  type EmperorItem,
  type Item,
  type Path,
  ShopStateProvider,
  type TileItem,
  type UpgradeItem,
  buyItem,
  createShopState,
  generateItems,
  generateShopItems,
  getNextMaterial,
  getTransformation,
  isTile,
  itemCost,
  maxEmperors,
  sellEmperor,
  useShopState,
} from "@/state/shopState"
import type { AccentHue } from "@/styles/colors"
import { nanoid } from "nanoid"
import { chunk, entries, uniqueBy } from "remeda"
import {
  For,
  Match,
  type ParentProps,
  Show,
  Switch,
  batch,
  createEffect,
  createMemo,
  on,
} from "solid-js"
import { RunPickEmperor } from "./runPickEmperor"
import {
  MINI_TILE_SIZE,
  areaClass,
  areaTitleClass,
  backgroundClass,
  buttonsClass,
  closeButtonClass,
  continueClass,
  deckItemClass,
  deckRowsClass,
  detailDescriptionClass,
  detailListClass,
  detailTermClass,
  detailTitleClass,
  dialogContentClass,
  dialogOverlayClass,
  dialogPositionerClass,
  emperorClass,
  emperorDetailsDescriptionClass,
  emperorDetailsTitleClass,
  emptyEmperorClass,
  fullExplanationClass,
  materialUpgradeBlockClass,
  materialUpgradeClass,
  materialUpgradeTextClass,
  materialUpgradeTitleClass,
  materialUpgradesClass,
  modalDetailsClass,
  modalDetailsContentClass,
  modalEmperorClass,
  ownedEmperorsListClass,
  pillClass,
  rotation,
  shopClass,
  shopContainerClass,
  shopHeaderClass,
  shopHeaderItemClass,
  shopHeaderItemsClass,
  shopItemClass,
  shopItemContentClass,
  shopItemCostClass,
  shopItemsClass,
  upgradeCardPreviewClass,
  upgradeDescriptionClass,
  upgradeTitleClass,
} from "./runShop.css"

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
          <Header />
          <Items />
          <Crew />
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
  const cost = createMemo(() => itemCost(props.item, run))

  const disabled = createMemo(
    () =>
      frozen() ||
      cost() > run.money ||
      deck.size >=
        DECK_CAPACITY_PER_LEVEL[
          run.shopLevel as keyof typeof DECK_CAPACITY_PER_LEVEL
        ],
  )

  return (
    <ShopItem
      hue="bone"
      frozen={frozen()}
      cost={cost()}
      disabled={disabled()}
      onClick={props.onClick ? () => props.onClick?.(props.item) : undefined}
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
  const cost = createMemo(() => itemCost(props.item, run))
  const disabled = createMemo(
    () => frozen() || cost() > run.money || emperorCount() >= maxEmperors(run),
  )

  return (
    <ShopItem
      hue="wood"
      frozen={frozen()}
      cost={cost()}
      disabled={disabled()}
      onClick={props.onClick ? () => props.onClick?.(props.item) : undefined}
    >
      <BasicEmperor name={props.item.name} />
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
  const t = useTranslation()

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
            {cardName(t, card())}{" "}
            <Show when={props.material !== "bone"}>
              ({t.material[props.material]()})
            </Show>
          </div>
          <CardPoints card={card()} material={props.material} />
          <CardMultiplier card={card()} material={props.material} />
          <MaterialCoins material={props.material} />
          <MaterialFreedom material={props.material} />
          <Explanation card={card()} />
        </div>
      </div>
      <div class={buttonsClass}>
        <Show when={isTile(props.item)}>
          {(item) => (
            <ShopButton
              type="button"
              hue="bam"
              disabled={itemCost(item(), run) > run.money}
              onClick={() => {
                buyTile(item())
              }}
            >
              <Buy />
              {t.common.buy()} ${itemCost(item(), run)}
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
            <h2 class={upgradeTitleClass}>{t.shop.upgrade.title()}</h2>
            {t.shop.upgrade.description()}
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
  const t = useTranslation()
  const shop = useShopState()
  const run = useRunState()
  const item = createMemo(() => shop.currentItem as EmperorItem)
  const cost = createMemo(() => itemCost(item(), run))
  const emperorCount = createMemo(
    () => run.items.filter((item) => item.type === "emperor").length,
  )
  const disabled = createMemo(
    () => cost() > run.money || emperorCount() >= maxEmperors(run),
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
          <div class={emperorDetailsTitleClass}>
            <EmperorTitle name={item().name} />
          </div>

          <div class={emperorDetailsDescriptionClass}>
            <EmperorDescription name={item().name} />
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
              {t.common.recruit()}
            </ShopButton>
          }
        >
          <ShopButton type="button" hue="dot" onClick={sellCurrentEmperor}>
            <Buy />
            {t.common.sell()} (${cost()})
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
  const cost = createMemo(() => itemCost(item(), run))
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
  const t = useTranslation()

  return (
    <Dialog.Content class={dialogContentClass({ type: "upgrade" })}>
      <CloseButton />
      <div class={modalDetailsContentClass}>
        <div class={detailTitleClass}>
          {t.shop.shopLevel({ num: item().level })}
        </div>
        <dl class={detailListClass({ type: "gold" })}>
          <dt class={detailTermClass}>{t.shop.yieldPerTiles()}</dt>
          <dd class={detailDescriptionClass}>
            <span class={pillClass()}>${item().level}</span>{" "}
          </dd>
        </dl>
        <dl class={detailListClass({ type: "dot" })}>
          <dt class={detailTermClass}>{t.shop.deckCapacity()}</dt>
          <dd class={detailDescriptionClass}>
            {
              DECK_CAPACITY_PER_LEVEL[
                item().level as keyof typeof DECK_CAPACITY_PER_LEVEL
              ]
            }{" "}
            {t.common.pairs()}
          </dd>
        </dl>
        <dl class={detailListClass({ type: "crack" })}>
          <dt class={detailTermClass}>{t.shop.crewCapacity()}</dt>
          <dd class={detailDescriptionClass}>{1 + item().level}</dd>
        </dl>
        <div class={detailListClass({ type: "bam" })}>
          <span class={detailTermClass}>{t.shop.newTiles()}</span>
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
          {t.common.buy()} (${cost()})
        </ShopButton>
      </div>
    </Dialog.Content>
  )
}

export function RerollButton(props: {
  onClick?: () => void
  cost: number
  disabled: boolean
}) {
  return (
    <ShopItem
      hue="diamond"
      cost={props.cost}
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
  const t = useTranslation()

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
      <div class={materialUpgradeBlockClass}>
        <BasicTile
          card={props.item.card}
          material={props.material}
          width={30}
        />
        <div class={materialUpgradeTextClass({ hue: props.material })}>
          <span class={materialUpgradeTitleClass({ hue: props.material })}>
            {t.material[props.material]()}
          </span>
          <Switch>
            <Match
              when={props.material === "glass" || props.material === "diamond"}
            >
              {t.shop.upgrade.easierToMatch()}
            </Match>
            <Match
              when={props.material === "ivory" || props.material === "jade"}
            >
              {t.shop.upgrade.morePoints()}
            </Match>
            <Match
              when={props.material === "bronze" || props.material === "gold"}
            >
              {t.shop.upgrade.getCoins()}
            </Match>
          </Switch>
        </div>
      </div>
      <ShopButton
        type="button"
        hue={props.material}
        disabled={false}
        onClick={() => {
          upgradeTile(props.item)
        }}
      >
        <Buy />
        {t.shop.upgrade.button()}
      </ShopButton>
    </div>
  )
}

function Crew() {
  const run = useRunState()
  const shop = useShopState()
  const t = useTranslation()

  const ownedEmperors = createMemo(
    () => run.items.filter((item) => item.type === "emperor") as EmperorItem[],
  )
  const capacity = createMemo(() => maxEmperors(run))
  const full = createMemo(() => ownedEmperors().length === capacity())
  const empty = createMemo(() => maxEmperors(run) - ownedEmperors().length)
  const ghost = createMemo(() => 7 - empty())

  function selectEmperor(emperor: EmperorItem) {
    shop.currentItem = emperor
  }

  return (
    <div class={areaClass({ hue: "crack" })}>
      <div class={areaTitleClass({ hue: "crack" })}>
        {t.common.crew()} <Show when={full()}>{t.common.isFull()}</Show> (
        {ownedEmperors().length} / {capacity()})
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
        <For each={Array.from({ length: empty() })}>
          {() => <div class={emptyEmperorClass} />}
        </For>
        <For each={Array.from({ length: ghost() })}>{() => <div />}</For>
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
    <div class={areaClass({ hue: "dot" })}>
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

function Items() {
  const run = useRunState()
  const shop = useShopState()
  const t = useTranslation()
  const items = createMemo(() => generateItems(run, shop))
  const rerollCost = createMemo(() =>
    itemCost({ type: "reroll", id: "reroll", level: 1 }, run),
  )
  const rerollDisabled = createMemo(() => rerollCost() > run.money)
  const shopLevel = createMemo(() => run.shopLevel)
  const upgradeCost = createMemo(() =>
    itemCost(
      {
        type: "upgrade",
        level: shopLevel(),
        id: `upgrade-${shopLevel()}`,
      },
      run,
    ),
  )
  const upgradeDisabled = createMemo(() => upgradeCost() > run.money)

  function selectItem(item: Item | null) {
    if (item?.id === shop.currentItem?.id) {
      shop.currentItem = null
    } else {
      shop.currentItem = item
    }
  }

  function reroll() {
    const money = run.money
    if (rerollCost() > money) throw Error("You don't have enough money")

    batch(() => {
      const freeze = run.freeze

      if (freeze && !freeze.active) {
        run.freeze = undefined
      }

      run.money = money - rerollCost()
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

  return (
    <div class={shopContainerClass}>
      <div class={areaTitleClass({ hue: "bam" })}>
        {t.common.shop()} {t.common.levelN({ level: shopLevel() })}
      </div>
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
        <RerollButton
          onClick={reroll}
          disabled={rerollDisabled()}
          cost={rerollCost()}
        />
        <FreezeButton onClick={freeze} />
      </div>
    </div>
  )
}

function Header() {
  const run = useRunState()
  const t = useTranslation()
  const nextRound = createMemo(() => generateRound(run.round + 1, run))

  function continueRun() {
    batch(() => {
      run.round = run.round + 1
      run.stage = "select"
    })
  }

  return (
    <div class={shopHeaderClass}>
      <div class={shopHeaderItemsClass}>
        <LinkButton hue="glass" href="/">
          <Home />
        </LinkButton>
      </div>

      <div class={shopHeaderItemsClass}>
        <CoinCounter money={run.money} />
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
      onMouseEnter={() => !props.disabled && props.onClick && play("click2")}
      class={shopItemClass({
        disabled: props.disabled,
        hue: props.hue,
        hoverable: !!props.onClick,
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
  const t = useTranslation()

  return (
    <div class={shopHeaderItemClass({ hue: "gold" })}>
      <Coins />
      {t.common.coins()}
      <span class={pillClass()}>${props.money}</span>
    </div>
  )
}

export function DeckTitle(props: { pairs: number; capacity: number }) {
  const full = createMemo(() => props.pairs === props.capacity)
  const t = useTranslation()

  return (
    <div class={areaTitleClass({ hue: "dot" })}>
      {t.common.deck()}
      <Show when={full()}> {t.common.isFull()}</Show> ({props.pairs}
      {" / "}
      {props.capacity})
      <Show when={full()}>
        <span class={fullExplanationClass({ hue: "bam" })}>
          {t.shop.fullDeck()}
        </span>
      </Show>
    </div>
  )
}
