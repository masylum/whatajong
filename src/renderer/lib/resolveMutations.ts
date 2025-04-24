import {
  type CardId,
  type Tile,
  type TileDb,
  getCard,
  isMutation,
  isSuit,
} from "./game"

const MUTATION_RANKS = {
  m1: ["o", "c"],
  m2: ["o", "b"],
  m3: ["b", "c"],
} as const

function mapSuits(tileDb: TileDb, fn: (rank: string) => number) {
  const tiles = tileDb.all.filter((tile) => isSuit(tile.cardId))
  for (const tile of tiles) {
    const oldRank = getCard(tile.cardId).rank
    const newRank = fn(oldRank)
    const newCardId = tile.cardId.replace(oldRank, newRank.toString()) as CardId
    tileDb.set(tile.id, { ...tile, cardId: newCardId })
  }
}

export function resolveMutations({
  tileDb,
  tile,
}: { tileDb: TileDb; tile: Tile }) {
  const mutationCard = isMutation(tile.cardId)
  if (!mutationCard) return

  const id = mutationCard.id

  // + 1
  if (id === "m4") {
    mapSuits(tileDb, (rank) => Math.min(Number.parseInt(rank) + 1, 9))
    return
  }

  // - 1
  if (id === "m5") {
    mapSuits(tileDb, (rank) => Math.max(Number.parseInt(rank) - 1, 1))
    return
  }

  const [aSuit, bSuit] = MUTATION_RANKS[id]
  const aTiles = tileDb.all.filter(
    (tile) => getCard(tile.cardId).suit === aSuit,
  )
  const bTiles = tileDb.all.filter(
    (tile) => getCard(tile.cardId).suit === bSuit,
  )

  for (const aTile of aTiles) {
    const newCardId = aTile.cardId.replace(aSuit, bSuit) as CardId
    tileDb.set(aTile.id, { ...aTile, cardId: newCardId })
  }

  for (const bTile of bTiles) {
    const newCardId = bTile.cardId.replace(bSuit, aSuit) as CardId
    tileDb.set(bTile.id, { ...bTile, cardId: newCardId })
  }
}
