import {
  type Card,
  type Dragon,
  type Game,
  type Tile,
  getRank,
  getSuit,
  isDragon,
  isFlower,
  isJoker,
  isMutation,
  isRabbit,
  isSeason,
  isSuit,
} from "./game"
import { captureEvent } from "./observability"

export function cardMatchesDragon(runCard: Dragon, card: Card) {
  const targetSuit = getRank(runCard)
  const suitCard = isSuit(card)
  if (!suitCard) return false

  return targetSuit === getSuit(suitCard)
}

function continuesDragonRun(runCard: Dragon, card: Card) {
  const targetSuit = getRank(runCard)

  if (
    isFlower(card) ||
    isSeason(card) ||
    isJoker(card) ||
    isMutation(card) ||
    isRabbit(card)
  )
    return true
  if (targetSuit === getRank(card)) return true

  return cardMatchesDragon(runCard, card)
}

export function resolveDragons(game: Game, tile: Tile) {
  const dragonRun = game.dragonRun
  const newCard = tile.card
  const dragonCard = isDragon(newCard)

  if (!dragonRun) {
    if (dragonCard) {
      game.dragonRun = { card: dragonCard, combo: 0 }
    }

    return
  }

  if (!continuesDragonRun(dragonRun.card, newCard)) {
    captureEvent("dragon_run_finished", {
      card: dragonRun.card,
      combo: dragonRun.combo,
    })
    game.dragonRun = dragonCard ? { card: dragonCard, combo: 0 } : undefined
    return
  }

  if (isSuit(newCard) || isRabbit(newCard)) {
    dragonRun.combo += 1
  }
}
