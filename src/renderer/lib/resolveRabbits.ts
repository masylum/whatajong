import { type Game, type Tile, isRabbit } from "./game"

export function resolveRabbits(game: Game, tile: Tile) {
  game.rabbitActive = !!isRabbit(tile.card)
}
