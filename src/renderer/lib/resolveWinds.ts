import { mapGetHeight, mapGetWidth } from "@/lib/game"
import {
  type Tile,
  type TileDb,
  fullyOverlaps,
  getRank,
  isTransport,
  isWind,
  overlaps,
} from "./game"

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

const BIASES = {
  n: ["y", -2],
  s: ["y", 2],
  e: ["x", 2],
  w: ["x", -2],
} as const

function moveUpperTiles(tileDb: TileDb, wind: keyof typeof BIASES) {
  const [axis, bias] = BIASES[wind]
  const highestLevel = tileDb.all.reduce(
    (max, tile) => Math.max(max, tile.z),
    0,
  )

  for (let z = 0; z <= highestLevel; z++) {
    const direction = Math.sign(bias)
    const zTiles = tileDb
      .filterBy({ z, deleted: false })
      .toSorted((a, b) => direction * (b[axis] - a[axis]))

    for (const tile of zTiles) {
      tileDb.set(
        tile.id,
        getNewTile(tileDb, tile, axis, tile.z === 0 ? 0 : bias),
      )
    }
  }
}

const TRANSPORT_BIASES = {
  w: {
    filter: (tile: Tile) => tile.x < mapGetWidth() / 2,
    mutate: (tile: Tile) => ({ ...tile, x: tile.x - 1 }),
  },
  e: {
    filter: (tile: Tile) => tile.x > mapGetWidth() / 2,
    mutate: (tile: Tile) => ({ ...tile, x: tile.x + 1 }),
  },
  n: {
    filter: (tile: Tile) => tile.y < mapGetHeight() / 2,
    mutate: (tile: Tile) => ({ ...tile, y: tile.y - 1 }),
  },
  s: {
    filter: (tile: Tile) => tile.y > mapGetHeight() / 2,
    mutate: (tile: Tile) => ({ ...tile, y: tile.y + 1 }),
  },
} as const
function divideTilesInHalf(tileDb: TileDb, wind: keyof typeof BIASES) {
  // TODO: limit to edges
  const tiles = tileDb
    .filterBy({ deleted: false })
    .filter(TRANSPORT_BIASES[wind].filter)

  for (const tile of tiles) {
    tileDb.set(tile.id, TRANSPORT_BIASES[wind].mutate(tile))
  }
}

export function resolveWinds(tileDb: TileDb, tile: Tile) {
  const windCard = isWind(tile.card)
  const transportCard = isTransport(tile.card)
  const canResolve = windCard || transportCard
  if (!canResolve) return

  const wind = getRank(tile.card) as keyof typeof BIASES

  if (windCard) {
    moveUpperTiles(tileDb, wind)
    return
  }

  // TODO: move away
  divideTilesInHalf(tileDb, wind)
}
