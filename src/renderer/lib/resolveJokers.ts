import { play } from "@/components/audio"
import { DELETED_DURATION, animate } from "@/state/animationState"
import type { Game } from "@/state/gameState"
import Rand from "rand-seed"
import { batch } from "solid-js"
import { isJoker } from "./game"
import { type Tile, type TileDb, cardsMatch, initTileDb } from "./game"
import { getFreeTiles } from "./game"
import { shuffle } from "./rand"

export function resolveJokers({
  tileDb,
  tile,
}: { tileDb: TileDb; tile: Tile; game: Game }) {
  const jokerCard = isJoker(tile.cardId)
  if (!jokerCard) return

  play("joker")

  batch(() => {
    for (const tile of tileDb.filterBy({ deleted: false })) {
      animate({ id: tile.id, name: "deleted" })
    }
  })

  setTimeout(() => {
    batch(() => {
      for (const tile of tileDb.all) {
        animate({ id: tile.id, name: "fall" })
      }
      const rng = new Rand()
      shuffleTiles({ rng, tileDb })
      play("tiles")
    })
  }, DELETED_DURATION + 100)
}

type ResolveJokerArgs = {
  rng: Rand
  tileDb: TileDb
}
function shuffleTiles({ rng, tileDb }: ResolveJokerArgs) {
  const newTileDb = initTileDb({})
  const currentTiles = tileDb.all.filter((tile) => !tile.deleted)

  // Copy all tiles from the old tileDb to the new one, but with dumb tiles
  for (const tile of currentTiles) {
    newTileDb.set(tile.id, {
      cardId: "bam1",
      material: "bone",
      id: tile.id,
      x: tile.x,
      y: tile.y,
      z: tile.z,
      deleted: false,
      selected: false,
    })
  }

  // Array to store the order in which tiles were removed
  const pickOrder: Tile[] = []

  // Keep removing pairs until we can't anymore
  while (true) {
    const freeTiles = getFreeTiles(newTileDb)
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
      newTileDb.del(tile1.id)
      newTileDb.del(tile2.id)
      pickOrder.push(tile1, tile2)
    }
  }

  // If we couldn't remove all tiles, start over
  if (newTileDb.size > 0) {
    return shuffleTiles({ rng, tileDb })
  }

  const pairs: [Tile, Tile][] = []
  const usedTileIds = new Set<string>()

  for (let i = 0; i < currentTiles.length; i++) {
    const tile1 = currentTiles[i]!
    if (usedTileIds.has(tile1.id)) continue

    for (let j = i + 1; j < currentTiles.length; j++) {
      const tile2 = currentTiles[j]!
      if (usedTileIds.has(tile2.id)) continue

      if (cardsMatch(tile1.cardId, tile2.cardId)) {
        pairs.push([tile1, tile2])
        usedTileIds.add(tile1.id)
        usedTileIds.add(tile2.id)
        break
      }
    }
  }

  const shuffledPairs = shuffle(pairs, rng)

  for (const tile of tileDb.all) {
    tileDb.del(tile.id)
  }

  // Place tiles back in reverse order with actual cards
  for (let i = 0; i < pickOrder.length; i += 2) {
    const tile1 = pickOrder[pickOrder.length - 1 - i]!
    const tile2 = pickOrder[pickOrder.length - 2 - i]!

    const pair = shuffledPairs[i / 2]!
    const [deckTile1, deckTile2] = pair

    const id1 = tile1.id
    const id2 = tile2.id

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
