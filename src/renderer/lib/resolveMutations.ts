import {
  type Card,
  MUTATION_RANKS,
  type Tile,
  type TileDb,
  getRank,
  getSuit,
  isMutation,
  isSuit,
} from "./game"

function mapSuits(tileDb: TileDb, fn: (rank: string) => number) {
  const tiles = tileDb.all.filter((tile) => isSuit(tile.card))
  for (const tile of tiles) {
    const oldRank = getRank(tile.card)
    const newRank = fn(oldRank)
    const newCard = tile.card.replace(oldRank, newRank.toString()) as Card
    tileDb.set(tile.id, { ...tile, card: newCard })
  }
}

export function resolveMutations(tileDb: TileDb, tile: Tile) {
  const mutationCard = isMutation(tile.card)
  if (!mutationCard) return

  const rank = getRank(mutationCard)

  // + 1
  if (rank === "4") {
    mapSuits(tileDb, (rank) => Math.min(Number.parseInt(rank) + 1, 9))
    return
  }

  // - 1
  if (rank === "5") {
    mapSuits(tileDb, (rank) => Math.max(Number.parseInt(rank) - 1, 1))
    return
  }

  const [aSuit, bSuit] = MUTATION_RANKS[rank]
  const aTiles = tileDb.all.filter((tile) => getSuit(tile.card) === aSuit)
  const bTiles = tileDb.all.filter((tile) => getSuit(tile.card) === bSuit)

  for (const aTile of aTiles) {
    const newCard = aTile.card.replace(aSuit, bSuit) as Card
    tileDb.set(aTile.id, { ...aTile, card: newCard })
  }

  for (const bTile of bTiles) {
    const newCard = bTile.card.replace(bSuit, aSuit) as Card
    tileDb.set(bTile.id, { ...bTile, card: newCard })
  }
}
