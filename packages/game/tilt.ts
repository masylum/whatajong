import { getNumber, getSuit } from "./deck"
import { MAP_HEIGHT, MAP_LEVELS, MAP_WIDTH } from "./map"
import { fullyOverlaps, overlaps, type Tile, type TileDb } from "./tile"

const limit = { x: MAP_WIDTH - 2, y: MAP_HEIGHT - 2 } as const

function getNewTile(tileDb: TileDb, tile: Tile, axis: "x" | "y", bias: number) {
  const value = tile[axis]

  if (bias === 0) return tile
  const direction = Math.sign(bias)
  if (direction === -1 && value === 0) return tile
  if (direction === 1 && value === limit[axis]) return tile

  for (let attempt = Math.abs(bias); attempt > 0; attempt--) {
    const displacement = attempt * direction
    const newValue = value + displacement
    if (newValue < 0 || newValue > limit[axis]) continue

    const newTile = { ...tile, [axis]: newValue }
    if (overlaps(tileDb, newTile, 0)) continue
    const hasSupport = tile.z === 0 || fullyOverlaps(tileDb, newTile, -1)
    if (!hasSupport) continue

    return newTile
  }

  return tile
}

export function tiltMap(tileDb: TileDb, tile: Tile) {
  if (getSuit(tile.card) !== "w") return
  const wind = getNumber(tile.card) as keyof typeof biases
  const biases = {
    n: ["y", -2],
    s: ["y", 2],
    e: ["x", 2],
    w: ["x", -2],
  } as const

  const [axis, bias] = biases[wind]

  for (let z = 0; z < MAP_LEVELS; z++) {
    const direction = Math.sign(bias)
    const zTiles = tileDb
      .filterBy({ z })
      .toSorted((a, b) => direction * (b[axis] - a[axis]))
      .filter((tile) => !tile.deletedBy)

    for (const tile of zTiles) {
      tileDb.set(
        tile.id,
        getNewTile(tileDb, tile, axis, tile.z === 0 ? 0 : bias),
      )
    }
  }
}
