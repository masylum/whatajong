import { getDeck } from "./deck"
import { mapGet } from "./map"
import { DEFAULT_MAP } from "./maps/default"
import type { Tile } from "./tile"
import { getFreeTiles, initTileDb } from "./tile"

export function setup() {
  const tileDb = initTileDb({})
  const map = DEFAULT_MAP

  // Get all valid positions from the map
  for (const z of map.keys()) {
    for (const y of map[z]!.keys()) {
      for (const x of map[z]![y]!.keys()) {
        const id = mapGet(map, x, y, z)
        const prev = mapGet(map, x - 1, y, z)
        const above = mapGet(map, x, y - 1, z)
        const sameAsPrev = prev ? prev === id : false
        const sameAsAbove = above ? above === id : false

        if (id !== null && !sameAsPrev && !sameAsAbove) {
          tileDb.set(id, { card: "d1", selections: [], id, x, y, z })
        }
      }
    }
  }

  // Array to store the order in which tiles were removed
  const pickOrder: Tile[] = []

  // Keep removing pairs until we can't anymore
  while (true) {
    const freeTiles = getFreeTiles(tileDb)
    if (freeTiles.length <= 1) break

    // Randomly select two free tiles
    const idx1 = Math.floor(Math.random() * freeTiles.length)
    const tile1 = freeTiles[idx1]!
    freeTiles.splice(idx1, 1)

    const idx2 = Math.floor(Math.random() * freeTiles.length)
    const tile2 = freeTiles[idx2]!

    // Remove the pair and store their positions
    tileDb.del(tile1.id)
    tileDb.del(tile2.id)
    pickOrder.push(tile1, tile2)
  }

  // If we couldn't remove all tiles, start over
  if (tileDb.size > 0) {
    return setup()
  }

  // Get all possible card pairs
  const allPairs = getDeck()

  // Place tiles back in reverse order with actual cards
  for (let i = 0; i < pickOrder.length; i += 2) {
    const tile1 = pickOrder[pickOrder.length - 1 - i]!
    const tile2 = pickOrder[pickOrder.length - 2 - i]!
    const [card1, card2] = allPairs[i / 2]!

    const id1 = mapGet(map, tile1.x, tile1.y, tile1.z)!
    const id2 = mapGet(map, tile2.x, tile2.y, tile2.z)!

    tileDb.set(id1, {
      id: id1,
      card: card1,
      selections: [],
      x: tile1.x,
      y: tile1.y,
      z: tile1.z,
    })

    tileDb.set(id2, {
      id: id2,
      card: card2,
      selections: [],
      x: tile2.x,
      y: tile2.y,
      z: tile2.z,
    })
  }

  return tileDb.byId
}
