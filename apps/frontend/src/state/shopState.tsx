import type { RunState } from "@/state/runState"
import { shuffle } from "@/lib/rand"
import Rand from "rand-seed"
import { batch, createContext, useContext, type ParentProps } from "solid-js"
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
  type Material,
} from "@/lib/game"
import { createPersistantMutable } from "./persistantMutable"
import { nanoid } from "nanoid"
import { countBy, entries } from "remeda"
const SHOP_STATE_NAMESPACE = "shop-state"
export const ITEM_COST = 3
export const SELL_TILE_AMOUNT = 1
export const SELL_MATERIAL_AMOUNT = 1
const MINERAL_PATH = ["glass", "amber", "jade"] as const
const METAL_PATH = ["bronze", "silver", "gold"] as const

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

type CreateShopStateParams = { id: () => string }
export function createShopState(params: CreateShopStateParams) {
  return createPersistantMutable<ShopState>({
    namespace: SHOP_STATE_NAMESPACE,
    id: params.id,
    init: {
      reroll: 0,
      currentItem: null,
      currentDeckTile: null,
    },
  })
}

function generateTileItems(num: number, cards: Card[], level: number) {
  return Array.from({ length: num }, () =>
    cards.flatMap(
      (card) => ({ id: nanoid(), card, type: "tile", level }) as const,
    ),
  ).flat()
}

const TILE_ITEMS: TileItem[] = [
  ...generateTileItems(4, [...bamboo, ...character, ...circle], 1),
  ...generateTileItems(1, [...bamboo, ...character, ...circle], 2),
  ...generateTileItems(5, [...winds, ...dragons], 2),
  ...generateTileItems(1, [...bamboo, ...character, ...circle], 3),
  ...generateTileItems(1, [...winds, ...dragons], 3),
  ...generateTileItems(6, [...flowers, ...seasons], 3),
  ...generateTileItems(1, [...bamboo, ...character, ...circle], 4),
  ...generateTileItems(1, [...winds, ...dragons], 4),
  ...generateTileItems(1, [...flowers, ...seasons], 4),
  ...generateTileItems(1, [...bamboo, ...character, ...circle], 5),
  ...generateTileItems(1, [...winds, ...dragons], 5),
  ...generateTileItems(1, [...flowers, ...seasons], 5),
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

const ITEMS = [...TILE_ITEMS]

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
  run: RunState,
  shop: ShopState,
  item: Item,
  fn: () => void,
) {
  const cost = ITEM_COST
  const money = run.money
  if (cost > money) throw Error("You don't have enough money")

  batch(() => {
    run.money = money - cost
    run.items.push(item)
    shop.currentItem = null
    fn()
  })
}

export function sellDeckTile(
  run: RunState,
  deck: Deck,
  shop: ShopState,
  deckTile: DeckTile,
) {
  let cost = SELL_TILE_AMOUNT
  const material = deckTile.material
  const money = run.money

  if (material === "bone") {
    cost += SELL_MATERIAL_AMOUNT
  }

  batch(() => {
    run.money = money + cost
    shop.currentDeckTile = null
    deck.del(deckTile.id)
  })
}

function mergeCounts(
  count: Partial<Record<Material, number | undefined>>,
  path: "mineral" | "metal",
) {
  const order = [
    "bone",
    ...(path === "mineral" ? MINERAL_PATH : METAL_PATH),
  ] as const
  const newCount = { ...count }

  for (const [i, material] of order.entries()) {
    const next = order[i + 1]
    if (!next) continue
    if (!newCount[material]) continue

    while (newCount[material] === 2) {
      delete newCount[material]
      newCount[next] = (newCount[next] || 0) + 1
    }
  }

  return newCount
}

export function getNextMaterials(tiles: DeckTile[], path: "mineral" | "metal") {
  const count = countBy(tiles, (tile) => tile.material)
  count.bone = (count.bone || 0) + 1
  const newCount = mergeCounts(count, path)

  const result: Material[] = []
  for (const [material, count] of entries(newCount)) {
    for (let i = 0; i < count; i++) {
      result.push(material)
    }
  }
  return result
}

export function getNextMaterial(tiles: DeckTile[], path: "mineral" | "metal") {
  const materials = getNextMaterials(tiles, path)
  return materials[materials.length - 1]
}

export type MaterialTransformation = {
  updates: Record<string, Material>
  removes: string[]
}
export function getTransformation(
  tiles: DeckTile[],
  path: "mineral" | "metal",
): MaterialTransformation {
  const nextMaterials = getNextMaterials(tiles, path)
  const updates: Record<string, Material> = {}
  const removes: string[] = []

  for (const [index, tile] of tiles.entries()) {
    if (nextMaterials[index]) {
      updates[tile.id] = nextMaterials[index]
    } else {
      removes.push(tile.id)
    }
  }

  return { updates, removes }
}
