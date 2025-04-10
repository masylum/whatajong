import {
  type Card,
  type Game,
  type Tile,
  getRank,
  isDragon,
  isJoker,
  isMutation,
  isPhoenix,
  isRabbit,
  isSuit,
} from "./game"
import { captureEvent } from "./observability"

function continuesPhoenixRun(number: number, card: Card) {
  if (isJoker(card) || isMutation(card) || isRabbit(card) || isDragon(card))
    return true
  if (isPhoenix(card)) return false

  const rank = Number.parseInt(getRank(card))
  if (Number.isNaN(rank)) return true

  return rank === number + 1
}

export function resolvePhoenixRun(game: Game, tile: Tile) {
  const phoenixRun = game.phoenixRun
  const newCard = tile.card
  const phoenixCard = isPhoenix(newCard)

  if (!phoenixRun) {
    if (phoenixCard) {
      game.phoenixRun = { card: phoenixCard, number: 0, combo: 0 }
    }

    return
  }

  if (!continuesPhoenixRun(phoenixRun.number, newCard)) {
    game.phoenixRun = phoenixCard
      ? { card: phoenixCard, number: 0, combo: 0 }
      : undefined
    captureEvent("phoenix_run_finished", {
      card: phoenixRun.card,
      combo: phoenixRun.combo,
    })
    return
  }

  if (isRabbit(newCard)) {
    phoenixRun.combo += 1

    if (phoenixRun.number === 8) {
      phoenixRun.number = 0
    } else {
      phoenixRun.number += 1
    }
    return
  }

  if (isSuit(newCard)) {
    phoenixRun.combo += 1

    const number = Number.parseInt(getRank(newCard))
    if (number === 9) {
      phoenixRun.number = 0
    } else {
      phoenixRun.number = number
    }
  }
}
