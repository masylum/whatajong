import { mapGetHeight, mapGetWidth, type MapType } from "@repo/game/map"

export const TILE_HEIGHT = 65
export const TILE_WIDTH = 45
export const CORNER_RADIUS = 4

export function getCanvasWidth(map: MapType) {
  return (mapGetWidth(map) / 2) * TILE_WIDTH
}

export function getCanvasHeight(map: MapType) {
  return (mapGetHeight(map) / 2) * TILE_HEIGHT
}

export const TILE_RATIO = 13 / 9

export function getSideSize(height: number) {
  return Math.floor(height / 10)
}
