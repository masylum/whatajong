import { mapGetHeight, mapGetWidth, type MapType } from "@repo/game/map"

export const TILE_HEIGHT = 65
export const TILE_WIDTH = 45
export const INNER_PADING = 2
export const CORNER_RADIUS = 4
export const SIDE_SIZES = { xSide: -6, ySide: 6 }

export function getCanvasWidth(map: MapType) {
  return (mapGetWidth(map) / 2) * TILE_WIDTH + 4 * SIDE_SIZES.xSide
}

export function getCanvasHeight(map: MapType) {
  return (mapGetHeight(map) / 2) * TILE_HEIGHT + 4 * SIDE_SIZES.ySide
}
