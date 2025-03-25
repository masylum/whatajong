import { resolveWinds } from "./resolveWinds"
import { batch } from "solid-js"
import { nanoid } from "nanoid"
import { initDatabase, type Database } from "./in-memoriam"
import { PROGRESSIVE_MAP } from "./maps/progressive"
import type { RunState } from "@/state/runState"
import { getEmperors } from "@/state/emperors"
import { sumBy } from "remeda"
import { shuffleTiles } from "./shuffleTiles"
import Rand from "rand-seed"
import { cardMatchesDragon, resolveDragons } from "./resolveDragons"
import { resolvePhoenixRun } from "./resolvePhoenixes"
import { resolveRabbits } from "./resolveRabbits"
import { resolveMutations } from "./resolveMutations"

export const WIN_CONDITIONS = ["empty-board", "no-pairs"] as const
export type WinCondition = (typeof WIN_CONDITIONS)[number]

export type PhoenixRun = {
  card: Phoenix
  number: number
  combo: number
}

export type DragonRun = {
  card: Dragon
  combo: number
}

export type RabbitRun = {
  card: Rabbit
  score: boolean
  combo: number
}

export type Game = {
  startedAt?: number
  endedAt?: number
  points: number
  endCondition?: WinCondition
  transport?: Transport
  flowerOrSeason?: Flower | Season
  dragonRun?: DragonRun
  phoenixRun?: PhoenixRun
  rabbitRun?: RabbitRun
}

export function gameOverCondition(tileDb: TileDb, game?: Game) {
  const tilesAlive = tileDb.filterBy({ deleted: false })
  if (tilesAlive.length === 0) {
    return "empty-board"
  }

  const availablePairs = getAvailablePairs(tileDb, game)
  if (availablePairs.length === 0) {
    return "no-pairs"
  }

  return null
}

export function getAvailablePairs(tileDb: TileDb, game?: Game): [Tile, Tile][] {
  const freeTiles = getFreeTiles(tileDb, game)
  const pairs: [Tile, Tile][] = []

  for (let i = 0; i < freeTiles.length; i++) {
    for (let j = i + 1; j < freeTiles.length; j++) {
      const tile1 = freeTiles[i]!
      const tile2 = freeTiles[j]!
      if (!cardsMatch(tile1.card, tile2.card)) continue

      pairs.push([tile1, tile2])
    }
  }

  return pairs
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

export function getMaterialPoints(material: Material) {
  switch (material) {
    case "wood":
      return 2
    case "glass":
      return 4
    case "jade":
      return 16
    case "bronze":
      return 8
    case "gold":
      return 32
    default:
      return 0
  }
}

export function getMaterialMultiplier(material: Material) {
  switch (material) {
    case "bronze":
    case "glass":
    case "wood":
      return 1
    case "gold":
    case "jade":
      return 4
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
    })
    multiplier += getRawMultiplier({
      game,
      card: tile.card,
      material: tile.material,
      run,
    })
  }

  return points * multiplier
}

export function getMaterialCoins(material: Material): number {
  switch (material) {
    case "bronze":
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
}: { tiles: Tile[]; run?: RunState; game: Game; newPoints: number }): number {
  const materialCoins = sumBy(tiles, (tile) => getMaterialCoins(tile.material))
  const rabbitMultiplier = getRabbitMultiplier(game)
  const emperorCoins = sumBy(getOwnedEmperors(run), (emperor) =>
    sumBy(tiles, (tile) => emperor.getCoins?.({ tile }) ?? 0),
  )

  return newPoints * rabbitMultiplier + materialCoins + emperorCoins
}

export function getJokerPoints(card: Card, tileDb: TileDb) {
  if (!isJoker(card)) return 0

  return tileDb.size
}

export function getRawPoints({
  card,
  run,
  material,
  tileDb,
}: { card: Card; run?: RunState; material: Material; tileDb?: TileDb }) {
  const cardPoints = getCardPoints(card)
  const materialPoints = getMaterialPoints(material)
  const emperorPoints = sumBy(
    getOwnedEmperors(run),
    (emperor) => emperor.getRawPoints?.({ card, material }) ?? 0,
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
}: {
  game?: Game
  card?: Card
  material?: Material
  run?: RunState
}) {
  let materialMultiplier = 0
  let dragonRunMultiplier = 0
  let phoenixRunMultiplier = 0
  let rabbitMultiplier = 0

  if (material) {
    materialMultiplier = getMaterialMultiplier(material)
  }

  if (game && card) {
    dragonRunMultiplier = getDragonMultiplier(game, card)
    rabbitMultiplier = getRabbitMultiplier(game)
    phoenixRunMultiplier = getPhoenixRunMultiplier(game)
  }

  const emperorMultiplier = sumBy(
    getOwnedEmperors(run),
    (emperor) => emperor.getRawMultiplier?.({ card, material }) ?? 0,
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

    console.log(tile.card, isFree(tileDb, tile, game))
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
      resolveFlowersAndSeasons(game, tile)
      resolveRabbits(game, tile)
      resolveMutations(tileDb, tile)
      resolveJokers(tileDb, tile)

      const newPoints = getPoints({ game, run, tiles, tileDb })
      const newCoins = getCoins({ tiles, run, game, newPoints })

      game.points = game.points + newPoints
      tileDb.set(tile.id, { ...tile, points: newPoints, coins: newCoins })
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

export const suits = [
  "b",
  "c",
  "o",
  "d",
  "f",
  "s",
  "p",
  "r",
  "a",
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

export type Bam = (typeof bams)[number]
export type Crack = (typeof cracks)[number]
export type Dot = (typeof dots)[number]
export type Wind = (typeof winds)[number]
export type Flower = (typeof flowers)[number]
export type Season = (typeof seasons)[number]
export type Dragon = (typeof dragons)[number]
export type Rabbit = (typeof rabbits)[number]
export type Phoenix = (typeof phoenix)[number]
export type Joker = (typeof jokers)[number]
export type Transport = (typeof transports)[number]
export type Dummy = (typeof dummy)[number]
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

export const deckTileIndexes = ["card", "material"] as const
export type DeckTileIndexes = (typeof deckTileIndexes)[number]
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

export type Position = {
  x: number
  y: number
  z: number
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
export type TileById = Record<string, Tile>
export const tileIndexes = ["x", "y", "z", "deleted", "selected"] as const
export type TileIndexes = (typeof tileIndexes)[number]
export type TileDb = Database<Tile, TileIndexes>

export function initTileDb(tiles: TileById): TileDb {
  return initDatabase({ indexes: tileIndexes }, tiles)
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
        x: position.x + x,
        y: position.y + y,
        z: position.z + z,
      })
      .filter((tile) => !tile.deleted)[0]
    if (!tile) return null

    return tile
  }
}

export function isFree(tileDb: TileDb, tile: Tile, game?: Game) {
  const isCovered = overlaps(tileDb, tile, 1)
  const freedoms = getFreedoms(tileDb, tile)
  const countFreedoms = Object.values(freedoms).filter((v) => v).length
  const material = getMaterial(tile, game)

  if (material === "jade") return !isCovered
  if (material === "glass" || material === "wood") {
    return countFreedoms >= 1 && !isCovered
  }

  if (material === "bone" || material === "bronze") {
    const isFreeH = freedoms.left || freedoms.right
    return isFreeH && !isCovered
  }

  return countFreedoms >= 3 && !isCovered
}

export function getMaterial(tile: Tile, game?: Game): Material {
  if (game?.flowerOrSeason) return "wood"

  return tile.material
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

  return "unknown"
}

export const MUTATION_RANKS = {
  1: ["d", "c"],
  2: ["d", "b"],
  3: ["b", "c"],
} as const

export function cardName(card: Card) {
  const dragonCard = isDragon(card)
  if (dragonCard) {
    console.log(
      "dragonCard",
      dragonCard,
      getRank(dragonCard),
      suitName(getRank(dragonCard)),
    )
    return `${suitName(getRank(dragonCard))} dragon`
  }

  const phoenixCard = isPhoenix(card)
  if (phoenixCard) {
    return `${suitName(getRank(phoenixCard))} phoenix`
  }

  const mutationCard = isMutation(card)
  if (mutationCard) {
    const rank = getRank(mutationCard)
    if (rank === "4") {
      return "mutation +1"
    }

    if (rank === "5") {
      return "mutation -1"
    }

    const mutation = MUTATION_RANKS[rank]
    return `${suitName(mutation[0])} / ${suitName(mutation[1])} mutation`
  }

  return `${suitName(card)} ${getRank(card)}`
}

export const materials = [
  "glass",
  "jade",
  "bone",
  "bronze",
  "gold",
  "wood",
] as const
export type Material = (typeof materials)[number]

export function getDragonMultiplier(game: Game, card: Card) {
  const dragonRun = game.dragonRun
  if (!dragonRun) return 0

  if (!cardMatchesDragon(dragonRun.card, card)) {
    return 0
  }

  return dragonRun.combo
}

export function getPhoenixRunMultiplier(game: Game) {
  return game.phoenixRun?.combo ?? 0
}

export function getRabbitMultiplier(game: Game) {
  const rabbitRun = game.rabbitRun
  if (!rabbitRun) return 0
  if (!rabbitRun.score) return 0

  return rabbitRun.combo
}

export function resolveFlowersAndSeasons(game: Game, tile: Tile) {
  const flowerOrSeason = isFlower(tile.card) || isSeason(tile.card)
  game.flowerOrSeason = flowerOrSeason ?? undefined
}

export function resolveJokers(tileDb: TileDb, tile: Tile) {
  const jokerCard = isJoker(tile.card)
  if (!jokerCard) return

  const rng = new Rand()
  shuffleTiles({ rng, tileDb })
}

export type MapType = (number | null)[][][]

export function mapGet(map: MapType, x: number, y: number, z: number) {
  if (x < 0 || y < 0 || z < 0) return null

  return map[z]?.[y]?.[x]?.toString() ?? null
}

export function mapGetWidth() {
  return PROGRESSIVE_MAP[0]![0]!.length
}

export function mapGetHeight() {
  return PROGRESSIVE_MAP[0]!.length
}

export function mapGetLevels() {
  return PROGRESSIVE_MAP.length
}

export function isTransparent(material: Material) {
  return material === "glass" || material === "jade"
}

export function getMap(tiles: number) {
  const limitedMap = JSON.parse(JSON.stringify(PROGRESSIVE_MAP))

  return limitedMap.map((level: (number | null)[][]) =>
    level.map((row: (number | null)[]) =>
      row.map((tile: number | null) =>
        tile !== null && tile > tiles ? null : tile,
      ),
    ),
  )
}

export function getOwnedEmperors(run?: RunState) {
  if (!run) return []

  const names = new Set(
    run.items
      .filter((item) => item.type === "emperor")
      .map((item) => item.name),
  )
  if (!names.size) return []

  return getEmperors().filter((emperor) => names.has(emperor.name))
}
