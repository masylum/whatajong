import type { RunState } from "@/state/runState"
import { shuffle } from "@/lib/rand"
import Rand from "rand-seed"
import { batch, createContext, useContext, type ParentProps } from "solid-js"
import {
  bams,
  cracks,
  dots,
  dragons,
  flowers,
  jokers,
  mutations,
  phoenix,
  rabbits,
  seasons,
  transports,
  winds,
  type Card,
  type DeckTile,
  type Level,
  type Material,
} from "@/lib/game"
import { createPersistantMutable } from "./persistantMutable"
import { countBy, entries } from "remeda"
import { getEmperors, type Emperor } from "./emperors"
import { play } from "@/components/audio"
import { nanoid } from "nanoid"
import { captureEvent } from "@/lib/observability"

const SHOP_STATE_NAMESPACE = "shop-state"

const ITEM_COST = 20
const EMPEROR_COST = 60

export const SELL_EMPEROR_AMOUNT = 30

export function emperorCost(level: number) {
  return EMPEROR_COST + 10 * (level - 1)
}

export function itemCost(level: number) {
  return ITEM_COST + 10 * (level - 1)
}

const PATHS = {
  freedom: ["glass", "diamond"],
  points: ["ivory", "jade"],
  coins: ["bronze", "gold"],
} as const
export type Path = keyof typeof PATHS

type BaseItem = {
  id: string
}

export type EmperorItem = BaseItem & {
  type: "emperor"
  name: string
  level: Level
}

export type TileItem = BaseItem & {
  card: Card
  type: "tile"
  level: Level
}

export type DeckTileItem = BaseItem & {
  card: Card
  material: Material
  type: "deckTile"
}

export type UpgradeItem = BaseItem & {
  type: "upgrade"
  level: Level
}

export type Item = TileItem | UpgradeItem | EmperorItem
type ShopState = {
  reroll: number
  currentItem: Item | DeckTileItem | null
}

export function isTile(item: Item | DeckTileItem) {
  if (item.type === "tile") return item

  return null
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
    }),
  })
}

function generateTileItems(level: Level, num: number, cards: Card[]) {
  return Array.from({ length: num }, (_, i) =>
    cards.flatMap(
      (card, j) =>
        ({ id: `tile-${level}-${i}-${j}`, card, type: "tile", level }) as const,
    ),
  ).flat()
}

export function generateEmperorItem(emperor: Emperor) {
  return {
    id: nanoid(),
    name: emperor.name,
    type: "emperor" as const,
    level: emperor.level,
  }
}

function generateEmperorItems() {
  return getEmperors().map(generateEmperorItem)
}

export function generateShopItems(): Item[] {
  return [
    ...generateTileItems(1, 9, [...bams, ...cracks, ...dots]),
    ...generateTileItems(2, 9, [...rabbits, ...flowers, ...seasons]),
    ...generateTileItems(3, 9, [...dragons, ...phoenix]),
    ...generateTileItems(4, 9, [...winds, ...mutations]),
    ...generateTileItems(5, 9, [...jokers, ...jokers, ...transports]),
    // emperors
    ...generateEmperorItems(),
  ]
}

export function generateItems(run: RunState, shop: ShopState) {
  const runId = run.runId
  const shopLevel = run.shopLevel
  const round = run.freeze?.round || run.round
  const rng = new Rand(`items-${runId}-${round}`)
  const itemIds = new Set(run.items.map((i) => i.id))

  const initialPool = run.shopItems.filter((item) => item.level <= shopLevel)
  const poolSize = initialPool.length
  const reroll = run.freeze?.reroll || shop.reroll

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
  const cost =
    item.type === "emperor" ? emperorCost(item.level) : itemCost(item.level)
  const money = run.money
  if (cost > money) throw Error("You don't have enough money")

  batch(() => {
    run.money = money - cost
    run.items.push(item)
    shop.currentItem = null
    fn()
  })

  captureEvent("item_bought", item)
  play("coin2")
}

function mergeCounts(
  count: Partial<Record<Material, number | undefined>>,
  path: Path,
) {
  const order = ["bone", ...PATHS[path]] as const
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

export function getNextMaterials(tiles: DeckTile[], path: Path) {
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

export function getNextMaterial(tiles: DeckTile[], path: Path) {
  const materials = getNextMaterials(tiles, path)
  return materials[materials.length - 1]
}

type MaterialTransformation = {
  adds: boolean
  updates: Record<string, Material>
  removes: string[]
}
export function getTransformation(
  tiles: DeckTile[],
  path: Path,
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

  play("coin2")
}

export function maxEmperors(run: RunState) {
  return 1 + run.shopLevel
}
