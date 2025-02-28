import type { Card } from "./deck"
import { type Database, initDatabase } from "./in-memoriam"
import { getJokerPowerup, type PowerupDb } from "./powerups"

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
  return initDatabase({ indexes: tileIndexes }, tiles)
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

export function overlaps(tileDb: TileDb, position: Position, z: number) {
  const find = getFinder(tileDb, position)
  const area = [-1, 0, 1]

  for (const x of area) {
    for (const y of area) {
      const tile = find(x, y, z)
      if (tile) return tile
    }
  }

  return null
}

function isBlockedHorizontally(tileDb: TileDb, position: Position): boolean {
  const find = getFinder(tileDb, position)
  const hasLeftTile = find(-2, -1) || find(-2, 0) || find(-2, 1)
  const hasRightTile = find(2, -1) || find(2, 0) || find(2, 1)

  return !!(hasLeftTile && hasRightTile)
}

function isBlockedVertically(tileDb: TileDb, position: Position): boolean {
  const find = getFinder(tileDb, position)
  const hasTopTile = find(-1, -2) || find(0, -2) || find(1, -2)
  const hasBottomTile = find(-1, 2) || find(0, 2) || find(1, 2)

  return !!(hasTopTile && hasBottomTile)
}

export function getFinder(tileDb: TileDb, position: Position) {
  return (x = 0, y = 0, z = 0) => {
    const tile = tileDb
      .filterBy({
        x: position.x + x,
        y: position.y + y,
        z: position.z + z,
      })
      .filter((tile) => !tile.deletedBy)[0]
    if (!tile) return null

    return tile
  }
}

export function isFree(
  tileDb: TileDb,
  position: Position,
  powerupsDb?: PowerupDb,
  playerId?: string,
): boolean {
  const isCovered = !overlaps(tileDb, position, 1)
  const isBlockedH = isBlockedHorizontally(tileDb, position)

  if (powerupsDb && playerId) {
    const powerup = getJokerPowerup(powerupsDb, playerId)
    if (powerup) {
      const isBlockedV = isBlockedVertically(tileDb, position)
      return isCovered && (!isBlockedH || !isBlockedV)
    }
  }

  return isCovered && !isBlockedH
}

export function deleteTile(tileDb: TileDb, tile: Tile, playerId: string) {
  tileDb.set(tile.id, { ...tile, deletedBy: playerId })
}
