import { play } from "@/components/audio"
import {
  type Card,
  type CardId,
  type Deck,
  type DeckTile,
  type Material,
  getAllTiles,
} from "@/lib/game"
import { captureEvent } from "@/lib/observability"
import { shuffle } from "@/lib/rand"
import type { RunState } from "@/state/runState"
import { nanoid } from "nanoid"
import Rand from "rand-seed"
import { countBy, entries } from "remeda"
import { type ParentProps, batch, createContext, useContext } from "solid-js"
import { createPersistantMutable } from "./persistantMutable"

const SHOP_STATE_NAMESPACE = "shop-state-v3"
const ITEM_COST = 3
export const REROLL_COST = 1
const ITEM_COUNT = 5
const ITEM_POOL_SIZE = 8

export function itemCost(item: TileItem) {
  return ITEM_COST + item.level - 1
}

const PATHS = {
  r: ["garnet", "ruby"],
  g: ["jade", "emerald"],
  b: ["topaz", "sapphire"],
  k: ["quartz", "obsidian"],
} as const
export type Path = keyof typeof PATHS

type BaseItem = {
  id: string
}

export type TileItem = BaseItem & {
  cardId: CardId
  type: "tile"
  level: number
}

export type DeckTileItem = BaseItem & {
  cardId: CardId
  material: Material
  type: "deckTile"
}

type ShopState = {
  reroll: number
  currentItem: TileItem | DeckTileItem | null
}

export function isTile(item: TileItem | DeckTileItem) {
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

export function generateTileItem({ card, i }: { card: Card; i: number }) {
  return {
    id: `tile-${card.id}-${i}`,
    cardId: card.id,
    type: "tile",
    level: card.level,
  } as TileItem
}

export function generateItems(run: RunState, shop: ShopState) {
  const runId = run.runId
  const round = run.freeze?.round || run.round
  const rng = new Rand(`items-${runId}-${round}`)
  const itemIds = new Set(run.items.map((i) => i.id))

  const level = run.round
  const initialPool = Array.from({ length: ITEM_POOL_SIZE }, (_, i) =>
    getAllTiles()
      .filter((t) => t.level <= level)
      .flatMap((card) => generateTileItem({ card, i })),
  ).flat()
  const poolSize = initialPool.length
  const reroll = run.freeze?.reroll || shop.reroll
  const start = (ITEM_COUNT * reroll) % poolSize
  const shuffled = shuffle(initialPool, rng).filter(
    (item) => !itemIds.has(item.id),
  )

  const items = []
  for (let i = 0; i < ITEM_COUNT; i++) {
    const index = (start + i) % shuffled.length
    items.push(shuffled[index]!)
  }

  return items
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
  return materials[materials.length - 1]!
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

export function buyTile({
  run,
  shop,
  item,
  deck,
  reward = false,
}: {
  run: RunState
  shop: ShopState
  item: TileItem
  deck: Deck
  reward?: boolean
}) {
  const cost = reward ? 0 : itemCost(item)
  const money = run.money
  if (cost > money) throw Error("You don't have enough money")

  batch(() => {
    run.money = money - cost
    run.items.push(item)
    shop.currentItem = null
    const id = nanoid()
    deck.set(id, { id, material: "bone", cardId: item.cardId })
  })

  if (!reward) {
    play("coin2")
    captureEvent("tile_bought", { cardId: item.cardId })
  }
}

export function upgradeTile({
  run,
  shop,
  item,
  deck,
  path,
}: {
  run: RunState
  shop: ShopState
  item: TileItem
  deck: Deck
  path: Path
}) {
  const cost = itemCost(item)
  const money = run.money
  if (cost > money) throw Error("You don't have enough money")

  batch(() => {
    run.money = money - cost
    run.items.push(item)
    shop.currentItem = null
    const { updates, removes } = getTransformation(
      deck.filterBy({ cardId: item.cardId }),
      path,
    )

    for (const [id, material] of entries(updates)) {
      deck.set(id, { id, material, cardId: item.cardId })
    }

    for (const id of removes) {
      deck.del(id)
    }
  })

  play("coin2")
  captureEvent("tile_upgraded", { cardId: item.cardId, path })
}
