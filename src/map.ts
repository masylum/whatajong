import type { Position } from "./types"

const n = null

export class PositionMap {
  private positions: Map<string, Position>

  constructor(positions: Position[] = []) {
    this.positions = new Map()
    for (const pos of positions) {
      this.add(pos)
    }
  }

  getKey(pos: Position): string {
    return `${pos.x},${pos.y},${pos.z}`
  }

  has(pos: Position): boolean {
    return this.positions.has(this.getKey(pos))
  }

  get size(): number {
    return this.positions.size
  }

  add(pos: Position): void {
    this.positions.set(this.getKey(pos), pos)
  }

  remove(pos: Position): void {
    this.positions.delete(this.getKey(pos))
  }
}

// Check if a tile is covered by another tile
function isOverlaping(
  z: number,
  pos: Position,
  positions: PositionMap,
): boolean[] {
  const quadrants = [
    { x: pos.x, y: pos.y },
    { x: pos.x + 1, y: pos.y },
    { x: pos.x, y: pos.y + 1 },
    { x: pos.x + 1, y: pos.y + 1 },
  ]

  return quadrants.map(
    quadrant =>
      positions.has({ x: quadrant.x, y: quadrant.y, z }) ||
      positions.has({ x: quadrant.x, y: quadrant.y - 1, z }) ||
      positions.has({ x: quadrant.x - 1, y: quadrant.y, z }) ||
      positions.has({ x: quadrant.x - 1, y: quadrant.y - 1, z }),
  )
}

function isCovered(pos: Position, positions: PositionMap): boolean {
  return isOverlaping(pos.z + 1, pos, positions).some(Boolean)
}

// Check if a position has support from tiles below
export function hasSupport(pos: Position, positions: PositionMap): boolean {
  if (pos.z === 0) return true
  return isOverlaping(pos.z - 1, pos, positions).every(Boolean)
}

/**
 * Returns false if there are any non-adjacent tiles on the left or right
 * that would prevent leaving a horizontal gap
 */
export function canLeaveHorizontalGap(
  pos: Position,
  positions: PositionMap,
): boolean {
  const z = pos.z
  const y = pos.y
  const x = pos.x

  // Check left side
  let leftX = x - 2
  while (leftX >= 0) {
    if (positions.has({ x: leftX, y, z })) {
      // Found a tile - it must be adjacent
      if (leftX === x - 2) return false
      return true
    }
    leftX -= 2
  }

  // Check right side
  let rightX = x + 2
  // TODO: get the max from the map
  while (rightX < 30) {
    if (positions.has({ x: rightX, y, z })) {
      // Found a tile - it must be adjacent
      if (rightX === x + 2) return false
      return true
    }
    rightX += 2
  }

  return false
}

function isBlockedHorizontally(pos: Position, positions: PositionMap): boolean {
  const hasLeftTile =
    positions.has({ x: pos.x - 2, y: pos.y - 1, z: pos.z }) ||
    positions.has({ x: pos.x - 2, y: pos.y, z: pos.z }) ||
    positions.has({ x: pos.x - 2, y: pos.y + 1, z: pos.z })

  const hasRightTile =
    positions.has({ x: pos.x + 2, y: pos.y - 1, z: pos.z }) ||
    positions.has({ x: pos.x + 2, y: pos.y, z: pos.z }) ||
    positions.has({ x: pos.x + 2, y: pos.y + 1, z: pos.z })

  return hasLeftTile && hasRightTile
}

// Check if a position is valid for removal
export function isFree(pos: Position, positions: PositionMap): boolean {
  return !isCovered(pos, positions) && !isBlockedHorizontally(pos, positions)
}

export function getMap() {
  // biome-ignore format: this is a map
  return [
      // level 0
     [
       [n , n , 12, 12, 11, 11, 10, 10,  9,  9,  8,  8,  7,  7,  6,  6,  5,  5,  4,  4,  3,  3,  2,  2,  1,  1, n , n , n , n ],
       [n , n , 12, 12, 11, 11, 10, 10,  9,  9,  8,  8,  7,  7,  6,  6,  5,  5,  4,  4,  3,  3,  2,  2,  1,  1, n , n , n , n ],
       [n , n , n , n , n , n , 20, 20, 19, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 13, 13, n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , 20, 20, 19, 19, 18, 18, 17, 17, 16, 16, 15, 15, 14, 14, 13, 13, n , n , n , n , n , n , n , n ],
       [n , n , n , n , 30, 30, 29, 29, 28, 28, 27, 27, 26, 26, 25, 25, 24, 24, 23, 23, 22, 22, 21, 21, n , n , n , n , n , n ],
       [n , n , n , n , 30, 30, 29, 29, 28, 28, 27, 27, 26, 26, 25, 25, 24, 24, 23, 23, 22, 22, 21, 21, n , n , n , n , n , n ],
       [n , n , 44, 44, 43, 43, 42, 42, 41, 41, 40, 40, 39, 39, 38, 38, 37, 37, 36, 36, 35, 35, 34, 34, 33, 33, n , n , n , n ],
       [57, 57, 44, 44, 43, 43, 42, 42, 41, 41, 40, 40, 39, 39, 38, 38, 37, 37, 36, 36, 35, 35, 34, 34, 33, 33, 32, 32, 31, 31],
       [57, 57, 56, 56, 55, 55, 54, 54, 53, 53, 52, 52, 51, 51, 50, 50, 49, 49, 48, 48, 47, 47, 46, 46, 45, 45, 32, 32, 31, 31],
       [n , n , 56, 56, 55, 55, 54, 54, 53, 53, 52, 52, 51, 51, 50, 50, 49, 49, 48, 48, 47, 47, 46, 46, 45, 45, n , n , n , n ],
       [n , n , n , n , 67, 67, 66, 66, 65, 65, 64, 64, 63, 63, 62, 62, 61, 61, 60, 60, 59, 59, 58, 58, n , n , n , n , n , n ],
       [n , n , n , n , 67, 67, 66, 66, 65, 65, 64, 64, 63, 63, 62, 62, 61, 61, 60, 60, 59, 59, 58, 58, n , n , n , n , n , n ],
       [n , n , n , n , n , n , 75, 75, 74, 74, 73, 73, 72, 72, 71, 71, 70, 70, 69, 69, 68, 68, n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , 75, 75, 74, 74, 73, 73, 72, 72, 71, 71, 70, 70, 69, 69, 68, 68, n , n , n , n , n , n , n , n ],
       [n , n , 87, 87, 86, 86, 85, 85, 84, 84, 83, 83, 82, 82, 81, 81, 80, 80, 79, 79, 78, 78, 77, 77, 76, 76, n , n , n , n ],
       [n , n , 87, 87, 86, 86, 85, 85, 84, 84, 83, 83, 82, 82, 81, 81, 80, 80, 79, 79, 78, 78, 77, 77, 76, 76, n , n , n , n ],
     ],
     // level 1
     [
       [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , 93 , 93 , 92 , 92 , 91 , 91 , 90 , 90 , 89 , 89 , 88 , 88 , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , 93 , 93 , 92 , 92 , 91 , 91 , 90 , 90 , 89 , 89 , 88 , 88 , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , 99 , 99 , 98 , 98 , 97 , 97 , 96 , 96 , 95 , 95 , 94 , 94 , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , 99 , 99 , 98 , 98 , 97 , 97 , 96 , 96 , 95 , 95 , 94 , 94 , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , 105, 105, 104, 104, 103, 103, 102, 102, 101, 101, 100, 100, n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , 105, 105, 104, 104, 103, 103, 102, 102, 101, 101, 100, 100, n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , 111, 111, 110, 110, 109, 109, 108, 108, 107, 107, 106, 106, n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , 111, 111, 110, 110, 109, 109, 108, 108, 107, 107, 106, 106, n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , 117, 117, 116, 116, 115, 115, 114, 114, 113, 113, 112, 112, n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , 117, 117, 116, 116, 115, 115, 114, 114, 113, 113, 112, 112, n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , 123, 123, 122, 122, 121, 121, 120, 120, 119, 119, 118, 118, n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , 123, 123, 122, 122, 121, 121, 120, 120, 119, 119, 118, 118, n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
     ],
     // level 2
     [
       [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , 127, 127, 126, 126, 125, 125, 124, 124, n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , 127, 127, 126, 126, 125, 125, 124, 124, n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , 131, 131, 130, 130, 129, 129, 128, 128, n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , 131, 131, 130, 130, 129, 129, 128, 128, n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , 135, 135, 134, 134, 133, 133, 132, 132, n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , 135, 135, 134, 134, 133, 133, 132, 132, n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , 139, 139, 138, 138, 137, 137, 136, 136, n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , 139, 139, 138, 138, 137, 137, 136, 136, n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
       [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
     ],
    // level 3
    [
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , 141, 141, 140, 140, n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , 141, 141, 140, 140, n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , 143, 143, 142, 142, n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , 143, 143, 142, 142, n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
    ],

    // level 4
    [
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , 144, 144, n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , 144, 144, n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
      [n , n , n , n , n , n , n , n , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n  , n , n , n , n , n , n , n , n , n , n ],
    ]
  ]
}
