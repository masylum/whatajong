import { DEFAULT_MAP } from "./maps/default"
import { MAP_68 } from "./maps/map68"

export type MapType = (number | null)[][][]
export type MapName = keyof typeof maps

export function mapGet(map: MapType, x: number, y: number, z: number) {
  if (x < 0 || y < 0 || z < 0) return null

  return map[z]?.[y]?.[x]?.toString() ?? null
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
  default: DEFAULT_MAP,
}
