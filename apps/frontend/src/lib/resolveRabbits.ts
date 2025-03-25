import { type Game, type Tile, isRabbit } from "./game"

export function resolveRabbits(game: Game, tile: Tile) {
  const rabbitRun = game.rabbitRun
  const newCard = tile.card
  const rabbitCard = isRabbit(newCard)

  if (!rabbitRun) {
    if (rabbitCard) {
      game.rabbitRun = { card: rabbitCard, score: false, combo: 2 }
    }

    return
  }

  if (rabbitRun.score) {
    game.rabbitRun = undefined
    return
  }

  if (rabbitCard) {
    rabbitRun.card = rabbitCard
    rabbitRun.combo += 2
    return
  }

  rabbitRun.score = true
}
