import { cardsMatch, getPoints, getSuit, type Card } from "./deck"
import { Database } from "./in-memoriam"

export type Position = {
  x: number
  y: number
  z: number
}

export type Tile = {
  id: string
  card: Card
  selections: Array<string | null>
  deletedBy?: string
} & Position
export type TileById = Record<string, Tile>
export const tileIndexes = ["x", "y", "z", "deletedBy"] as const
export type TileIndexes = (typeof tileIndexes)[number]
export type TileDb = Database<Tile, TileIndexes>

export function initTileDb(tiles: TileById): TileDb {
  const tileDb = new Database<Tile, TileIndexes>({
    indexes: tileIndexes,
  })

  for (const tile of Object.values(tiles)) {
    tileDb.set(tile.id, tile)
  }

  return tileDb
}

export function getFreeTiles(tileDb: TileDb): Tile[] {
  return tileDb.all.filter((tile) => !tile.deletedBy && isFree(tileDb, tile))
}

export function fullyOverlaps(
  tileDb: TileDb,
  position: Position,
  z: number,
): boolean {
  const find = getFinder(tileDb, position)

  const left = find(-1, 0, z)
  const right = find(1, 0, z)
  const top = find(0, -1, z)
  const bottom = find(0, 1, z)
  const topLeft = find(-1, -1, z)
  const topRight = find(1, -1, z)
  const bottomLeft = find(-1, 1, z)
  const bottomRight = find(1, 1, z)
  const center = find(0, 0, z)

  return !!(
    center ||
    (left && right) ||
    (top && bottom) ||
    (topLeft && bottomRight) ||
    (topRight && bottomLeft) ||
    (topLeft && topRight && bottomLeft) ||
    (topLeft && topRight && bottomRight) ||
    (topLeft && bottomLeft && bottomRight) ||
    (topRight && bottomLeft && bottomRight) ||
    (topLeft && topRight && bottomLeft && bottomRight)
  )
}

export function overlaps(
  tileDb: TileDb,
  position: Position,
  z: number,
): boolean {
  const find = getFinder(tileDb, position)
  const area = [-1, 0, 1]

  for (const x of area) {
    for (const y of area) {
      if (find(x, y, z)) return true
    }
  }

  return false
}

function isBlockedHorizontally(tileDb: TileDb, position: Position): boolean {
  const find = getFinder(tileDb, position)
  const hasLeftTile = find(-2, -1) || find(-2, 0) || find(-2, -1)
  const hasRightTile = find(2, -1) || find(2, 0) || find(2, -1)

  return !!(hasLeftTile && hasRightTile)
}

export function getFinder(tileDb: TileDb, position: Position) {
  return (x = 0, y = 0, z = 0) => {
    const tile = tileDb.findBy({
      x: position.x + x,
      y: position.y + y,
      z: position.z + z,
    })
    if (!tile) return false
    if (tile.deletedBy) return false

    return tile
  }
}

export function isFree(tileDb: TileDb, position: Position): boolean {
  return (
    !overlaps(tileDb, position, 1) && !isBlockedHorizontally(tileDb, position)
  )
}

export function deleteTile(tileDb: TileDb, tile: Tile, playerId: string) {
  tileDb.set(tile.id, { ...tile, deletedBy: playerId })
}

export function getAvailablePairs(tileDb: TileDb): [Tile, Tile][] {
  const freeTiles = getFreeTiles(tileDb)
  const pairs: [Tile, Tile][] = []

  for (let i = 0; i < freeTiles.length; i++) {
    for (let j = i + 1; j < freeTiles.length; j++) {
      const tile1 = freeTiles[i]!
      const tile2 = freeTiles[j]!
      if (!cardsMatch(tile1.card, tile2.card)) continue

      pairs.push([tile1, tile2])
    }
  }

  return pairs
}

export function calculatePoints(tiles: Tile[]) {
  let points = 0

  for (const tile of tiles) {
    const card = tile.card
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
