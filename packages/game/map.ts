import { getNumber } from "./deck"
import { getSuit } from "./deck"
import type { Tile, GameState } from "./types"

export const MAP_WIDTH = 30
export const MAP_HEIGHT = 16

// z, y, x
export type Mapa = (number | null)[][][]
export type Position = { x: number; y: number; z: number }

export function mapGet(map: Mapa, x: number, y: number, z: number) {
  if (x < 0 || y < 0 || z < 0) return null

  return map[z]?.[y]?.[x]?.toString() ?? null
}

export function getTile(gameState: GameState, x: number, y: number, z: number) {
  const { map, tiles } = gameState
  const id = mapGet(map, x, y, z)
  if (id === null) return null
  if (tiles[id]!.deleted) return null

  return tiles[id]
}

export function isCovered(gameState: GameState, tile: Tile): boolean {
  const { x, y, z } = tile.position
  const zp = z + 1

  return (
    !!getTile(gameState, x, y, zp) ||
    !!getTile(gameState, x + 1, y, zp) ||
    !!getTile(gameState, x, y + 1, zp) ||
    !!getTile(gameState, x + 1, y + 1, zp)
  )
}

function isBlockedHorizontally(gameState: GameState, tile: Tile): boolean {
  const { x, y, z } = tile.position
  const hasLeftTile =
    getTile(gameState, x - 1, y, z) || getTile(gameState, x - 1, y + 1, z)

  const hasRightTile =
    getTile(gameState, x + 2, y, z) || getTile(gameState, x + 2, y + 1, z)

  return !!hasLeftTile && !!hasRightTile
}

export function isFree(gameState: GameState, tile: Tile): boolean {
  return !isCovered(gameState, tile) && !isBlockedHorizontally(gameState, tile)
}

function hasSupport(gameState: GameState, position: Position) {
  const { x, y, z } = position
  return (
    z === 0 ||
    getTile(gameState, x, y, z - 1) ||
    getTile(gameState, x + 1, y, z - 1) ||
    getTile(gameState, x, y + 1, z - 1) ||
    getTile(gameState, x + 1, y + 1, z - 1)
  )
}

function getXBias(gameState: GameState, position: Position, bias: number) {
  const { x, y, z } = position
  if (bias === 0) return 0
  if (x === 0 || x >= MAP_WIDTH - 2) return 0

  const direction = Math.sign(bias)
  for (let attempt = Math.abs(bias); attempt > 0; attempt--) {
    const currentAttempt = attempt * direction
    const isOutside =
      x + currentAttempt < 0 || x + currentAttempt > MAP_WIDTH - 2
    if (isOutside) continue

    const checkX = x + currentAttempt
    const isOcupied =
      getTile(gameState, checkX, y, z) ||
      getTile(gameState, checkX, y + 1, z) ||
      getTile(gameState, checkX + 1, y, z) ||
      getTile(gameState, checkX + 1, y + 1, z)

    if (isOcupied) continue
    if (!hasSupport(gameState, { x: x + currentAttempt, y, z })) continue

    return currentAttempt
  }

  return 0
}

function getYBias(gameState: GameState, position: Position, bias: number) {
  const { x, y, z } = position
  if (bias === 0) return 0
  if (y === 0 || y >= MAP_HEIGHT - 2) return 0

  const direction = Math.sign(bias)
  for (let attempt = Math.abs(bias); attempt > 0; attempt--) {
    const currentAttempt = attempt * direction
    const isOutside =
      y + currentAttempt < 0 || y + currentAttempt > MAP_HEIGHT - 2
    if (isOutside) continue

    const checkY = y + currentAttempt
    const isOcupied =
      getTile(gameState, x, checkY, z) ||
      getTile(gameState, x + 1, checkY, z) ||
      getTile(gameState, x, checkY + 1, z) ||
      getTile(gameState, x + 1, checkY + 1, z)

    if (isOcupied) continue
    if (!hasSupport(gameState, { x, y: y + currentAttempt, z })) continue

    return currentAttempt
  }

  return 0
}

export function getPosition(gameState: GameState, tile: Tile) {
  const { map } = gameState
  const { id } = tile

  for (const z of map.keys()) {
    for (const y of map[z]!.keys()) {
      for (const x of map[z]![y]!.keys()) {
        const cell = mapGet(map, x, y, z)
        if (cell && cell === id) {
          return { x, y, z }
        }
      }
    }
  }

  throw new Error(`Tile not found: ${id}`)
}

export function tiltMap(gameState: GameState) {
  const { assets, map } = gameState
  const winds = Object.values(assets)
    .filter((asset) => getSuit(asset.card) === "w")
    .map((asset) => getNumber(asset.card))

  const nCount = winds.filter((w) => w === "n").length
  const sCount = winds.filter((w) => w === "s").length
  const eCount = winds.filter((w) => w === "e").length
  const wCount = winds.filter((w) => w === "w").length

  const yBias = (sCount - nCount) * 2
  const xBias = (eCount - wCount) * 2

  if (xBias === 0 && yBias === 0) return map
  if (Object.keys(gameState.tiles).length === 0) return map

  // Keep track of processed tiles to avoid processing the same tile multiple times
  const processed = new Set<string>()

  for (const direction of ["x", "y"]) {
    for (const z of map.keys()) {
      const yKeys = map[z]!.keys().toArray()
      const ys = yBias > 0 ? yKeys.reverse() : yKeys

      for (const y of ys) {
        const xKeys = map[z]![y]!.keys().toArray()
        const xs = xBias > 0 ? xKeys.reverse() : xKeys

        for (const x of xs) {
          const tile = getTile(gameState, x, y, z)
          if (!tile) continue

          const tileKey = `${tile.id}-${direction}`
          if (processed.has(tileKey)) continue
          processed.add(tileKey)

          const id = Number.parseInt(tile.id)
          const xx = xBias > 0 ? x - 1 : x
          const yy = yBias > 0 ? y - 1 : y

          if (direction === "x") {
            const xb = getXBias(gameState, { x: xx, y: yy, z }, xBias)

            if (xb !== 0) {
              map[z]![yy]![xx] = null
              map[z]![yy]![xx + 1] = null
              map[z]![yy + 1]![xx] = null
              map[z]![yy + 1]![xx + 1] = null

              const xxx = xx + xb
              map[z]![yy]![xxx] = id
              map[z]![yy]![xxx + 1] = id
              map[z]![yy + 1]![xxx] = id
              map[z]![yy + 1]![xxx + 1] = id
              tile.position = { x: xxx, y: yy, z }
            }
          } else {
            const yb = getYBias(gameState, { x: xx, y: yy, z }, yBias)

            if (yb !== 0) {
              map[z]![yy]![xx] = null
              map[z]![yy]![xx + 1] = null
              map[z]![yy + 1]![xx] = null
              map[z]![yy + 1]![xx + 1] = null

              const yyy = yy + yb
              map[z]![yyy]![xx] = id
              map[z]![yyy + 1]![xx] = id
              map[z]![yyy]![xx + 1] = id
              map[z]![yyy + 1]![xx + 1] = id
              tile.position = { x: xx, y: yyy, z }
            }
          }
        }
      }
    }
  }
}
