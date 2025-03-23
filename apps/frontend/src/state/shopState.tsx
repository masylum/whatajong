import type { RunState } from "@/state/runState"
import { shuffle } from "@/lib/rand"
import Rand from "rand-seed"
import { batch, createContext, useContext, type ParentProps } from "solid-js"
import {
  animals,
  bams,
  cracks,
  dots,
  dragons,
  flowers,
  jokers,
  phoenix,
  rabbits,
  seasons,
  transports,
  winds,
  type Card,
  type DeckTile,
  type Material,
} from "@/lib/game"
import { createPersistantMutable } from "./persistantMutable"
import { countBy, entries } from "remeda"
import { EMPERORS } from "./emperors"

const SHOP_STATE_NAMESPACE = "shop-state"
export const ITEM_COST = 20
export const EMPEROR_COST = 100
export const SELL_EMPEROR_AMOUNT = 30

const MINERAL_PATH = ["glass", "jade"] as const
const METAL_PATH = ["bronze", "gold"] as const

type BaseItem = {
  id: string
  level: number
}

export type EmperorItem = BaseItem & {
  type: "emperor"
  name: string
  description: string
}

export type TileItem = BaseItem & {
  card: Card
  type: "tile"
}
export type UpgradeItem = BaseItem & {
  type: "upgrade"
  level: number
}
export type Item = TileItem | UpgradeItem | EmperorItem
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
    init: () => ({
      reroll: 0,
      currentItem: null,
      currentDeckTile: null,
    }),
  })
}

function generateTileItems(level: number, num: number, cards: Card[]) {
  return Array.from({ length: num }, (_, i) =>
    cards.flatMap(
      (card, j) =>
        ({ id: `tile-${level}-${i}-${j}`, card, type: "tile", level }) as const,
    ),
  ).flat()
}

export function generateEmperorItems() {
  return EMPERORS.flatMap((emperor, i) => ({
    id: `emperor-${i}`,
    name: emperor.name,
    type: "emperor" as const,
    level: emperor.level,
    description: emperor.description,
  }))
}

export const ITEMS: Item[] = [
  ...generateTileItems(1, 9, [...bams, ...cracks, ...dots]),
  ...generateTileItems(2, 9, [...dragons, ...flowers, ...seasons]),
  ...generateTileItems(3, 9, [...rabbits, ...phoenix]),
  ...generateTileItems(4, 9, [...winds, ...animals]),
  ...generateTileItems(5, 9, [...jokers, ...transports]),
  // emperors
  ...generateEmperorItems(),
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
  run: RunState,
  shop: ShopState,
  item: Item,
  fn: () => void,
) {
  const cost = item.type === "emperor" ? EMPEROR_COST : ITEM_COST
  const money = run.money
  if (cost > money) throw Error("You don't have enough money")

  batch(() => {
    run.money = money - cost
    run.items.push(item)
    shop.currentItem = null
    fn()
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

    while (newCount[material] >= 3) {
      newCount[material] = (newCount[material] || 0) - 3
      newCount[next] = (newCount[next] || 0) + 1

      if (newCount[material] === 0) {
        delete newCount[material]
      }
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
  adds: boolean
  updates: Record<string, Material>
  removes: string[]
}
export function getTransformation(
  tiles: DeckTile[],
  path: "mineral" | "metal",
): MaterialTransformation {
  const nextMaterials = getNextMaterials(tiles, path)
  const currentMaterials = tiles.map((tile) => tile.material)
  const updates: Record<string, Material> = {}
  const removes: string[] = []
  let adds = false

  for (const [index, tile] of tiles.entries()) {
    const mat = nextMaterials[index]
    if (!mat) {
      removes.push(tile.id)
      continue
    }

    if (mat !== tile.material) {
      updates[tile.id] = mat
    }
  }

  for (const [index, _] of nextMaterials.entries()) {
    if (!currentMaterials[index]) adds = true
  }

  return { adds, updates, removes }
}

export function sellEmperor(
  run: RunState,
  shop: ShopState,
  emperor: EmperorItem,
) {
  const cost = SELL_EMPEROR_AMOUNT
  const money = run.money

  batch(() => {
    run.money = money + cost
    shop.currentItem = null
    run.items = run.items.filter((item) => item.id !== emperor.id)
  })
}

export function maxEmperors(run: RunState) {
  return 2 + run.shopLevel
}
