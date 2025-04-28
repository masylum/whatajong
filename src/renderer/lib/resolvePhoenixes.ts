import type { Game } from "@/state/gameState"
import { type CardId, type Tile, getCard, isPhoenix } from "./game"
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
  if (number === undefined) return true
  if (isPhoenix(cardId)) return false

  const rank = parseNumber(cardId)
  if (rank === null) return true

  return rank === nextNumber(number)
}

export function resolvePhoenixRun({ game, tile }: { game: Game; tile: Tile }) {
  const phoenixRun = game.phoenixRun
  const newCardId = tile.cardId
  const phoenixCard = isPhoenix(newCardId)

  if (!phoenixRun) {
    if (phoenixCard) {
      game.phoenixRun = { number: undefined, combo: 0 }
    }

    return
  }

  if (!continuesPhoenixRun(phoenixRun.number, newCardId)) {
    game.phoenixRun = phoenixCard ? { number: undefined, combo: 0 } : undefined
    captureEvent("phoenix_run_finished", {
      combo: phoenixRun.combo,
    })
    return
  }

  const number = parseNumber(newCardId)
  if (number === null) return

  phoenixRun.combo += 1
  phoenixRun.number = number
}
