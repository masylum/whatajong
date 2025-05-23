import type { Game } from "@/state/gameState"
import { type Tile, type TileDb, cardMatchesColor, isDragon } from "./game"
import { captureEvent } from "./observability"

export function resolveDragons({
  game,
  tile,
  tileDb,
}: { game: Game; tile: Tile; tileDb: TileDb }) {
  const dragonRun = game.dragonRun
  const newCard = tile.cardId
  const dragonCard = isDragon(newCard)

  if (!dragonRun) {
    if (dragonCard) {
      game.dragonRun = { color: dragonCard.rank, combo: 1 }
    }

    return
  }

  if (!cardMatchesColor(dragonRun.color, newCard, tileDb)) {
    captureEvent("dragon_run_finished", {
      color: dragonRun.color,
      combo: dragonRun.combo,
    })

    game.dragonRun = dragonCard
      ? { color: dragonCard.rank, combo: 1 }
      : undefined
    return
  }

  if (dragonRun.combo === 10) {
    game.dragonRun = undefined
  } else {
    dragonRun.combo = dragonRun.combo + 1
  }
}
