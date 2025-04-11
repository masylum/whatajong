import {
  type Tile,
  type TileDb,
  fullyOverlaps,
  getRank,
  isWind,
  mapGetHeight,
  mapGetWidth,
  overlaps,
} from "./game"

const MAP_SIZE = {
  x: mapGetWidth(),
  y: mapGetHeight(),
}

function getNewTile(tileDb: TileDb, tile: Tile, axis: "x" | "y", bias: number) {
  const value = tile[axis]

  if (bias === 0) return
  if (tile[axis] === 0) return
  if (tile[axis] === MAP_SIZE[axis] - 1) return

  const direction = Math.sign(bias)

  for (let attempt = Math.abs(bias); attempt > 0; attempt--) {
    const displacement = attempt * direction
    const newValue = value + displacement

    const newTile = { ...tile, [axis]: newValue }
    if (overlaps(tileDb, newTile, 0)) continue
    if (!fullyOverlaps(tileDb, newTile, -1)) continue

    return newTile
  }

  return
}

const BIASES = {
  n: ["y", -2],
  s: ["y", 2],
  e: ["x", 2],
  w: ["x", -2],
} as const

export function resolveWinds(tileDb: TileDb, tile: Tile) {
  const windCard = isWind(tile.card)
  if (!windCard) return

  const wind = getRank(windCard) as keyof typeof BIASES

  const [axis, bias] = BIASES[wind]
  const highestLevel = tileDb.all.reduce(
    (max, tile) => Math.max(max, tile.z),
    0,
  )

  for (let z = 1; z <= highestLevel; z++) {
    const direction = Math.sign(bias)
    const zTiles = tileDb
      .filterBy({ z, deleted: false })
      .toSorted((a, b) => direction * (b[axis] - a[axis]))

    for (const tile of zTiles) {
      const newTile = getNewTile(tileDb, tile, axis, bias)
      if (!newTile) continue

      tileDb.set(tile.id, newTile)
    }
  }
}
