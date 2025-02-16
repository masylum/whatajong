import { DEFAULT_MAP } from "./maps/default"

export const MAP_WIDTH = DEFAULT_MAP[0]![0]!.length
export const MAP_HEIGHT = DEFAULT_MAP[0]!.length
export const MAP_LEVELS = DEFAULT_MAP.length

export function mapGet(
  map: typeof DEFAULT_MAP,
  x: number,
  y: number,
  z: number,
) {
  if (x < 0 || y < 0 || z < 0) return null

  return map[z]?.[y]?.[x]?.toString() ?? null
}
