import { isFlower, type Card } from "./deck"
import { type Database, initDatabase } from "./in-memoriam"
import type { PowerupDb } from "./powerups"
import type { SelectionDb } from "./selection"

export type Position = {
  x: number
  y: number
  z: number
}

export type Tile = {
  id: string
  card: Card
  deletedBy?: string
  material: Material
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

function getFreedoms(tileDb: TileDb, position: Position) {
  const find = getFinder(tileDb, position)
  const hasLeftTile = find(-2, -1) || find(-2, 0) || find(-2, 1)
  const hasRightTile = find(2, -1) || find(2, 0) || find(2, 1)
  const hasTopTile = find(-1, -2) || find(0, -2) || find(1, -2)
  const hasBottomTile = find(-1, 2) || find(0, 2) || find(1, 2)

  return {
    left: !hasLeftTile,
    right: !hasRightTile,
    top: !hasTopTile,
    bottom: !hasBottomTile,
  }
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
  tile: Tile,
  powerupsDb?: PowerupDb,
  playerId?: string,
) {
  const isCovered = overlaps(tileDb, tile, 1)
  const freedoms = getFreedoms(tileDb, tile)
  const countFreedoms = Object.values(freedoms).filter((v) => v).length
  const material = getMaterial(tile, powerupsDb, playerId)

  if (material === "ivory") return !isCovered
  if (material === "glass" || material === "wood") {
    return countFreedoms >= 1 && !isCovered
  }

  if (material === "bone") {
    const isFreeH = freedoms.left || freedoms.right
    return isFreeH && !isCovered
  }

  if (material === "bronze" || material === "gold") {
    return countFreedoms >= 3 && !isCovered
  }

  return countFreedoms === 4 && !isCovered
}

export function getMaterial(
  tile: Tile,
  powerupsDb?: PowerupDb,
  playerId?: string,
) {
  if (powerupsDb && playerId) {
    const flower = powerupsDb
      .filterBy({ playerId })
      .find((p) => isFlower(p.card))
    if (flower) return "wood"
    // TODO: flower+
  }

  return tile.material
}

export function deleteTiles(
  tileDb: TileDb,
  selectionDb: SelectionDb,
  tiles: Tile[],
  playerId: string,
) {
  for (const tile of tiles) {
    tileDb.set(tile.id, { ...tile, deletedBy: playerId })
    const selection = selectionDb.findBy({ tileId: tile.id })
    if (selection) {
      selectionDb.del(selection.id)
    }
  }
}

export const materials = [
  "wood",
  "glass",
  "ivory",
  "bone",
  "bronze",
  "gold",
  "jade",
] as const
export type Material = (typeof materials)[number]
