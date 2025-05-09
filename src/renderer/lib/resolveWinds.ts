import { play } from "@/components/audio"
import { animate } from "@/state/animationState"
import {
  type Tile,
  type TileDb,
  fullyOverlaps,
  isWind,
  mapGetHeight,
  mapGetWidth,
  overlaps,
} from "./game"

function getNewTile(tileDb: TileDb, tile: Tile, axis: "x" | "y", bias: number) {
  const MAP_SIZE = {
    x: mapGetWidth(),
    y: mapGetHeight(),
  }
  const value = tile[axis]

  if (bias === 0) return

  const direction = Math.sign(bias)
  if (tile[axis] === 0 && direction === -1) return
  if (tile[axis] === MAP_SIZE[axis] - 1 && direction === 1) return

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

export function resolveWinds({ tileDb, tile }: { tileDb: TileDb; tile: Tile }) {
  const windCard = isWind(tile.cardId)
  if (!windCard) return

  play("wind")
  const wind = windCard.rank
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

      tileDb.set(tile.id, { ...newTile })
      animate({ id: tile.id, name: "wind" })
    }
  }
}
