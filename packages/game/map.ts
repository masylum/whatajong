import { DEFAULT_MAP } from "./maps/default"
import { MAP_68 } from "./maps/map68"
import { MAP_100 } from "./maps/map100"
import { MAP_120 } from "./maps/map120"
import { MAP_84 } from "./maps/map84"
import { DECK_SIZE_LEVEL } from "./deck"

export type MapType = (number | null)[][][]
export type MapName = keyof typeof maps

export function mapGet(map: MapType, x: number, y: number, z: number) {
  if (x < 0 || y < 0 || z < 0) return null

  return map[z]?.[y]?.[x]?.toString() ?? null
}

export function mapName(tiles: number): MapName {
  if (tiles < DECK_SIZE_LEVEL[2]) return "map68"
  if (tiles < DECK_SIZE_LEVEL[3]) return "map84"
  if (tiles < DECK_SIZE_LEVEL[4]) return "map100"
  if (tiles < DECK_SIZE_LEVEL[5]) return "map120"

  return "default"
}

export function mapGetWidth(map: MapType) {
  return map[0]![0]!.length
}

export function mapGetHeight(map: MapType) {
  return map[0]!.length
}

export function mapGetLevels(map: MapType) {
  return map.length
}

export const maps = {
  map68: MAP_68,
  map84: MAP_84,
  map100: MAP_100,
  map120: MAP_120,
  default: DEFAULT_MAP,
}
