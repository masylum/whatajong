import { play } from "@/components/audio"
import { animate } from "@/state/animationState"
import {
  type CardId,
  type Suit,
  type Tile,
  type TileDb,
  getCard,
  isMutation,
  isSuit,
} from "./game"

const MUTATION_RANKS = {
  mutation1: ["crack", "bam"],
  mutation2: ["dot", "crack"],
  mutation3: ["bam", "dot"],
} as const

const MUTATION_MATERIALS = {
  r: ["bone", "garnet", "ruby"],
  g: ["bone", "jade", "emerald"],
  b: ["bone", "topaz", "sapphire"],
} as const

function changeSuits(
  tileDb: TileDb,
  tiles: Tile[],
  fromSuit: Suit,
  toSuit: Suit,
) {
  for (const tile of tiles) {
    const newCardId = tile.cardId.replace(fromSuit, toSuit) as CardId
    const material = tile.material
    const color = isSuit(tile.cardId)!.colors[0]!
    const materialIndex = MUTATION_MATERIALS[color].indexOf(material as any)
    const newColor = isSuit(newCardId)!.colors[0]!
    const newMaterial = MUTATION_MATERIALS[newColor][materialIndex]!
    tileDb.set(tile.id, { ...tile, cardId: newCardId, material: newMaterial })
    animate({ id: tile.id, name: "mutate" })
  }
}

export function resolveMutations({
  tileDb,
  tile,
}: { tileDb: TileDb; tile: Tile }) {
  const mutationCard = isMutation(tile.cardId)
  if (!mutationCard) return

  play("mutation")
  const id = mutationCard.id

  const [aSuit, bSuit] = MUTATION_RANKS[id]
  const aTiles = tileDb.all.filter(
    (tile) => getCard(tile.cardId).suit === aSuit,
  )
  const bTiles = tileDb.all.filter(
    (tile) => getCard(tile.cardId).suit === bSuit,
  )

  changeSuits(tileDb, aTiles, aSuit, bSuit)
  changeSuits(tileDb, bTiles, bSuit, aSuit)
}
