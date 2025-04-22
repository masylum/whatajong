import type { CardId, Tile } from "../game"

export function createTile({
  cardId,
  id = "1",
  material = "bone",
  x = 0,
  y = 0,
  z = 0,
  deleted = false,
  selected = false,
}: Partial<Tile> & { cardId: CardId }): Tile {
  return {
    id,
    cardId,
    material,
    x,
    y,
    z,
    deleted,
    selected,
  }
}
