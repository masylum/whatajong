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
  m1: ["c", "b"],
  m2: ["o", "c"],
  m3: ["b", "o"],
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
  }
}

export function resolveMutations({
  tileDb,
  tile,
}: { tileDb: TileDb; tile: Tile }) {
  const mutationCard = isMutation(tile.cardId)
  if (!mutationCard) return

  const id = mutationCard.id

  // - 1
  if (id === "m4") {
    mapSuits(tileDb, (rank) => Math.max(Number.parseInt(rank) - 1, 1))
    return
  }

  // + 1
  if (id === "m5") {
    mapSuits(tileDb, (rank) => Math.min(Number.parseInt(rank) + 1, 9))
    return
  }

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
