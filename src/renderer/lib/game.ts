import type { Translator } from "@/i18n/useTranslation"
import { type RunState, ownedEmperors } from "@/state/runState"
import { nanoid } from "nanoid"
import Rand from "rand-seed"
import { sumBy } from "remeda"
import { batch } from "solid-js"
import { Database } from "./in-memoriam"
import { RESPONSIVE_MAP } from "./maps/responsive"
import { cardMatchesDragon, resolveDragons } from "./resolveDragons"
import { resolveMutations } from "./resolveMutations"
import { resolvePhoenixRun } from "./resolvePhoenixes"
import { resolveRabbits } from "./resolveRabbits"
import { resolveWinds } from "./resolveWinds"
import { shuffleTiles } from "./shuffleTiles"

const END_CONDITIONS = ["empty-board", "no-pairs"] as const
type EndConditions = (typeof END_CONDITIONS)[number]

export type PhoenixRun = {
  number: number
  combo: number
}

export type DragonRun = {
  card: Dragon
  combo: number
}

export type BoatRun = {
  score: boolean
  directions: WindDirection[]
  combo: number
}

export type Game = {
  startedAt?: number
  endedAt?: number
  points: number
  endCondition?: EndConditions
  transport?: Transport
  temporaryMaterial?: Material
  rabbitActive?: boolean
  dragonRun?: DragonRun
  phoenixRun?: PhoenixRun
  boatRun?: BoatRun
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

export function toPairs(tiles: Tile[]) {
  const pairs: [Tile, Tile][] = []

  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      const tile1 = tiles[i]!
      const tile2 = tiles[j]!
      if (!cardsMatch(tile1.card, tile2.card)) continue

      pairs.push([tile1, tile2])
    }
  }

  return pairs
}

export function getAvailablePairs(tileDb: TileDb, game?: Game): [Tile, Tile][] {
  const freeTiles = getFreeTiles(tileDb, game)
  return toPairs(freeTiles)
}

export function getCardPoints(card: Card) {
  if (isDragon(card)) return 0
  if (isFlower(card)) return 2
  if (isPhoenix(card)) return 2
  if (isRabbit(card)) return 2
  if (isSeason(card)) return 2
  if (isJoker(card)) return 8
  if (isTransport(card)) return 8
  if (isWind(card)) return 4

  return 1
}

function getMaterialPoints(material: Material) {
  switch (material) {
    case "wood":
      return 2
    case "glass":
    case "bronze":
      return 4
    case "diamond":
    case "gold":
      return 16
    case "ivory":
      return 8
    case "jade":
      return 32
    default:
      return 0
  }
}

function getMaterialMultiplier(material: Material) {
  switch (material) {
    case "bronze":
    case "glass":
    case "ivory":
      return 0.5
    case "gold":
    case "diamond":
    case "jade":
      return 2
    default:
      return 0
  }
}

export function getPoints({
  game,
  run,
  tiles,
  tileDb,
}: { game: Game; run?: RunState; tiles: Tile[]; tileDb?: TileDb }) {
  let points = 0
  let multiplier = 1

  for (const tile of tiles) {
    points += getRawPoints({
      card: tile.card,
      material: tile.material,
      run,
      tileDb,
      game,
    })
    multiplier += getRawMultiplier({
      game,
      card: tile.card,
      material: tile.material,
      run,
      tileDb,
    })
  }

  return points * multiplier
}

export function getMaterialCoins(material: Material): number {
  switch (material) {
    case "bronze":
    case "jade":
    case "diamond":
      return 5
    case "gold":
      return 20
    default:
      return 0
  }
}

export function getCoins({
  tiles,
  run,
  game,
  newPoints,
  tileDb,
}: {
  tiles: Tile[]
  run?: RunState
  game: Game
  newPoints: number
  tileDb?: TileDb
}): number {
  const materialCoins = sumBy(tiles, (tile) => getMaterialCoins(tile.material))
  const rabbitCoins = Math.min(game.rabbitActive ? newPoints : 0, 300)
  const emperorCoins = sumBy(ownedEmperors(run), (emperor) =>
    sumBy(
      tiles,
      (tile) =>
        emperor.getCoins?.({
          card: tile.card,
          material: tile.material,
          tileDb,
          game,
        }) ?? 0,
    ),
  )

  return materialCoins + emperorCoins + rabbitCoins
}

function getJokerPoints(card: Card, tileDb: TileDb) {
  if (!isJoker(card)) return 0

  return tileDb.size
}

export function getRawPoints({
  card,
  material,
  run,
  tileDb,
  game,
}: {
  card: Card
  material: Material
  run?: RunState
  tileDb?: TileDb
  game?: Game
}) {
  const cardPoints = getCardPoints(card)
  const materialPoints = getMaterialPoints(material)
  const emperorPoints = sumBy(
    ownedEmperors(run),
    (emperor) => emperor.getRawPoints?.({ card, material, tileDb, game }) ?? 0,
  )
  let jokerPoints = 0

  if (tileDb) {
    jokerPoints = getJokerPoints(card, tileDb)
  }

  return cardPoints + materialPoints + emperorPoints + jokerPoints
}

export function getRawMultiplier({
  game,
  card,
  material,
  run,
  tileDb,
}: {
  game?: Game
  card: Card
  material: Material
  run?: RunState
  tileDb?: TileDb
}) {
  const materialMultiplier = getMaterialMultiplier(material)
  let dragonRunMultiplier = 0
  let rabbitMultiplier = 0
  let phoenixRunMultiplier = 0

  if (game) {
    dragonRunMultiplier = getDragonMultiplier(game, card)
    rabbitMultiplier = getBoatMultiplier(game)
    phoenixRunMultiplier = getPhoenixRunMultiplier(game)
  }

  const emperorMultiplier = sumBy(
    ownedEmperors(run),
    (emperor) =>
      emperor.getRawMultiplier?.({
        card,
        material,
        tileDb,
        game,
      }) ?? 0,
  )

  return (
    materialMultiplier +
    dragonRunMultiplier +
    phoenixRunMultiplier +
    rabbitMultiplier +
    emperorMultiplier
  )
}

export function getFreeTiles(tileDb: TileDb, game?: Game): Tile[] {
  return tileDb
    .filterBy({ deleted: false })
    .filter((tile) => isFree(tileDb, tile, game))
}

export function selectTile({
  tileDb,
  run,
  game,
  tileId,
}: {
  tileDb: TileDb
  run?: RunState
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

    if (cardsMatch(firstTile.card, tile.card)) {
      const tiles = [tile, firstTile]

      deleteTiles(tileDb, tiles)

      // Special cards
      resolveWinds(tileDb, tile)
      resolveDragons(game, tile)
      resolvePhoenixRun(game, tile)
      resolveMutations(tileDb, tile)
      resolveJokers(tileDb, tile)

      const newPoints = getPoints({ game, run, tiles, tileDb })
      const newCoins = getCoins({ tiles, run, game, newPoints, tileDb })

      game.points = game.points + newPoints
      tileDb.set(tile.id, { ...tile, points: newPoints, coins: newCoins })

      resolveRabbits(game, tile)
      resolveTemporaryMaterial(game, tile)

      if (run) {
        for (const emperor of ownedEmperors(run)) {
          emperor.whenMatched?.({ run, tile, tileDb, game })
        }
      }
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

const suits = [
  "b",
  "c",
  "o",
  "d",
  "f",
  "s",
  "p",
  "r",
  "m",
  "w",
  "j",
  "t",
] as const
export type Suit = (typeof suits)[number]

// biome-ignore format:
export const bams = [ "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9" ] as const
// biome-ignore format:
export const cracks = [ "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9" ] as const
// biome-ignore format:
export const dots = [ "o1", "o2", "o3", "o4", "o5", "o6", "o7", "o8", "o9" ] as const
export const winds = ["wn", "ww", "ws", "we"] as const
export const flowers = ["f1", "f2", "f3", "f4"] as const
export const seasons = ["s1", "s2", "s3", "s4"] as const
export const dragons = ["dc", "db", "do"] as const
export const rabbits = ["r1", "r2", "r3", "r4"] as const
export const phoenix = ["pb", "pc", "po"] as const
export const mutations = ["m1", "m2", "m3", "m4", "m5"] as const
export const jokers = ["j1"] as const
export const transports = ["tn", "tw", "ts", "te"] as const
const dummy = ["x1"] as const

type Bam = (typeof bams)[number]
type Crack = (typeof cracks)[number]
type Dot = (typeof dots)[number]
export type Wind = (typeof winds)[number]
type Flower = (typeof flowers)[number]
type Season = (typeof seasons)[number]
export type Dragon = (typeof dragons)[number]
type Rabbit = (typeof rabbits)[number]
type Phoenix = (typeof phoenix)[number]
type Joker = (typeof jokers)[number]
type Transport = (typeof transports)[number]
type Dummy = (typeof dummy)[number]
export type Mutation = (typeof mutations)[number]
export type Card =
  | Bam
  | Crack
  | Dot
  | Wind
  | Flower
  | Season
  | Dragon
  | Dummy
  | Phoenix
  | Rabbit
  | Mutation
  | Joker
  | Transport
export type WindDirection = "n" | "s" | "e" | "w"

export const deckTileIndexes = {
  card: (tile: DeckTile) => tile.card,
  material: (tile: DeckTile) => tile.material,
} as const

export type DeckTileIndexes = typeof deckTileIndexes
export type DeckTile = {
  id: string
  card: Card
  material: Material
}

export type Deck = Database<DeckTile, DeckTileIndexes>

export function getStandardPairs(): [Card, Card][] {
  const pairs: [Card, Card][] = []
  const regularTiles = [...bams, ...cracks, ...dots, ...winds, ...dragons]

  // Add 2 pairs of each regular tile
  for (const tile of regularTiles) {
    pairs.push([tile, tile], [tile, tile])
  }
  const [s1, s2, s3, s4] = seasons
  const [f1, f2, f3, f4] = flowers
  pairs.push([s1, s2], [s3, s4])
  pairs.push([f1, f2], [f3, f4])

  return pairs
}

export function getRunPairs(): [Card, Card][] {
  const pairs: [Card, Card][] = []
  const regularTiles = [...bams, ...cracks, ...dots, ...winds, ...dragons]

  // Add 1 pair of each regular tile
  for (const tile of regularTiles) {
    pairs.push([tile, tile])
  }

  return pairs
}

type ExtractSuit<T> = T extends `${infer S}${string}`
  ? S extends Suit
    ? S
    : never
  : never
type ExtractNumber<T> = T extends `${Suit}${infer N}` ? N : never

export function getSuit<T extends Card>(card: T): ExtractSuit<T> {
  return card[0] as ExtractSuit<T>
}

export function getRank<T extends Card>(card: T): ExtractNumber<T> {
  return card.charAt(1) as ExtractNumber<T>
}

export function matchesSuit(card: Card | Suit, suit: Suit) {
  return card.startsWith(suit)
}

export function cardsMatch(card1: Card, card2: Card) {
  if (card1 === card2) return true
  if (isFlower(card1) && isFlower(card2)) return true
  if (isSeason(card1) && isSeason(card2)) return true

  return false
}

export function isDragon(card: Card | Suit) {
  return matchesSuit(card, "d") ? (card as Dragon) : null
}

export function isMutation(card: Card | Suit) {
  return matchesSuit(card, "m") ? (card as Mutation) : null
}

export function isFlower(card: Card | Suit) {
  return matchesSuit(card, "f") ? (card as Flower) : null
}

export function isSeason(card: Card | Suit) {
  return matchesSuit(card, "s") ? (card as Season) : null
}

export function isWind(card: Card | Suit) {
  return matchesSuit(card, "w") ? (card as Wind) : null
}

export function isSuit(card: Card | Suit) {
  return isBam(card) || isCrack(card) || isDot(card)
}

export function isBam(card: Card | Suit) {
  return matchesSuit(card, "b") ? (card as Bam) : null
}

export function isCrack(card: Card | Suit) {
  return matchesSuit(card, "c") ? (card as Crack) : null
}

export function isDot(card: Card | Suit) {
  return matchesSuit(card, "o") ? (card as Dot) : null
}

export function isRabbit(card: Card | Suit) {
  return matchesSuit(card, "r") ? (card as Rabbit) : null
}

export function isJoker(card: Card | Suit) {
  return matchesSuit(card, "j") ? (card as Joker) : null
}

export function isTransport(card: Card | Suit) {
  return matchesSuit(card, "t") ? (card as Transport) : null
}

export function isPhoenix(card: Card | Suit) {
  return matchesSuit(card, "p") ? (card as Phoenix) : null
}

export function getStandardDeck() {
  return getStandardPairs().map(
    ([card1, _]) =>
      ({
        id: nanoid(),
        card: card1,
        material: "bone",
      }) as DeckTile,
  )
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
  card: Card
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

export function isFree(tileDb: TileDb, tile: Tile, game?: Game) {
  const isCovered = overlaps(tileDb, tile, 1)
  if (isCovered) return false

  const material = getMaterial(tileDb, tile, game)
  if (material === "diamond") return true

  const freedoms = getFreedoms(tileDb, tile)
  const countFreedoms = Object.values(freedoms).filter((v) => v).length

  if (material === "glass" || material === "wood") {
    return countFreedoms >= 1
  }

  if (material === "gold" || material === "jade") {
    return countFreedoms >= 3
  }

  const isFreeH = freedoms.left || freedoms.right
  return isFreeH
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

export function suitName(card: Card | Suit) {
  if (isFlower(card)) return "flower"
  if (isSeason(card)) return "season"
  if (isBam(card)) return "bam"
  if (isCrack(card)) return "crack"
  if (isDot(card)) return "dot"
  if (isDragon(card)) return "dragon"
  if (isWind(card)) return "wind"
  if (isRabbit(card)) return "rabbit"
  if (isPhoenix(card)) return "phoenix"
  if (isJoker(card)) return "joker"
  if (isMutation(card)) return "mutation"
  if (isTransport(card)) return "transport"

  throw Error("Unknown suit")
}

export const MUTATION_RANKS = {
  1: ["o", "c"],
  2: ["o", "b"],
  3: ["b", "c"],
} as const

export function cardName(t: Translator, card: Card) {
  const dragonCard = isDragon(card)

  if (dragonCard) {
    return t.cardName[dragonCard]()
  }

  const phoenixCard = isPhoenix(card)
  if (phoenixCard) {
    return t.cardName[phoenixCard]()
  }

  const mutationCard = isMutation(card)
  if (mutationCard) {
    const rank = getRank(mutationCard)
    if (rank === "4") {
      return t.cardName.m4()
    }

    if (rank === "5") {
      return t.cardName.m5()
    }

    const mutation = MUTATION_RANKS[rank]
    return t.cardName.mutation({
      from: suitName(mutation[0]),
      to: suitName(mutation[1]),
    })
  }

  const windCard = isWind(card)
  if (windCard) {
    const direction = getWindDirection(t, windCard)
    return t.cardName.wind({ direction })
  }

  return `${t.suit[getSuit(card)]()} ${getRank(card)}`
}

export function getWindDirection(t: Translator, card: Wind) {
  const direction = getRank(card)
  return t.windDirections[direction]()
}

export function getMutationRanks(card: Mutation) {
  const rank = getRank(card)
  if (rank === "4" || rank === "5") return

  return MUTATION_RANKS[rank]
}

export const materials = [
  "glass",
  "diamond",
  "ivory",
  "jade",
  "bone",
  "bronze",
  "gold",
  "wood",
] as const
export type Material = (typeof materials)[number]

function getDragonMultiplier(game: Game, card: Card) {
  const dragonRun = game.dragonRun
  if (!dragonRun) return 0

  if (!cardMatchesDragon(dragonRun.card, card)) {
    return 0
  }

  return dragonRun.combo
}

function getPhoenixRunMultiplier(game: Game) {
  return game.phoenixRun?.combo ?? 0
}

function getBoatMultiplier(game: Game) {
  const boatRun = game.boatRun
  if (!boatRun) return 0

  return boatRun.combo
}

export function resolveTemporaryMaterial(game: Game, tile: Tile) {
  if (isFlower(tile.card) || isSeason(tile.card)) {
    game.temporaryMaterial = "wood"
  } else {
    game.temporaryMaterial = undefined
  }
}

function resolveJokers(tileDb: TileDb, tile: Tile) {
  const jokerCard = isJoker(tile.card)
  if (!jokerCard) return

  const rng = new Rand()
  shuffleTiles({ rng, tileDb })
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

export type Level = 1 | 2 | 3 | 4 | 5
