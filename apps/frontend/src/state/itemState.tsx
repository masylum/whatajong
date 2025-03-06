import type { RunState } from "@/state/runState"
import type { Material } from "@repo/game/tile"
import Rand from "rand-seed"

// biome-ignore format:
const ITEMS: Item[] = [
  { id: "wood", type: "material", odds: 30, cost: 3 },
  { id: "glass", type: "material", odds: 10, cost: 6 },
  { id: "ivory", type: "material", odds: 3, cost: 12 },
  { id: "bronze", type: "material", odds: 30, cost: 3 },
  { id: "gold", type: "material", odds: 10, cost: 6 },
  { id: "jade", type: "material", odds: 3, cost: 12 },
]

type BaseItem = {
  odds: number
  cost: number
}

export type MaterialItem = BaseItem & {
  id: Material
  type: "material"
}

// TODO: Add other items
type OtherItem = BaseItem & {
  id: string
  type: "tile" | "emperor" | "horoscope"
}

export type Item = MaterialItem | OtherItem

export function generateItems(run: RunState) {
  const id = run.round + run.reroll
  const runId = run.runId

  // TODO: Dry seeding
  const rng = new Rand(`items-${runId}-${id}`)
  const deck: Item[] = []

  // Add each enhancement to the deck the number of times equal to its odds
  for (const enhancement of ITEMS) {
    for (let i = 0; i < enhancement.odds; i++) {
      deck.push(enhancement)
    }
  }

  // TODO: DRY shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    const temp = deck[i]
    deck[i] = deck[j] as Item
    deck[j] = temp as Item
  }

  const result: Item[] = []

  for (const items of deck) {
    result.push(items)

    if (result.length >= 5) {
      break
    }
  }

  return result
}
