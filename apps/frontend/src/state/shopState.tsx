import type { RunState } from "@/state/runState"
import type { Value } from "@repo/game/in-memoriam"
import { shuffle } from "@repo/game/lib/rand"
import type { Material } from "@repo/game/tile"
import Rand from "rand-seed"
import { entries } from "remeda"
import {
  batch,
  createContext,
  createEffect,
  createMemo,
  on,
  useContext,
  type ParentProps,
} from "solid-js"
import { createMutable, modifyMutable, reconcile } from "solid-js/store"
import {
  bamboo,
  character,
  circle,
  dragons,
  flowers,
  seasons,
  winds,
  type Card,
  type Deck,
  type DeckSizeLevel,
  type DeckTile,
} from "@repo/game/deck"
const SHOP_STATE_NAMESPACE = "shop-state"
export const ITEM_COST = 3
export const SELL_TILE_AMOUNT = 1
export const SELL_MATERIAL_AMOUNT = 1

type BaseItem = {
  id: string
  level: number
}
export type MaterialItem = BaseItem & {
  material: Material
  suit: keyof typeof SUITS
  type: "material"
}
// TODO: Add other items
type OtherItem = BaseItem & {
  type: "emperor" | "horoscope"
}
export type TileItem = BaseItem & {
  card: Card
  type: "tile"
}
export type UpgradeItem = BaseItem & {
  type: "upgrade"
  level: DeckSizeLevel
}
export type Item = MaterialItem | TileItem | UpgradeItem | OtherItem
export type ShopState = {
  reroll: number
  currentItem: Item | null
  // TODO: Perhaps bundle with currentItem?
  currentDeckTile: DeckTile | null
}

const ShopStateContext = createContext<ShopState | undefined>()

export function ShopStateProvider(props: { shop: ShopState } & ParentProps) {
  return (
    <ShopStateContext.Provider value={props.shop}>
      {props.children}
    </ShopStateContext.Provider>
  )
}

export function useShopState() {
  const context = useContext(ShopStateContext)

  if (!context) {
    throw new Error("can't find ShopStateContext")
  }

  return context
}

function key(runId: string) {
  return `${SHOP_STATE_NAMESPACE}-${runId}`
}

export function createShopState(run: RunState) {
  const shop = createMutable<ShopState>({
    reroll: 0,
    currentItem: null,
    currentDeckTile: null,
  })
  const runId = createMemo(() => run.runId)

  createEffect(
    on(runId, (id) => {
      const persistedState = localStorage.getItem(key(id))
      if (persistedState) {
        modifyMutable(shop, reconcile(JSON.parse(persistedState)))
      }
    }),
  )

  createEffect(() => {
    localStorage.setItem(key(runId()), JSON.stringify(shop))
  })

  return shop
}

/**
 * +-----------+
 * | Pool size |
 * +-----------+----------+----------+----------+----------+----------+
 * | ITEM TYPE | LEVEL 1  | LEVEL 2  | LEVEL 3  | LEVEL 4  | LEVEL 5  |
 * +-----------+----------+----------+----------+----------+----------+
 * | TILE      | 27 (82%) | 34 (68%) | 42 (57%) | 42 (53%) | 42 (50%) |
 * |-----------+----------+----------+----------+----------+----------+
 * | MATERIAL  |  6 (18%) | 16 (32%) | 30 (43%) | 38 (47%) | 42 (50%) |
 * +-----------+----------+----------+----------+----------+----------+
 */
// TODO: perhaps unify honors?
export const TILE_ITEMS: TileItem[] = [
  ...bamboo.map(
    (card) => ({ id: card, card, type: "tile", level: 1 }) as const,
  ),
  ...character.map(
    (card) => ({ id: card, card, type: "tile", level: 1 }) as const,
  ),
  ...circle.map(
    (card) => ({ id: card, card, type: "tile", level: 1 }) as const,
  ),
  ...winds.map((card) => ({ id: card, card, type: "tile", level: 2 }) as const),
  ...dragons.map(
    (card) => ({ id: card, card, type: "tile", level: 2 }) as const,
  ),
  ...flowers.map(
    (card) => ({ id: card, card, type: "tile", level: 3 }) as const,
  ),
  ...seasons.map(
    (card) => ({ id: card, card, type: "tile", level: 3 }) as const,
  ),
  // TODO: tier 4 and 5 tiles
]

const SUITS = {
  b: 0,
  c: 0,
  o: 0,
  d: 1,
  w: 1,
  f: 2,
  s: 2,
} as const

export const MATERIAL_ITEMS: MaterialItem[] = entries(SUITS).flatMap(
  ([suit, level]) => [
    {
      id: `wood-${suit}`,
      material: "wood",
      type: "material",
      level: 1 + level,
      suit,
    },
    {
      id: `glass-${suit}`,
      material: "glass",
      type: "material",
      level: 2 + level,
      suit,
    },
    {
      id: `ivory-${suit}`,
      material: "ivory",
      type: "material",
      level: 3 + level,
      suit,
    },
    {
      id: `bronze-${suit}`,
      material: "bronze",
      type: "material",
      level: 1 + level,
      suit,
    },
    {
      id: `gold-${suit}`,
      material: "gold",
      type: "material",
      level: 2 + level,
      suit,
    },
    {
      id: `jade-${suit}`,
      material: "jade",
      type: "material",
      level: 3 + level,
      suit,
    },
  ],
)

// We include several copies of the same items so people can
// buy the same item multiple times, but statistically it's
// the same as if we only included one copy.
const ITEMS = [
  ...TILE_ITEMS,
  ...TILE_ITEMS,
  ...TILE_ITEMS,
  ...TILE_ITEMS,
  ...MATERIAL_ITEMS,
  ...MATERIAL_ITEMS,
  ...MATERIAL_ITEMS,
  ...MATERIAL_ITEMS,
]

export function generateItems(run: RunState, reroll: number) {
  const runId = run.runId
  const shopLevel = run.shopLevel
  const rng = new Rand(`items-${runId}-${run.round}`)
  const itemIds = new Set(run.items.map((i) => i.id))

  const initialPool = ITEMS.filter((item) => item.level <= shopLevel)
  const poolSize = initialPool.length

  const start = (5 * reroll) % poolSize

  const shuffled = shuffle(initialPool, rng).filter(
    (item) => !itemIds.has(item.id),
  )

  const items = []
  for (let i = 0; i < 5; i++) {
    const index = (start + i) % shuffled.length
    items.push(shuffled[index]!)
  }

  return items
}

export function buyItem(
  run: Value<RunState>,
  shop: ShopState,
  item: Item,
  fn: () => void,
) {
  const cost = ITEM_COST
  const money = run.get().money
  if (cost > money) throw Error("You don't have enough money")

  batch(() => {
    run.set({
      money: money - cost,
      items: run.get().items.concat([item]),
    })
    shop.currentItem = null
    fn()
  })
}

export function sellDeckTile(
  run: Value<RunState>,
  deck: Deck,
  shop: ShopState,
  deckTile: DeckTile,
) {
  let cost = SELL_TILE_AMOUNT
  const material = deckTile.material
  const money = run.get().money

  if (material === "bone") {
    cost += SELL_MATERIAL_AMOUNT
  }

  batch(() => {
    run.set({ money: money + cost })
    shop.currentDeckTile = null
    deck.del(deckTile.id)
  })
}
