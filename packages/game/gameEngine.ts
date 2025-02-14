import { getDeck, getPoints, getSuit } from "./deck"
import { getPosition, isFree, mapGet } from "./map"
import { DEFAULT_MAP } from "./maps/default"
import type { Asset, AssetById, GameState, Tile, TileById } from "./types"

export function initializeGame() {
  const tiles: TileById = {}
  const map = DEFAULT_MAP()

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
          tiles[id] = {
            card: "d1",
            deleted: false,
            id,
            position: { x, y, z },
          }
        }
      }
    }
  }

  // Array to store the order in which tiles were removed
  const pickOrder: Tile[] = []
  const assets: AssetById = {}
  const gameState = { map, tiles, assets }

  // Keep removing pairs until we can't anymore
  while (true) {
    const freeTiles = getFreeTiles(gameState)
    if (freeTiles.length <= 1) break

    // Randomly select two free tiles
    const idx1 = Math.floor(Math.random() * freeTiles.length)
    const tile1 = freeTiles[idx1]!
    freeTiles.splice(idx1, 1)

    const idx2 = Math.floor(Math.random() * freeTiles.length)
    const tile2 = freeTiles[idx2]!

    // Remove the pair and store their positions
    removeTiles(gameState, [tile1, tile2])
    pickOrder.push(tile1, tile2)
  }

  // If we couldn't remove all tiles, start over
  if (Object.values(tiles).some((t) => !t.deleted)) {
    return initializeGame()
  }

  // Get all possible card pairs
  const allPairs = getDeck()

  // Place tiles back in reverse order with actual cards
  for (let i = 0; i < pickOrder.length; i += 2) {
    const tile1 = pickOrder[pickOrder.length - 1 - i]!
    const tile2 = pickOrder[pickOrder.length - 2 - i]!
    const pos1 = getPosition(gameState, tile1)!
    const pos2 = getPosition(gameState, tile2)!
    const [card1, card2] = allPairs[i / 2]!

    const id1 = mapGet(map, pos1.x, pos1.y, pos1.z)!
    const id2 = mapGet(map, pos2.x, pos2.y, pos2.z)!

    tiles[id1] = {
      card: card1,
      deleted: false,
      id: id1,
      position: pos1,
    }

    tiles[id2] = {
      card: card2,
      deleted: false,
      id: id2,
      position: pos2,
    }
  }

  return tiles
}

export function removeTiles(gameState: GameState, tiles: Tile[]) {
  const areFree = Object.values(tiles).every((tile) => isFree(gameState, tile))
  if (!areFree) return

  const ids = new Set(tiles.map((tile) => tile.id))

  for (const id of ids) {
    if (ids.has(id)) {
      gameState.tiles[id]!.deleted = true
    }
  }

  return
}

export function getFreeTiles(gameState: GameState): Tile[] {
  return Object.values(gameState.tiles).filter(
    (tile) => !tile.deleted && isFree(gameState, tile),
  )
}

export function getAvailablePairs(gameState: GameState): [Tile, Tile][] {
  const freeTiles = getFreeTiles(gameState)
  const pairs: [Tile, Tile][] = []

  for (let i = 0; i < freeTiles.length; i++) {
    for (let j = i + 1; j < freeTiles.length; j++) {
      const tile1 = freeTiles[i]!
      const tile2 = freeTiles[j]!
      if (!tilesMatch(tile1, tile2)) continue

      pairs.push([tile1, tile2])
    }
  }

  return pairs
}

export function tilesMatch(tile1: Tile, tile2: Tile) {
  if (tile1.card === tile2.card) return true

  const suit1 = getSuit(tile1.card)
  const suit2 = getSuit(tile2.card)
  if (suit1 === "f" && suit2 === "f") return true
  if (suit1 === "s" && suit2 === "s") return true

  return false
}

export function calculatePoints(assets: Asset[]) {
  let points = 0

  for (const asset of assets) {
    const card = asset.card
    const suit = getSuit(card)

    if (suit === "f" || suit === "s") {
      points += 27
      continue
    }

    if (suit === "d") {
      points += 18
      continue
    }

    if (suit === "w") {
      points += 9
      continue
    }

    points += getPoints(card)
  }

  return points
}
