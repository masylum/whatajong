import type { Game } from "@/state/gameState"
import { type Card, type CardId, type Tile, getCard, isPhoenix } from "./game"
import { captureEvent } from "./observability"

function parseNumber(cardId: CardId) {
  const rank = Number.parseInt(getCard(cardId).rank)
  if (Number.isNaN(rank)) return null
  return rank
}

function nextNumber(number: number) {
  if (number === 9) return 1
  return number + 1
}

function continuesPhoenixRun(number: number | undefined, cardId: CardId) {
  const rank = parseNumber(cardId)
  if (rank === null) return false
  if (number === undefined) return true

  return rank === nextNumber(number)
}

function maybeStartsPhoenixRun(game: Game, card: Card | null) {
  const canStart = card && !game.dragonRun
  game.phoenixRun = canStart ? { number: undefined, combo: 1 } : undefined
}

export function resolvePhoenixRun({ game, tile }: { game: Game; tile: Tile }) {
  const phoenixRun = game.phoenixRun
  const newCardId = tile.cardId
  const phoenixCard = isPhoenix(newCardId)

  if (!phoenixRun) {
    maybeStartsPhoenixRun(game, phoenixCard)
    return
  }

  if (!continuesPhoenixRun(phoenixRun.number, newCardId)) {
    maybeStartsPhoenixRun(game, phoenixCard)
    captureEvent("phoenix_run_finished", {
      combo: phoenixRun.combo,
    })
    return
  }

  const number = parseNumber(newCardId)
  if (number === null) return

  if (phoenixRun.combo === 10) {
    game.phoenixRun = undefined
  } else {
    phoenixRun.combo = phoenixRun.combo + 1
  }

  phoenixRun.number = number
}
