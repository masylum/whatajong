import {
  type CardId,
  type Game,
  type Tile,
  getCard,
  isDragon,
  isFlower,
  isJoker,
  isMutation,
  isPhoenix,
  isRabbit,
} from "./game"
import { captureEvent } from "./observability"

function continuesPhoenixRun(number: number, cardId: CardId) {
  if (
    isJoker(cardId) ||
    isMutation(cardId) ||
    isFlower(cardId) ||
    isRabbit(cardId) ||
    isDragon(cardId)
  )
    return true
  if (isPhoenix(cardId)) return false

  const rank = Number.parseInt(getCard(cardId).rank)
  if (Number.isNaN(rank)) return false

  return number === 0 || rank === number + 1
}

export function resolvePhoenixRun({ game, tile }: { game: Game; tile: Tile }) {
  const phoenixRun = game.phoenixRun
  const newCardId = tile.cardId
  const phoenixCard = isPhoenix(newCardId)

  if (!phoenixRun) {
    if (phoenixCard) {
      game.phoenixRun = { number: 0, combo: 0 }
    }

    return
  }

  if (!continuesPhoenixRun(phoenixRun.number, newCardId)) {
    game.phoenixRun = phoenixCard ? { number: 0, combo: 0 } : undefined
    captureEvent("phoenix_run_finished", {
      combo: phoenixRun.combo,
    })
    return
  }

  const number = Number.parseInt(getCard(newCardId).rank)
  if (Number.isNaN(number)) return

  phoenixRun.combo += 1

  if (number === 9) {
    phoenixRun.number = 0
  } else {
    phoenixRun.number = number
  }
}
