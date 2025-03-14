import { resolveWinds } from "./winds"
import { batch } from "solid-js"
import { nanoid } from "nanoid"
import { initDatabase, type Database } from "./in-memoriam"
import { PROGRESSIVE_MAP } from "./maps/progressive"
import type { RunState } from "@/state/runState"
import { EMPERORS } from "@/state/emperors"
import { sumBy } from "remeda"

export const WIN_CONDITIONS = ["empty-board", "no-pairs"] as const
export type WinCondition = (typeof WIN_CONDITIONS)[number]

export type Game = {
  startedAt?: number
  endedAt?: number
  points: number
  endCondition?: WinCondition
}

export function gameOverCondition(tileDb: TileDb, powerupsDb: PowerupDb) {
  const tilesAlive = tileDb.filterBy({ deleted: false })
  if (tilesAlive.length === 0) {
    return "empty-board"
  }

  const availablePairs = getAvailablePairs(tileDb, powerupsDb)
  if (availablePairs.length === 0) {
    return "no-pairs"
  }

  return null
}

export function getAvailablePairs(
  tileDb: TileDb,
  powerupsDb?: PowerupDb,
): [Tile, Tile][] {
  const freeTiles = getFreeTiles(tileDb, powerupsDb)
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
  if (isDragon(card)) return 2
  if (isFlower(card)) return 4
  if (isSeason(card)) return 4
  if (isWind(card)) return 8

  return 1
}

export function getMaterialPoints(material: Material) {
  switch (material) {
    case "glass":
      return 1
    case "jade":
      return 3
    case "bronze":
      return 2
    case "gold":
      return 8
    default:
      return 0
  }
}

export function getMaterialMultiplier(material: Material) {
  switch (material) {
    case "bronze":
      return 1
    case "jade":
      return 2
    case "gold":
      return 3
    default:
      return 0
  }
}

export function getPoints({
  powerupsDb,
  run,
  tiles,
}: { powerupsDb: PowerupDb; run?: RunState; tiles: Tile[] }) {
  let points = 0
  let multiplier = 1

  for (const tile of tiles) {
    points += getRawPoints({ card: tile.card, material: tile.material, run })
    multiplier += getRawMultiplier({
      powerupsDb,
      card: tile.card,
      material: tile.material,
      run,
    })
  }

  return points * multiplier
}

export function getCoins(material: Material): number {
  switch (material) {
    case "bronze":
      return 1
    case "gold":
      return 5
    default:
      return 0
  }
}

export function getRawPoints({
  card,
  run,
  material,
}: { card: Card; run?: RunState; material: Material }) {
  const cardPoints = getCardPoints(card)
  const materialPoints = getMaterialPoints(material)
  const emperorPoints = sumBy(
    getEmperors(run),
    (emperor) => emperor.getRawPoints?.({ card, material }) ?? 0,
  )

  return cardPoints + materialPoints + emperorPoints
}

export function getRawMultiplier({
  powerupsDb,
  card,
  material,
  run,
}: {
  powerupsDb?: PowerupDb
  card?: Card
  material?: Material
  run?: RunState
}) {
  let materialMultiplier = 0
  let dragonRunMultiplier = 0

  if (material) {
    materialMultiplier = getMaterialMultiplier(material)
  }

  if (powerupsDb && card) {
    dragonRunMultiplier = getDragonMultiplier(powerupsDb, card)
  }

  const emperorMultiplier = sumBy(
    getEmperors(run),
    (emperor) => emperor.getRawMultiplier?.({ card, material }) ?? 0,
  )

  return materialMultiplier + dragonRunMultiplier + emperorMultiplier
}

export function getFreeTiles(tileDb: TileDb, powerupsDb?: PowerupDb): Tile[] {
  return tileDb.all.filter(
    (tile) => !tile.deleted && isFree(tileDb, tile, powerupsDb),
  )
}

export function selectTile({
  tileDb,
  powerupsDb,
  run,
  game,
  tileId,
}: {
  tileDb: TileDb
  powerupsDb: PowerupDb
  run?: RunState
  game: Game
  tileId: string
}) {
  batch(() => {
    const tile = tileDb.get(tileId)
    if (!tile) throw new Error("Tile not found")

    if (!isFree(tileDb, tile, powerupsDb)) {
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
      const newPoints = getPoints({
        powerupsDb,
        run,
        tiles: [tile, firstTile],
      })
      deleteTiles(tileDb, [tile, firstTile])
      resolveWinds(tileDb, powerupsDb, tile)
      getPowerups(powerupsDb, tile)

      const points = game.points + newPoints
      game.points = points
      tileDb.set(tile.id, { ...tile, points: newPoints })
    }

    const condition = gameOverCondition(tileDb, powerupsDb)

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

const suits = ["b", "c", "o", "d", "w", "f", "s"] as const
export type Suit = (typeof suits)[number]

// biome-ignore format:
export const bamboo = [ "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9" ] as const
// biome-ignore format:
export const character = [ "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9" ] as const
// biome-ignore format:
export const circle = [ "o1", "o2", "o3", "o4", "o5", "o6", "o7", "o8", "o9" ] as const
export const winds = ["wn", "ww", "ws", "we"] as const
export const flowers = ["f1", "f2", "f3", "f4"] as const
export const seasons = ["s1", "s2", "s3", "s4"] as const
export const dragons = ["dc", "df", "dp"] as const
const dummy = ["d1"] as const

export type Bamboo = (typeof bamboo)[number]
export type Character = (typeof character)[number]
export type Circle = (typeof circle)[number]
export type Winds = (typeof winds)[number]
export type Flowers = (typeof flowers)[number]
export type Seasons = (typeof seasons)[number]
export type Dragons = (typeof dragons)[number]
export type Dummy = (typeof dummy)[number]
export type Card =
  | Bamboo
  | Character
  | Circle
  | Winds
  | Flowers
  | Seasons
  | Dragons
  | Dummy
export type Joker = Flowers | Seasons
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
  const regularTiles = [
    ...bamboo,
    ...character,
    ...circle,
    ...winds,
    ...dragons,
  ]

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
  const regularTiles = [
    ...bamboo,
    ...character,
    ...circle,
    ...winds,
    ...dragons,
  ]

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

  const suit1 = getSuit(card1)
  const suit2 = getSuit(card2)
  if (suit1 === "f" && suit2 === "f") return true
  if (suit1 === "s" && suit2 === "s") return true

  return false
}

export function isDragon(card: Card | Suit) {
  return matchesSuit(card, "d") ? (card as Dragons) : null
}

export function isFlower(card: Card | Suit) {
  return matchesSuit(card, "f") ? (card as Flowers) : null
}

export function isSeason(card: Card | Suit) {
  return matchesSuit(card, "s") ? (card as Seasons) : null
}

export function isJoker(card: Card | Suit) {
  return isFlower(card) || isSeason(card)
}
export function isWind(card: Card | Suit) {
  return matchesSuit(card, "w") ? (card as Winds) : null
}

export function isBamboo(card: Card | Suit) {
  return matchesSuit(card, "b") ? (card as Bamboo) : null
}

export function isCharacter(card: Card | Suit) {
  return matchesSuit(card, "c") ? (card as Character) : null
}

export function isCircle(card: Card | Suit) {
  return matchesSuit(card, "o") ? (card as Circle) : null
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

export function isFree(tileDb: TileDb, tile: Tile, powerupsDb?: PowerupDb) {
  const isCovered = overlaps(tileDb, tile, 1)
  const freedoms = getFreedoms(tileDb, tile)
  const countFreedoms = Object.values(freedoms).filter((v) => v).length
  const material = getMaterial(tile, powerupsDb)

  if (material === "jade") return !isCovered
  if (material === "glass") {
    return countFreedoms >= 1 && !isCovered
  }

  if (material === "bone") {
    const isFreeH = freedoms.left || freedoms.right
    return isFreeH && !isCovered
  }

  if (material === "bronze") {
    return countFreedoms >= 2 && !isCovered
  }

  return countFreedoms >= 3 && !isCovered
}

export function getMaterial(tile: Tile, powerupsDb?: PowerupDb) {
  if (powerupsDb) {
    const flower = powerupsDb.all.find((p) => isFlower(p.card))
    if (flower) return "glass"

    const season = powerupsDb.all.find((p) => isSeason(p.card))
    if (season) return "bronze"
  }

  return tile.material
}

export function suitName(card: Card | Suit) {
  if (isFlower(card)) return "flower"
  if (isSeason(card)) return "season"
  if (isBamboo(card)) return "bamb"
  if (isCharacter(card)) return "crack"
  if (isCircle(card)) return "dot"
  if (isDragon(card)) return "dragon"
  if (isWind(card)) return "wind"

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

export const materials = ["glass", "jade", "bone", "bronze", "gold"] as const
export type Material = (typeof materials)[number]

export type Powerup = {
  id: string
  combo: number
  card: Dragons | Flowers | Seasons
}
export type PowerupById = Record<string, Powerup>
export const powerupIndexes = [] as const
export type PowerupIndexes = (typeof powerupIndexes)[number]
export type PowerupDb = Database<Powerup, PowerupIndexes>

const DRAGON_SUIT = { c: "c", f: "b", p: "o" } as const

export function initPowerupsDb(powerups: PowerupById): PowerupDb {
  return initDatabase({ indexes: powerupIndexes }, powerups)
}

export function getJokerPowerup(powerupsDb: PowerupDb) {
  return powerupsDb.all.find((p) => isFlower(p.card) || isSeason(p.card))
}

function powerupMatchesSuit(powerup: Powerup, card: Card) {
  const dragon = getRank(powerup.card) as keyof typeof DRAGON_SUIT
  const targetSuit = DRAGON_SUIT[dragon]

  return targetSuit === getSuit(card) || isFlower(card) || isSeason(card)
}

export function getDragonMultiplier(powerupsDb: PowerupDb, card: Card) {
  const dragonPowerup = powerupsDb.all.find((p) => isDragon(p.card))
  if (!dragonPowerup) return 0

  if (powerupMatchesSuit(dragonPowerup, card)) {
    return dragonPowerup.combo
  }

  return 0
}

export function getPowerups(powerupsDb: PowerupDb, tile: Tile) {
  const dragonPowerup = powerupsDb.all.find((p) => isDragon(p.card))
  const jokerPowerup = getJokerPowerup(powerupsDb)
  const newCard = tile.card
  const dragonCard = isDragon(newCard)
  const jokerCard = isJoker(newCard)

  function removeAllPowerups() {
    for (const powerup of powerupsDb.all) {
      powerupsDb.del(powerup.id)
    }
  }

  if (dragonCard) {
    removeAllPowerups()
    const id = "dragon"
    powerupsDb.set(id, { id, card: dragonCard, combo: 0 })
    return
  }

  if (jokerCard) {
    const id = "joker"
    if (dragonPowerup) {
      powerupsDb.set(dragonPowerup.id, {
        ...dragonPowerup,
        combo: dragonPowerup.combo + 1,
      })
      powerupsDb.set(id, { id, card: jokerCard, combo: 0 })
    } else {
      removeAllPowerups()
      powerupsDb.set(id, { id, card: jokerCard, combo: 0 })
    }
    return
  }

  if (dragonPowerup) {
    if (powerupMatchesSuit(dragonPowerup, newCard)) {
      powerupsDb.set(dragonPowerup.id, {
        ...dragonPowerup,
        combo: dragonPowerup.combo + 1,
      })

      if (jokerPowerup) {
        powerupsDb.del(jokerPowerup.id)
      }
    } else {
      removeAllPowerups()
    }
  } else if (jokerPowerup) {
    removeAllPowerups()
  }
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
