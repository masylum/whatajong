import type { Game } from "@/state/gameState"
import { type Tile, cardMatchesColor, isDragon } from "./game"
import { captureEvent } from "./observability"

export function resolveDragons({ game, tile }: { game: Game; tile: Tile }) {
  const dragonRun = game.dragonRun
  const newCard = tile.cardId
  const dragonCard = isDragon(newCard)

  if (!dragonRun) {
    if (dragonCard) {
      game.dragonRun = { color: dragonCard.rank, combo: 1 }
    }

    return
  }

  if (!cardMatchesColor(dragonRun.color, newCard)) {
    captureEvent("dragon_run_finished", {
      color: dragonRun.color,
      combo: dragonRun.combo,
    })
    game.dragonRun = dragonCard
      ? { color: dragonCard.rank, combo: 1 }
      : undefined
    return
  }

  dragonRun.combo = Math.min(dragonRun.combo + 1, 10)
}
