import { getNumber, getSuit } from "./deck"
import { MAP_HEIGHT, MAP_LEVELS, MAP_WIDTH } from "./map"
import { fullyOverlaps, overlaps, type Tile, type TileDb } from "./tile"

const limit = { x: MAP_WIDTH - 2, y: MAP_HEIGHT - 2 } as const
type Axis = "x" | "y"

function isOutside(value: number, axis: Axis) {
  return value === 0 || value >= limit[axis]
}

function getDisplacement(
  tileDb: TileDb,
  tile: Tile,
  axis: "x" | "y",
  bias: number,
) {
  const value = tile[axis]

  if (bias === 0) return 0
  if (isOutside(value, axis)) return 0

  const direction = Math.sign(bias)
  for (let attempt = Math.abs(bias); attempt > 0; attempt--) {
    const currentAttempt = attempt * direction
    if (isOutside(value + currentAttempt, axis)) continue

    const newTile = { ...tile, [axis]: currentAttempt }
    if (overlaps(tileDb, newTile, 0)) continue
    if (fullyOverlaps(tileDb, newTile, -1)) continue

    return currentAttempt
  }

  return 0
}

export function tiltMap(tileDb: TileDb) {
  const winds = tileDb.all
    .filter((tile) => tile.deletedBy && getSuit(tile.card) === "w")
    .map((tile) => getNumber(tile.card))

  const nCount = winds.filter((w) => w === "n").length
  const sCount = winds.filter((w) => w === "s").length
  const eCount = winds.filter((w) => w === "e").length
  const wCount = winds.filter((w) => w === "w").length

  // TODO: remove
  console.log(nCount, sCount, eCount, wCount)

  const biases = { x: 2, y: 2 } as const
  // const bias = { x: eCount - wCount, y: sCount - nCount } as const

  // TODO: remove
  // if (xBias === 0 && yBias === 0) return map

  const axes = ["x", "y"] as const

  for (const axis of axes) {
    for (let z = 0; z < MAP_LEVELS; z++) {
      const bias = biases[axis]
      const direction = Math.sign(bias)
      const zTiles = tileDb
        .filterBy({ z })
        .toSorted((a, b) => direction * (a[axis] - b[axis]))
      console.log(zTiles)

      for (const tile of zTiles) {
        const displacement = getDisplacement(tileDb, tile, axis, bias)
        console.log(tile, bias, displacement)
        if (displacement === 0) continue

        tile[axis] += displacement
      }
    }
    // ORIGINAL
    // for (const z of map.keys()) {
    //   const yKeys = map[z]!.keys().toArray()
    //   const ys = yBias > 0 ? yKeys.reverse() : yKeys

    //   for (const y of ys) {
    //     const xKeys = map[z]![y]!.keys().toArray()
    //     const xs = xBias > 0 ? xKeys.reverse() : xKeys

    //     for (const x of xs) {
    //       const tile = getTile(gameState, x, y, z)
    //       if (!tile) continue

    //       const tileKey = `${tile.id}-${direction}`
    //       if (processed.has(tileKey)) continue
    //       processed.add(tileKey)

    //       const id = Number.parseInt(tile.id)
    //       const xx = xBias > 0 ? x - 1 : x
    //       const yy = yBias > 0 ? y - 1 : y

    //       if (direction === "x") {
    //         const xb = getXBias(gameState, { x: xx, y: yy, z }, xBias)

    //         if (xb !== 0) {
    //           map[z]![yy]![xx] = null
    //           map[z]![yy]![xx + 1] = null
    //           map[z]![yy + 1]![xx] = null
    //           map[z]![yy + 1]![xx + 1] = null

    //           const xxx = xx + xb
    //           map[z]![yy]![xxx] = id
    //           map[z]![yy]![xxx + 1] = id
    //           map[z]![yy + 1]![xxx] = id
    //           map[z]![yy + 1]![xxx + 1] = id
    //           tile.position = { x: xxx, y: yy, z }
    //         }
    //       } else {
    //         const yb = getYBias(gameState, { x: xx, y: yy, z }, yBias)

    //         if (yb !== 0) {
    //           map[z]![yy]![xx] = null
    //           map[z]![yy]![xx + 1] = null
    //           map[z]![yy + 1]![xx] = null
    //           map[z]![yy + 1]![xx + 1] = null

    //           const yyy = yy + yb
    //           map[z]![yyy]![xx] = id
    //           map[z]![yyy + 1]![xx] = id
    //           map[z]![yyy]![xx + 1] = id
    //           map[z]![yyy + 1]![xx + 1] = id
    //           tile.position = { x: xx, y: yyy, z }
    //         }
    //       }
    //     }
    //   }
    // }
  }
}
