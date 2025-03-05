import { getNumber, getSuit } from "./deck"
import type { PowerupDb } from "./powerups"
import { fullyOverlaps, overlaps, type Tile, type TileDb } from "./tile"

function getNewTile(tileDb: TileDb, tile: Tile, axis: "x" | "y", bias: number) {
  const value = tile[axis]

  if (bias === 0) return tile
  const direction = Math.sign(bias)

  for (let attempt = Math.abs(bias); attempt > 0; attempt--) {
    const displacement = attempt * direction
    const newValue = value + displacement

    const newTile = { ...tile, [axis]: newValue }
    if (overlaps(tileDb, newTile, 0)) continue
    const hasSupport = tile.z === 0 || fullyOverlaps(tileDb, newTile, -1)
    if (!hasSupport) continue

    return newTile
  }

  return tile
}

export function resolveWinds(
  tileDb: TileDb,
  powerupsDb: PowerupDb,
  tile: Tile,
) {
  if (getSuit(tile.card) !== "w") return
  const wind = getNumber(tile.card) as keyof typeof biases
  const biases = {
    n: ["y", -2],
    s: ["y", 2],
    e: ["x", 2],
    w: ["x", -2],
  } as const

  // remove all powerups
  const powerups = powerupsDb.all
  for (const powerup of powerups) {
    powerupsDb.del(powerup.id)
  }

  const [axis, bias] = biases[wind]
  const highestLevel = tileDb.all.reduce(
    (max, tile) => Math.max(max, tile.z),
    0,
  )

  for (let z = 0; z <= highestLevel; z++) {
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
