import { play } from "@/components/audio"
import type { Game } from "@/state/gameState"
import type { Tile } from "./game"
import { isGem } from "./game"

export function resolveGems({ tile, game }: { tile: Tile; game: Game }) {
  const gemCard = isGem(tile.cardId)
  if (!gemCard) {
    game.temporaryMaterial = undefined
    return
  }

  play("gemstone")

  const color = gemCard.colors[0]
  const tempMaterial = (
    {
      r: "garnet",
      g: "jade",
      b: "topaz",
      k: "quartz",
    } as const
  )[color]
  game.temporaryMaterial = tempMaterial
}
