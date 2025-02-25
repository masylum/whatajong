import { MAP_HEIGHT, MAP_WIDTH } from "@repo/game/map"

export const TILE_HEIGHT = 65
export const TILE_WIDTH = 45
export const INNER_PADING = 2
export const CORNER_RADIUS = 4
export const SIDE_SIZES = { xSide: -6, ySide: 6 }
export const CANVAS_WIDTH = (MAP_WIDTH / 2) * TILE_WIDTH + 4 * SIDE_SIZES.xSide
export const CANVAS_HEIGHT =
  (MAP_HEIGHT / 2) * TILE_HEIGHT + 4 * SIDE_SIZES.ySide
