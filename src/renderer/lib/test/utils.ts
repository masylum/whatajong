import type { Game } from "@/state/gameState"
import type { CardId, Tile } from "../game"

export function createTile(tile: Partial<Tile> & { cardId: CardId }): Tile {
  return {
    id: "1",
    material: "bone",
    x: 0,
    y: 0,
    z: 0,
    deleted: false,
    selected: false,
    ...tile,
  }
}

export function createGame(game?: Partial<Game>): Game {
  return {
    points: 0,
    coins: 0,
    time: 0,
    pause: false,
    ...game,
  }
}
