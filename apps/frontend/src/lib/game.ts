import { resolveWinds } from "./winds"
import { batch } from "solid-js"
import { nanoid } from "nanoid"
import { initDatabase, type Database } from "./in-memoriam"
import { PROGRESSIVE_MAP } from "./maps/progressive"
import type { RunState } from "@/state/runState"
import { EMPERORS } from "@/state/emperors"
import { sumBy } from "remeda"
import { FAST_SELECTION_THRESHOLD } from "@/components/game/createVoicesEffect"
import { shuffleTiles } from "./shuffleTiles"
import Rand from "rand-seed"

export const WIN_CONDITIONS = ["empty-board", "no-pairs"] as const
export type WinCondition = (typeof WIN_CONDITIONS)[number]

export type Game = {
  startedAt?: number
  endedAt?: number
  points: number
  endCondition?: WinCondition
  rabbit?: {
    timestamp: number
    combo: number
  }
  transport?: Transport
  flowerOrSeason?: Flower | Season
  dragonRun?: {
    card: Dragon
    combo: number
  }
  animal?: Animal
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
  if (isRabbit(card)) return 2
  if (isSeason(card)) return 2
  if (isAnimal(card)) return 4
  if (isJoker(card)) return 8
  if (isTransport(card)) return 8
  if (isWind(card)) return 4

  return 1
}

export function getMaterialPoints(material: Material) {
  switch (material) {
    case "bam":
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
      return 0.5
    case "gold":
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
    })
    multiplier += getRawMultiplier({
      game,
      card: tile.card,
      material: tile.material,
      run,
    })
  }

  return { points, multiplier }
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
  game,
  newPoints,
}: { tiles: Tile[]; game: Game; newPoints: number }): number {
  const materialCoins = sumBy(tiles, (tile) => getMaterialCoins(tile.material))
  const animalMultiplier = getAnimalMultiplier(game)

  return newPoints * animalMultiplier + materialCoins
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
    getEmperors(run),
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
  let animalMultiplier = 0

  if (material) {
    materialMultiplier = getMaterialMultiplier(material)
  }

  if (game && card) {
    dragonRunMultiplier = getDragonMultiplier(game, card)
    animalMultiplier = getAnimalMultiplier(game)
  }

  const emperorMultiplier = sumBy(
    getEmperors(run),
    (emperor) => emperor.getRawMultiplier?.({ card, material }) ?? 0,
  )

  return (
    materialMultiplier +
    dragonRunMultiplier +
    emperorMultiplier +
    animalMultiplier
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
      resolveFlowersAndSeasons(game, tile)
      resolveRabbits(game, tile)
      resolveAnimals(game, tile)
      resolvePhoenix(tileDb, tile)
      resolveJokers(tileDb, tile)

      const { points, multiplier } = getPoints({ game, run, tiles, tileDb })
      const newCoins = getCoins({ tiles, game, newPoints: points })
      const newPoints = points * multiplier

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

const suits = [
  "b",
  "c",
  "o",
  "d",
  "w",
  "f",
  "s",
  "p",
  "r",
  "a",
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
export const dragons = ["dc", "df", "dp"] as const
export const rabbits = ["r1", "r2", "r3", "r4"] as const
export const phoenix = ["p1", "p2", "p3"] as const
export const animals = ["a1", "a2", "a3", "a4"] as const
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
export type Animal = (typeof animals)[number]
export type Joker = (typeof jokers)[number]
export type Transport = (typeof transports)[number]
export type Dummy = (typeof dummy)[number]
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
  | Animal
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

export function isFlower(card: Card | Suit) {
  return matchesSuit(card, "f") ? (card as Flower) : null
}

export function isSeason(card: Card | Suit) {
  return matchesSuit(card, "s") ? (card as Season) : null
}

export function isWind(card: Card | Suit) {
  return matchesSuit(card, "w") ? (card as Wind) : null
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

export function isAnimal(card: Card | Suit) {
  return matchesSuit(card, "a") ? (card as Animal) : null
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
  if (material === "glass" || material === "bam") {
    return countFreedoms >= 1 && !isCovered
  }

  if (material === "bone" || material === "bronze") {
    const isFreeH = freedoms.left || freedoms.right
    return isFreeH && !isCovered
  }

  return countFreedoms >= 3 && !isCovered
}

export function getMaterial(tile: Tile, game?: Game) {
  if (game?.flowerOrSeason) return "bam"

  return tile.material
}

export function suitName(card: Card | Suit) {
  if (isFlower(card)) return "flower"
  if (isSeason(card)) return "season"
  if (isBam(card)) return "bamb"
  if (isCrack(card)) return "crack"
  if (isDot(card)) return "dot"
  if (isDragon(card)) return "dragon"
  if (isWind(card)) return "wind"
  if (isRabbit(card)) return "rabbit"
  if (isPhoenix(card)) return "phoenix"
  if (isAnimal(card)) return "animal"
  if (isJoker(card)) return "joker"
  if (isTransport(card)) return "transport"

  return "unknown"
}

export function cardName(card: Card) {
  if (isDragon(card)) {
    switch (getRank(card)) {
      case "f":
        return "bamb dragon"
      case "c":
        return "crack dragon"
      case "p":
        return "dot dragon"
    }
  }

  return `${suitName(card)} ${getRank(card)}`
}

export const materials = [
  "glass",
  "jade",
  "bone",
  "bronze",
  "gold",
  "bam",
] as const
export type Material = (typeof materials)[number]

const DRAGON_SUIT = { c: "c", f: "b", p: "o" } as const

function cardMatchesDragon(runCard: Card, card: Card) {
  const dragon = getRank(runCard) as keyof typeof DRAGON_SUIT
  const targetSuit = DRAGON_SUIT[dragon]

  if (isFlower(card) || isSeason(card)) return true
  if (targetSuit === getSuit(card)) return true
  if (dragon === getRank(card)) return true
  if (isAnimal(card) || isPhoenix(card)) return true

  return false
}

export function getDragonMultiplier(game: Game, card: Card) {
  const dragonRun = game.dragonRun
  if (!dragonRun) return 0

  if (cardMatchesDragon(dragonRun.card, card)) {
    return dragonRun.combo
  }

  return 0
}

export function getAnimalMultiplier(game: Game) {
  return game.animal ? 1 : 0
}

export function resolveDragons(game: Game, tile: Tile) {
  const dragonRun = game.dragonRun
  const newCard = tile.card
  const dragonCard = isDragon(newCard)

  if (!dragonRun) {
    if (dragonCard) {
      game.dragonRun = { card: dragonCard, combo: 0 }
    }

    return
  }

  if (!cardMatchesDragon(dragonRun.card, newCard)) {
    game.dragonRun = dragonCard ? { card: dragonCard, combo: 0 } : undefined
    return
  }

  dragonRun.combo += 1
}

export function resolveFlowersAndSeasons(game: Game, tile: Tile) {
  const flowerOrSeason = isFlower(tile.card) || isSeason(tile.card)
  game.flowerOrSeason = flowerOrSeason ?? undefined
}

export function resolveAnimals(game: Game, tile: Tile) {
  game.animal = isAnimal(tile.card) ?? undefined
}

export function resolveRabbits(game: Game, tile: Tile) {
  const now = Date.now()
  const lastRabbit = game.rabbit

  if (!lastRabbit) {
    if (isRabbit(tile.card)) {
      game.rabbit = { timestamp: now, combo: 0 }
    }

    return
  }

  if (now - lastRabbit.timestamp > FAST_SELECTION_THRESHOLD) {
    game.rabbit = undefined
    return
  }

  lastRabbit.timestamp = now
  lastRabbit.combo += 1
}

const PHOENIX_RANKS = {
  1: ["b", "c"],
  2: ["o", "b"],
  3: ["c", "o"],
} as const

// TODO: move away
export function resolvePhoenix(tileDb: TileDb, tile: Tile) {
  const phoenixCard = isPhoenix(tile.card)
  if (!phoenixCard) return

  const rank = getRank(phoenixCard)
  const [aSuit, bSuit] = PHOENIX_RANKS[rank]
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

export function getEmperors(run?: RunState) {
  if (!run) return []

  const names = new Set(
    run.items
      .filter((item) => item.type === "emperor")
      .map((item) => item.name),
  )
  if (!names.size) return []

  return EMPERORS.filter((emperor) => names.has(emperor.name))
}
