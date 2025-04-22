import type Rand from "rand-seed"
import { type DeckTile, type Tile, getMap, initTileDb, mapGet } from "./game"
import { getFreeTiles } from "./game"
import { shuffle } from "./rand"

// From paper: https://iivq.net/scriptie/scriptie-bsc.pdf
export function setupTiles({ rng, deck }: { rng: Rand; deck: DeckTile[] }) {
  const tileDb = initTileDb({})
  const map = getMap(deck.length * 2)

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
          tileDb.set(id, {
            cardId: "b1",
            material: "bone",
            id,
            x,
            y,
            z,
            deleted: false,
            selected: false,
          })
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

    while (freeTiles.length > 1) {
      // Randomly select two free tiles
      const idx1 = Math.floor(rng.next() * freeTiles.length)
      const tile1 = freeTiles[idx1]!
      freeTiles.splice(idx1, 1)

      const idx2 = Math.floor(rng.next() * freeTiles.length)
      const tile2 = freeTiles[idx2]!
      freeTiles.splice(idx2, 1)

      // Remove the pair and store their positions
      tileDb.del(tile1.id)
      tileDb.del(tile2.id)
      pickOrder.push(tile1, tile2)
    }
  }

  // If we couldn't remove all tiles, start over
  if (tileDb.size > 0) {
    return setupTiles({ rng, deck })
  }

  // Convert deck into pairs of cards based on tile counts
  const pairs: [DeckTile, DeckTile][] = []
  for (const deckTile of deck) {
    pairs.push([deckTile, deckTile])
  }
  const shuffledPairs = shuffle(pairs, rng)

  // Place tiles back in reverse order with actual cards
  for (let i = 0; i < pickOrder.length; i += 2) {
    const tile1 = pickOrder[pickOrder.length - 1 - i]!
    const tile2 = pickOrder[pickOrder.length - 2 - i]!

    const pair = shuffledPairs[i / 2]!
    const [deckTile1, deckTile2] = pair

    const id1 = mapGet(map, tile1.x, tile1.y, tile1.z)!
    const id2 = mapGet(map, tile2.x, tile2.y, tile2.z)!

    tileDb.set(id1, {
      id: id1,
      cardId: deckTile1.cardId,
      material: deckTile1.material,
      x: tile1.x,
      y: tile1.y,
      z: tile1.z,
      deleted: false,
      selected: false,
    })

    tileDb.set(id2, {
      id: id2,
      cardId: deckTile2.cardId,
      material: deckTile2.material,
      x: tile2.x,
      y: tile2.y,
      z: tile2.z,
      deleted: false,
      selected: false,
    })
  }

  return tileDb.byId
}
