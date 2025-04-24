import type { Translator } from "@/i18n/useTranslation"
import Rand from "rand-seed"
import { indexBy, sumBy } from "remeda"
import { batch } from "solid-js"
import { Database } from "./in-memoriam"
import { RESPONSIVE_MAP } from "./maps/responsive"
import { resolveDragons } from "./resolveDragons"
import { resolveMutations } from "./resolveMutations"
import { resolvePhoenixRun } from "./resolvePhoenixes"
import { resolveWinds } from "./resolveWinds"
import { shuffleTiles } from "./shuffleTiles"

const END_CONDITIONS = ["empty-board", "no-pairs"] as const
type EndConditions = (typeof END_CONDITIONS)[number]

export type PhoenixRun = {
  number: number
  combo: number
}

export type DragonRun = {
  color: Color
  combo: number
}

export type Game = {
  startedAt?: number
  endedAt?: number
  points: number
  endCondition?: EndConditions
  temporaryMaterial?: Material
  dragonRun?: DragonRun
  phoenixRun?: PhoenixRun
}

export function gameOverCondition(tileDb: TileDb, game?: Game) {
  const tilesAlive = tileDb.filterBy({ deleted: false })
  if (tilesAlive.length === 0) {
    return "empty-board"
  }

  const availableTiles = getAvailablePairs(tileDb, game)
  if (availableTiles.length === 0) {
    return "no-pairs"
  }

  return null
}

export function getAvailablePairs(tileDb: TileDb, game?: Game): [Tile, Tile][] {
  const tiles = getFreeTiles(tileDb, game)
  const pairs: [Tile, Tile][] = []

  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      const tile1 = tiles[i]!
      const tile2 = tiles[j]!
      if (tile1.cardId !== tile2.cardId) continue

      pairs.push([tile1, tile2])
    }
  }

  return pairs
}

function getMaterialPoints(material: Material) {
  switch (material) {
    case "glass":
    case "bronze":
      return 2
    case "diamond":
    case "gold":
      return 8
    case "ivory":
      return 4
    case "jade":
      return 16
    default:
      return 0
  }
}

function getActiveKudos(colors: Readonly<Color[]>, tileDb: TileDb) {
  return sumBy(colors, (rank) => {
    return tileDb
      .filterBy({ deleted: false, cardId: `k${rank}` })
      .filter((tile) => !isCovered(tileDb, tile)).length
  })
}

function getActiveHonors(colors: Readonly<Color[]>, tileDb: TileDb) {
  const honors = sumBy(
    colors,
    (rank) =>
      tileDb
        .filterBy({ deleted: false, cardId: `h${rank}` })
        .filter((tile) => isFree(tileDb, tile)).length,
  )

  return honors % 2 === 0 ? honors : honors - 1
}

export function getPoints({
  game,
  tile,
  tileDb,
}: { game: Game; tile: Tile; tileDb: TileDb }) {
  const rawPoints = getRawPoints({
    cardId: tile.cardId,
    material: tile.material,
  })

  const dragonRunMultiplier = getDragonMultiplier(game)
  const phoenixRunMultiplier = getPhoenixRunMultiplier(game)

  const card = getCard(tile.cardId)
  const honors = getActiveHonors(card.colors, tileDb)
  const kudos = getActiveKudos(card.colors, tileDb)

  return (
    (rawPoints + kudos) *
    (1 + dragonRunMultiplier + phoenixRunMultiplier + honors)
  )
}

export function getMaterialCoins(material: Material): number {
  switch (material) {
    case "bronze":
      return 1
    case "gold":
      return 4
    default:
      return 0
  }
}

export function getCoins({
  tile,
  newPoints,
}: { tile: Tile; newPoints: number }): number {
  const materialCoins = getMaterialCoins(tile.material)
  const rabbitCoins = isRabbit(tile.cardId) ? newPoints : 0

  return materialCoins + rabbitCoins
}

export function getRawPoints({
  cardId,
  material,
}: { cardId: CardId; material: Material }) {
  const cardPoints = getCard(cardId).points
  const materialPoints = getMaterialPoints(material)

  return cardPoints + materialPoints
}

export function getFreeTiles(tileDb: TileDb, game?: Game): Tile[] {
  return tileDb
    .filterBy({ deleted: false })
    .filter((tile) => isFree(tileDb, tile, game))
}

export function selectTile({
  tileDb,
  game,
  tileId,
}: {
  tileDb: TileDb
  game: Game
  tileId: string
}) {
  batch(() => {
    const tile = tileDb.get(tileId)
    if (!tile) throw new Error("Tile not found")

    if (!isFree(tileDb, tile, game)) {
      tileDb.set(tileId, { ...tile, selected: false })
      return
    }

    const firstTile = tileDb.findBy({ selected: true })
    if (!firstTile) {
      tileDb.set(tileId, { ...tile, selected: true })
      return
    }

    if (firstTile.id === tileId) {
      tileDb.set(tileId, { ...tile, selected: false })
      return
    }

    tileDb.set(firstTile.id, { ...firstTile, selected: false })

    if (firstTile.cardId === tile.cardId) {
      const tiles = [tile, firstTile]

      deleteTiles(tileDb, tiles)

      // Special cards
      resolveWinds({ tileDb, tile })
      resolveDragons({ game, tile })
      resolvePhoenixRun({ game, tile })
      resolveMutations({ tileDb, tile })
      resolveJokers({ tileDb, tile })
      resolveAstronomer({ tile, game })

      for (const tile of tiles) {
        const newPoints = getPoints({ game, tile, tileDb })
        const newCoins = getCoins({ tile, newPoints })
        tileDb.set(tile.id, { ...tile, points: newPoints, coins: newCoins })
        game.points = game.points + newPoints
      }

      game.temporaryMaterial = undefined
    }

    const condition = gameOverCondition(tileDb, game)

    if (condition) {
      game.endedAt = new Date().getTime()
      game.endCondition = condition
      return
    }
  })
}

export function deleteTiles(tileDb: TileDb, tiles: Tile[]) {
  for (const tile of tiles) {
    tileDb.set(tile.id, { ...tile, deleted: true, selected: false })
  }
}

export const deckTileIndexes = {
  cardId: (tile: DeckTile) => tile.cardId,
  material: (tile: DeckTile) => tile.material,
} as const

export type DeckTileIndexes = typeof deckTileIndexes
export type DeckTile = {
  id: string
  cardId: CardId
  material: Material
}

export type Deck = Database<DeckTile, DeckTileIndexes>

export function getAllTiles(): Card[] {
  return [
    ...bams,
    ...cracks,
    ...dots,
    ...winds,
    ...dragons,
    ...mutations,
    ...jokers,
    ...flowers,
    ...rabbits,
    ...phoenixes,
    ...kudos,
    ...honors,
    ...astronomers,
  ]
}

export function getInitialPairs(): [Card, Card][] {
  const pairs: [Card, Card][] = []
  const regularTiles = [...bams, ...cracks, ...dots]

  // Add 1 pair of each regular tile
  for (const tile of regularTiles) {
    pairs.push([tile, tile])
  }

  return pairs
}

function checkSuit<S extends Suit>(
  cardId: CardId,
  suit: S,
): Extract<Card, { suit: S }> | null {
  const card = getCard(cardId)
  return card.suit === suit ? (card as Extract<Card, { suit: S }>) : null
}

export function isDragon(cardId: CardId) {
  return checkSuit(cardId, "d")
}

export function isMutation(cardId: CardId) {
  return checkSuit(cardId, "m")
}

export function isFlower(cardId: CardId) {
  return checkSuit(cardId, "f")
}

export function isWind(cardId: CardId) {
  return checkSuit(cardId, "w")
}

export function isSuit(cardId: CardId) {
  return isBam(cardId) || isCrack(cardId) || isDot(cardId)
}

export function isBam(cardId: CardId) {
  return checkSuit(cardId, "b")
}

export function isCrack(cardId: CardId) {
  return checkSuit(cardId, "c")
}

export function isDot(cardId: CardId) {
  return checkSuit(cardId, "o")
}

export function isRabbit(cardId: CardId) {
  return checkSuit(cardId, "r")
}

export function isJoker(cardId: CardId) {
  return checkSuit(cardId, "j")
}

export function isPhoenix(cardId: CardId) {
  return checkSuit(cardId, "p")
}

export function isKudo(cardId: CardId) {
  return checkSuit(cardId, "k")
}

function isHonor(cardId: CardId) {
  return checkSuit(cardId, "h")
}

function isAstronomer(cardId: CardId) {
  return checkSuit(cardId, "a")
}

type Position = {
  x: number
  y: number
  z: number
}

export function coord(position: Position) {
  return `${position.x},${position.y},${position.z}`
}

export type Tile = {
  id: string
  cardId: CardId
  deleted: boolean
  selected: boolean
  material: Material
  points?: number
  coins?: number
} & Position
type TileById = Record<string, Tile>
export const tileIndexes = {
  x: (tile: Tile) => tile.x,
  y: (tile: Tile) => tile.y,
  z: (tile: Tile) => tile.z,
  deleted: (tile: Tile) => tile.deleted,
  selected: (tile: Tile) => tile.selected,
  coord,
  cardId: (tile: Tile) => tile.cardId,
} as const
export type TileIndexes = typeof tileIndexes
export type TileDb = Database<Tile, TileIndexes>

export function initTileDb(tiles: TileById) {
  const db = new Database<Tile, TileIndexes>(tileIndexes)
  db.update(tiles)
  return db
}

export function fullyOverlaps(
  tileDb: TileDb,
  position: Position,
  z: number,
): boolean {
  const find = getFinder(tileDb, position)

  const left = find(-1, 0, z)
  const right = find(1, 0, z)
  const top = find(0, -1, z)
  const bottom = find(0, 1, z)
  const topLeft = find(-1, -1, z)
  const topRight = find(1, -1, z)
  const bottomLeft = find(-1, 1, z)
  const bottomRight = find(1, 1, z)
  const center = find(0, 0, z)

  return !!(
    center ||
    (left && right) ||
    (top && bottom) ||
    (topLeft && bottomRight) ||
    (topRight && bottomLeft) ||
    (topLeft && topRight && bottomLeft) ||
    (topLeft && topRight && bottomRight) ||
    (topLeft && bottomLeft && bottomRight) ||
    (topRight && bottomLeft && bottomRight) ||
    (topLeft && topRight && bottomLeft && bottomRight)
  )
}

export function overlaps(tileDb: TileDb, position: Position, z: number) {
  const find = getFinder(tileDb, position)
  const area = [-1, 0, 1]

  for (const x of area) {
    for (const y of area) {
      const tile = find(x, y, z)
      if (tile) return tile
    }
  }

  return null
}

function getFreedoms(tileDb: TileDb, position: Position) {
  const find = getFinder(tileDb, position)
  const hasLeftTile = find(-2, -1) || find(-2, 0) || find(-2, 1)
  const hasRightTile = find(2, -1) || find(2, 0) || find(2, 1)
  const hasTopTile = find(-1, -2) || find(0, -2) || find(1, -2)
  const hasBottomTile = find(-1, 2) || find(0, 2) || find(1, 2)

  return {
    left: !hasLeftTile,
    right: !hasRightTile,
    top: !hasTopTile,
    bottom: !hasBottomTile,
  }
}

export function getFinder(tileDb: TileDb, position: Position) {
  return (x = 0, y = 0, z = 0) => {
    const tile = tileDb
      .filterBy({
        coord: coord({
          x: position.x + x,
          y: position.y + y,
          z: position.z + z,
        }),
      })
      .find((t) => !t.deleted)
    if (!tile) return null

    return tile
  }
}

function isCovered(tileDb: TileDb, tile: Tile) {
  return overlaps(tileDb, tile, 1)
}

export function isFree(tileDb: TileDb, tile: Tile, game?: Game) {
  if (isCovered(tileDb, tile)) return false

  const material = getMaterial(tileDb, tile, game)
  if (material === "glass" || material === "diamond") return true

  const freedoms = getFreedoms(tileDb, tile)
  return freedoms.left || freedoms.right
}

export function getMaterial(tileDb: TileDb, tile: Tile, game?: Game): Material {
  const tempMaterial = game?.temporaryMaterial
  if (!tempMaterial) return tile.material
  if (tile.material === tempMaterial) return tile.material
  if (isFree(tileDb, { ...tile, material: tempMaterial }, game)) {
    return tempMaterial
  }

  return game?.temporaryMaterial ?? tile.material
}

export function cardName(t: Translator, cardId: CardId) {
  const colorCard =
    isDragon(cardId) ||
    isPhoenix(cardId) ||
    isRabbit(cardId) ||
    isKudo(cardId) ||
    isHonor(cardId)

  if (colorCard) {
    return t.cardName[colorCard.suit]({ color: colorCard.rank })
  }

  const mutationCard = isMutation(cardId)
  if (mutationCard) {
    return t.cardName[mutationCard.id]()
  }

  const windCard = isWind(cardId)
  if (windCard) {
    return t.cardName[windCard.suit]({
      direction: t.windDirections[windCard.rank](),
    })
  }

  const astronomerCard = isAstronomer(cardId)
  if (astronomerCard) {
    return t.suit.a()
  }

  const card = getCard(cardId)
  return `${t.suit[card.suit]()} ${card.rank}`
}

export const materials = [
  "glass",
  "diamond",
  "ivory",
  "jade",
  "bone",
  "bronze",
  "gold",
] as const
export type Material = (typeof materials)[number]

function getDragonMultiplier(game: Game) {
  return game.dragonRun?.combo ?? 0
}

function getPhoenixRunMultiplier(game: Game) {
  return game.phoenixRun?.combo ?? 0
}

function resolveJokers({ tileDb, tile }: { tileDb: TileDb; tile: Tile }) {
  const jokerCard = isJoker(tile.cardId)
  if (!jokerCard) return

  const rng = new Rand()
  shuffleTiles({ rng, tileDb })
}

function resolveAstronomer({ tile, game }: { tile: Tile; game: Game }) {
  const astronomerCard = isAstronomer(tile.cardId)
  if (!astronomerCard) return

  game.temporaryMaterial = tile.material
}

type MapType = (number | null)[][][]

export function mapGet(map: MapType, x: number, y: number, z: number) {
  if (x < 0 || y < 0 || z < 0) return null

  return map[z]?.[y]?.[x]?.toString() ?? null
}

export function mapGetWidth() {
  return RESPONSIVE_MAP[0]![0]!.length
}

export function mapGetHeight() {
  return RESPONSIVE_MAP[0]!.length
}

export function mapGetLevels() {
  return RESPONSIVE_MAP.length
}

export function isTransparent(material: Material) {
  return material === "glass" || material === "diamond"
}

export function getMap(tiles: number) {
  const limitedMap = JSON.parse(JSON.stringify(RESPONSIVE_MAP))

  return limitedMap.map((level: (number | null)[][]) =>
    level.map((row: (number | null)[]) =>
      row.map((tile: number | null) =>
        tile !== null && tile > tiles ? null : tile,
      ),
    ),
  )
}

// biome-ignore format:
export type Color = "g" | "r" | "b" | "k"

export const bams = [
  { id: "b1", suit: "b", rank: "1", colors: ["g"], points: 1, level: 1 },
  { id: "b2", suit: "b", rank: "2", colors: ["g"], points: 1, level: 1 },
  { id: "b3", suit: "b", rank: "3", colors: ["g"], points: 1, level: 1 },
  { id: "b4", suit: "b", rank: "4", colors: ["g"], points: 1, level: 1 },
  { id: "b5", suit: "b", rank: "5", colors: ["g"], points: 1, level: 1 },
  { id: "b6", suit: "b", rank: "6", colors: ["g"], points: 1, level: 1 },
  { id: "b7", suit: "b", rank: "7", colors: ["g"], points: 1, level: 1 },
  { id: "b8", suit: "b", rank: "8", colors: ["g"], points: 1, level: 1 },
  { id: "b9", suit: "b", rank: "9", colors: ["g"], points: 1, level: 1 },
] as const
type BamCard = (typeof bams)[number]

export const cracks = [
  { id: "c1", suit: "c", rank: "1", colors: ["r"], points: 1, level: 1 },
  { id: "c2", suit: "c", rank: "2", colors: ["r"], points: 1, level: 1 },
  { id: "c3", suit: "c", rank: "3", colors: ["r"], points: 1, level: 1 },
  { id: "c4", suit: "c", rank: "4", colors: ["r"], points: 1, level: 1 },
  { id: "c5", suit: "c", rank: "5", colors: ["r"], points: 1, level: 1 },
  { id: "c6", suit: "c", rank: "6", colors: ["r"], points: 1, level: 1 },
  { id: "c7", suit: "c", rank: "7", colors: ["r"], points: 1, level: 1 },
  { id: "c8", suit: "c", rank: "8", colors: ["r"], points: 1, level: 1 },
  { id: "c9", suit: "c", rank: "9", colors: ["r"], points: 1, level: 1 },
] as const
type CrackCard = (typeof cracks)[number]

export const dots = [
  { id: "o1", suit: "o", rank: "1", colors: ["b"], points: 1, level: 1 },
  { id: "o2", suit: "o", rank: "2", colors: ["b"], points: 1, level: 1 },
  { id: "o3", suit: "o", rank: "3", colors: ["b"], points: 1, level: 1 },
  { id: "o4", suit: "o", rank: "4", colors: ["b"], points: 1, level: 1 },
  { id: "o5", suit: "o", rank: "5", colors: ["b"], points: 1, level: 1 },
  { id: "o6", suit: "o", rank: "6", colors: ["b"], points: 1, level: 1 },
  { id: "o7", suit: "o", rank: "7", colors: ["b"], points: 1, level: 1 },
  { id: "o8", suit: "o", rank: "8", colors: ["b"], points: 1, level: 1 },
  { id: "o9", suit: "o", rank: "9", colors: ["b"], points: 1, level: 1 },
] as const
type DotCard = (typeof dots)[number]

export const winds = [
  { id: "wn", suit: "w", rank: "n", colors: ["k"], points: 4, level: 2 },
  { id: "ww", suit: "w", rank: "w", colors: ["k"], points: 4, level: 2 },
  { id: "ws", suit: "w", rank: "s", colors: ["k"], points: 4, level: 2 },
  { id: "we", suit: "w", rank: "e", colors: ["k"], points: 4, level: 2 },
] as const
type WindCard = (typeof winds)[number]

export const dragons = [
  { id: "dr", suit: "d", rank: "r", colors: ["r"], points: 2, level: 3 },
  { id: "dg", suit: "d", rank: "g", colors: ["g"], points: 2, level: 3 },
  { id: "db", suit: "d", rank: "b", colors: ["b"], points: 2, level: 3 },
  { id: "dk", suit: "d", rank: "k", colors: ["k"], points: 2, level: 3 },
] as const
type DragonCard = (typeof dragons)[number]

export const rabbits = [
  { id: "rr", suit: "r", rank: "r", colors: ["r"], points: 1, level: 4 },
  { id: "rg", suit: "r", rank: "g", colors: ["g"], points: 1, level: 4 },
  { id: "rb", suit: "r", rank: "b", colors: ["b"], points: 1, level: 4 },
  { id: "rk", suit: "r", rank: "k", colors: ["k"], points: 1, level: 4 },
] as const
type RabbitCard = (typeof rabbits)[number]

// biome-ignore format:
export const flowers = [
  { id: "f1", suit: "f", rank: "", colors: ["r", "g", "b"], points: 2, level: 5, },
  { id: "f2", suit: "f", rank: "", colors: ["r", "g", "b"], points: 2, level: 5, },
  { id: "f3", suit: "f", rank: "", colors: ["r", "g", "b"], points: 2, level: 5, },
] as const
type FlowerCard = (typeof flowers)[number]

export const phoenixes = [
  { id: "pr", suit: "p", rank: "r", colors: ["r"], points: 2, level: 6 },
  { id: "pg", suit: "p", rank: "g", colors: ["g"], points: 2, level: 6 },
  { id: "pb", suit: "p", rank: "b", colors: ["b"], points: 2, level: 6 },
] as const
type PhoenixCard = (typeof phoenixes)[number]

// biome-ignore format:
const mutations = [
  { id: "m1", suit: "m", rank: "", colors: ["b", "r"], points: 2, level: 7 },
  { id: "m2", suit: "m", rank: "", colors: ["g", "b"], points: 2, level: 7 },
  { id: "m3", suit: "m", rank: "", colors: ["r", "g"], points: 2, level: 7 },
  { id: "m4", suit: "m", rank: "", colors: ["r", "g", "b", "k"], points: 2, level: 7 },
  { id: "m5", suit: "m", rank: "", colors: ["r", "g", "b", "k"], points: 2, level: 7 },
] as const
type MutationCard = (typeof mutations)[number]

// biome-ignore format:
export const jokers = [
  { id: "j1", suit: "j", rank: "x", colors: ["g", "r", "b", "k"], points: 8, level: 8 },
] as const
type JokerCard = (typeof jokers)[number]

const kudos = [
  { id: "kr", suit: "k", rank: "r", colors: ["r"], points: 2, level: 9 },
  { id: "kg", suit: "k", rank: "g", colors: ["g"], points: 2, level: 9 },
  { id: "kb", suit: "k", rank: "b", colors: ["b"], points: 2, level: 9 },
  { id: "kk", suit: "k", rank: "k", colors: ["k"], points: 2, level: 9 },
] as const
type KudoCard = (typeof kudos)[number]

const honors = [
  { id: "hr", suit: "h", rank: "r", colors: ["r"], points: 2, level: 10 },
  { id: "hg", suit: "h", rank: "g", colors: ["g"], points: 2, level: 10 },
  { id: "hb", suit: "h", rank: "b", colors: ["b"], points: 2, level: 10 },
  { id: "hk", suit: "h", rank: "k", colors: ["k"], points: 2, level: 10 },
] as const
type HonorCard = (typeof honors)[number]

// biome-ignore format:
const astronomers = [
  { id: "a1", suit: "a", rank: "x", colors: ["g", "r", "b", "k"], points: 8, level: 11 },
] as const
type AstronomerCard = (typeof astronomers)[number]

export type WindDirection = "n" | "s" | "e" | "w"
export type Card =
  | BamCard
  | CrackCard
  | DotCard
  | WindCard
  | DragonCard
  | RabbitCard
  | FlowerCard
  | PhoenixCard
  | MutationCard
  | JokerCard
  | KudoCard
  | HonorCard
  | AstronomerCard
export type CardId = Card["id"]
export type Suit = Card["suit"]

const CARDS_BY_ID = indexBy(getAllTiles(), (c) => c.id)
export function getCard(card: CardId) {
  return CARDS_BY_ID[card]!
}
