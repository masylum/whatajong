import { isIncludedIn } from "remeda"
import {
  type CardId,
  type Color,
  type Game,
  type Tile,
  getCard,
  isDragon,
} from "./game"
import { captureEvent } from "./observability"

export function cardMatchesDragon(color: Color, cardId: CardId) {
  const colors = getCard(cardId).colors
  return isIncludedIn(color, colors)
}

export function resolveDragons({ game, tile }: { game: Game; tile: Tile }) {
  const dragonRun = game.dragonRun
  const newCard = tile.cardId
  const dragonCard = isDragon(newCard)

  if (!dragonRun) {
    if (dragonCard) {
      game.dragonRun = { color: dragonCard.rank, combo: 0 }
    }

    return
  }

  if (!cardMatchesDragon(dragonRun.color, newCard)) {
    captureEvent("dragon_run_finished", {
      color: dragonRun.color,
      combo: dragonRun.combo,
    })
    game.dragonRun = dragonCard
      ? { color: dragonCard.rank, combo: 0 }
      : undefined
    return
  }

  dragonRun.combo += 1
}
