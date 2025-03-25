import type { Card, Tile } from "../game"

export function createTile({
  card,
  id = "1",
  material = "bone",
  x = 0,
  y = 0,
  z = 0,
  deleted = false,
  selected = false,
}: Partial<Tile> & { card: Card }): Tile {
  return { id, card, material, x, y, z, deleted, selected }
}
