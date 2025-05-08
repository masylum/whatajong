import { play } from "@/components/audio"
import {
  DELETED_DURATION,
  MOVE_DURATION,
} from "@/components/game/tileComponent.css"
import type { Translator } from "@/i18n/useTranslation"
import type { Game } from "@/state/gameState"
import Rand from "rand-seed"
import { indexBy, isIncludedIn } from "remeda"
import { batch } from "solid-js"
import { Database } from "./in-memoriam"
import { RESPONSIVE_MAP } from "./maps/responsive"
import { resolveDragons } from "./resolveDragons"
import { resolveMutations } from "./resolveMutations"
import { resolvePhoenixRun } from "./resolvePhoenixes"
import { resolveWinds } from "./resolveWinds"
import { shuffleTiles } from "./shuffleTiles"

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

export function getMaterialPoints(material: Material) {
  switch (material) {
    case "topaz":
    case "quartz":
    case "garnet":
      return 1
    case "jade":
      return 2
    case "sapphire":
    case "obsidian":
    case "ruby":
      return 24
    case "emerald":
      return 48
    default:
      return 0
  }
}

function getElements(colors: Readonly<Color[]>, tileDb: TileDb) {
  const elements = colors.flatMap((rank) =>
    tileDb.filterBy({ deleted: false, cardId: `element${rank}` }),
  )

  return {
    visibleElements: elements.filter((tile) => !isCovered(tileDb, tile)).length,
    freeElements: elements.filter((tile) => isFree(tileDb, tile)).length,
  }
}

export function getTaijituMultiplier(tiles: readonly [Tile, Tile]) {
  const [tile1, tile2] = tiles
  if (tile1.z !== tile2.z) return 1
  if (!tiles.every((tile) => isTaijitu(tile.cardId))) return 1

  const xDistance = Math.abs(tile1.x - tile2.x)
  const yDistance = Math.abs(tile1.y - tile2.y)
  const isAdjacent =
    (xDistance === 2 && yDistance === 0) || (xDistance === 0 && yDistance === 2)

  return isAdjacent ? 3 : 1
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
  const { visibleElements, freeElements } = getElements(card.colors, tileDb)

  return (
    (rawPoints + visibleElements) *
    Math.max(1, dragonRunMultiplier + phoenixRunMultiplier + freeElements)
  )
}

export function getMaterialCoins(material: Material): number {
  switch (material) {
    case "garnet":
      return 1
    case "ruby":
      return 3
    default:
      return 0
  }
}

export function getCoins({ tile }: { tile: Tile }): number {
  const materialCoins = getMaterialCoins(tile.material)
  const rabbitCoins = isRabbit(tile.cardId) ? 1 : 0

  return materialCoins + rabbitCoins
}

function getRawPoints({
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

    const tiles: [Tile, Tile] = [tile, firstTile]

    if (cardsMatch(firstTile.cardId, tile.cardId)) {
      deleteTiles(tileDb, tiles)

      // Special cards
      resolveDragons({ game, tile })
      resolvePhoenixRun({ game, tile })
      resolveMutations({ tileDb, tile })
      resolveGems({ tile, game })
      resolveBlackMaterials({ tile, game })

      const taijituMultiplier = getTaijituMultiplier(tiles)

      for (const tile of tiles) {
        const newPoints = getPoints({ game, tile, tileDb }) * taijituMultiplier
        const newCoins = getCoins({ tile })
        tileDb.set(tile.id, { ...tile, points: newPoints, coins: newCoins })
        game.points += newPoints
        game.coins += newCoins
      }

      resolveJokers({ tileDb, tile, game })
      resolveWinds({ tileDb, tile })
    } else {
      resolveJumpingTiles({ tiles, tileDb })
    }

    const condition = gameOverCondition(tileDb, game)

    if (condition) {
      game.pause = true
      game.endCondition = condition
      return
    }
  })
}

export function cardsMatch(cardId1: CardId, cardId2: CardId) {
  if (isFlower(cardId1) && isFlower(cardId2)) {
    return true
  }

  return cardId1 === cardId2
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
    ...bams,
    ...cracks,
    ...cracks,
    ...dots,
    ...dots,
    ...winds,
    ...dragons,
    ...flowers,
    ...jokers,
    ...frogs,
    ...lotuses,
    ...sparrows,
    ...rabbits,
    ...phoenixes,
    ...elements,
    ...mutations,
    ...taijitu,
    ...gems,
    ...brushes,
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
  return checkSuit(cardId, "dragon")
}

export function isMutation(cardId: CardId) {
  return checkSuit(cardId, "mutation")
}

export function isFlower(cardId: CardId) {
  return checkSuit(cardId, "flower")
}

export function isWind(cardId: CardId) {
  return checkSuit(cardId, "wind")
}

export function isSuit(cardId: CardId) {
  return isBam(cardId) || isCrack(cardId) || isDot(cardId)
}

export function isBam(cardId: CardId) {
  return checkSuit(cardId, "bam")
}

export function isCrack(cardId: CardId) {
  return checkSuit(cardId, "crack")
}

export function isDot(cardId: CardId) {
  return checkSuit(cardId, "dot")
}

export function isRabbit(cardId: CardId) {
  return checkSuit(cardId, "rabbit")
}

export function isJoker(cardId: CardId) {
  return checkSuit(cardId, "joker")
}

export function isPhoenix(cardId: CardId) {
  return checkSuit(cardId, "phoenix")
}

export function isElement(cardId: CardId) {
  return checkSuit(cardId, "element")
}

export function isFrog(cardId: CardId) {
  return checkSuit(cardId, "frog")
}

export function isGem(cardId: CardId) {
  return checkSuit(cardId, "gem")
}

export function isSparrow(cardId: CardId) {
  return checkSuit(cardId, "sparrow")
}

function isLotus(cardId: CardId) {
  return checkSuit(cardId, "lotus")
}

export function isTaijitu(cardId: CardId) {
  return checkSuit(cardId, "taijitu")
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
  jumping?: boolean
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
  if (tile.deleted) return false
  if (isCovered(tileDb, tile)) return false

  const material = getMaterial(tile, game)
  if (material === "topaz" || material === "sapphire") return true

  const freedoms = getFreedoms(tileDb, tile)
  return freedoms.left || freedoms.right
}

export function getMaterial(tile: Tile, game?: Game): Material {
  // testing code:
  // const materialColors = {
  //   g: ["bone", "jade", "emerald"],
  //   r: ["bone", "ruby", "garnet"],
  //   b: ["bone", "sapphire", "topaz"],
  //   k: ["bone", "obsidian", "quartz"],
  // } as const
  // const materials = getCard(tile.cardId).colors.flatMap(
  //   (color) => materialColors[color],
  // )
  // return materials[Math.floor(Math.random() * materials.length)]!
  const temporaryMaterial = game?.temporaryMaterial
  if (!temporaryMaterial) {
    return tile.material
  }
  const color = MATERIAL_COLOR[temporaryMaterial].color
  const card = getCard(tile.cardId)
  if ([...card.colors].includes(color)) {
    return temporaryMaterial
  }
  return tile.material
}

export function cardName(t: Translator, cardId: CardId) {
  const colorCard = isDragon(cardId) || isRabbit(cardId) || isElement(cardId)

  if (colorCard) {
    return t.cardName[colorCard.suit]({ color: t.color[colorCard.rank]() })
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

  const gemCard = isGem(cardId)
  if (gemCard) {
    return t.cardName[gemCard.id]()
  }

  const card = getCard(cardId)
  return `${t.suit[card.suit]()} ${card.rank}`
}

export const materials = [
  "bone",
  "topaz",
  "sapphire",
  "garnet",
  "ruby",
  "jade",
  "emerald",
  "quartz",
  "obsidian",
] as const
export type Material = (typeof materials)[number]

function getDragonMultiplier(game: Game) {
  return game.dragonRun?.combo ?? 0
}

function getPhoenixRunMultiplier(game: Game) {
  return game.phoenixRun?.combo ?? 0
}

export function resolveJokers({
  tileDb,
  tile,
  game,
}: { tileDb: TileDb; tile: Tile; game: Game }) {
  const jokerCard = isJoker(tile.cardId)
  if (!jokerCard) return

  game.joker = true
  setTimeout(() => {
    const rng = new Rand()
    batch(() => {
      game.joker = false
      shuffleTiles({ rng, tileDb })
      play("tiles")
    })
  }, DELETED_DURATION + 100)
}

export function resolveGems({ tile, game }: { tile: Tile; game: Game }) {
  const gemCard = isGem(tile.cardId)
  if (!gemCard) {
    game.temporaryMaterial = undefined
    return
  }

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

export function resolveBlackMaterials({
  tile,
  game,
}: { tile: Tile; game: Game }) {
  game.pause = tile.material === "obsidian" || tile.material === "quartz"
}

export function cardMatchesColor(color: Color, cardId: CardId) {
  const colors = getCard(cardId).colors
  return isIncludedIn(color, colors)
}

function jump({
  fromTile,
  toPosition,
  tileDb,
}: { fromTile: Tile; toPosition: Position; tileDb: TileDb }) {
  // TODO: optimize and DRY
  const highestZ =
    tileDb.all.reduce((max, tile) => Math.max(max, tile.z), 0) + 1

  tileDb.set(fromTile.id, {
    ...fromTile,
    z: highestZ,
    jumping: true,
  })

  setTimeout(() => {
    tileDb.set(fromTile.id, {
      ...fromTile,
      ...toPosition,
      jumping: false,
    })
  }, MOVE_DURATION)
}

export function resolveJumpingTiles({
  tiles,
  tileDb,
}: { tiles: [Tile, Tile]; tileDb: TileDb }) {
  const [firstTile, tile] = tiles
  const frogCard = isFrog(firstTile.cardId)
  if (frogCard && cardMatchesColor(frogCard.colors[0], tile.cardId)) {
    const toPosition = { x: tile.x, y: tile.y, z: tile.z + 1 }
    jump({ fromTile: firstTile, toPosition, tileDb })
    return
  }

  const sparrowCard = isSparrow(firstTile.cardId)
  if (sparrowCard && cardMatchesColor(sparrowCard.colors[0], tile.cardId)) {
    const fromPosition = { x: firstTile.x, y: firstTile.y, z: firstTile.z }
    const toPosition = { x: tile.x, y: tile.y, z: tile.z }
    jump({ fromTile: firstTile, toPosition, tileDb })
    jump({ fromTile: tile, toPosition: fromPosition, tileDb })
    return
  }

  const lotusCard = isLotus(tile.cardId)
  if (lotusCard && cardMatchesColor(lotusCard.colors[0], firstTile.cardId)) {
    const toPosition = { x: tile.x, y: tile.y, z: tile.z + 1 }
    jump({ fromTile: firstTile, toPosition, tileDb })
    return
  }
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

export function isShiny(material: Material) {
  return (
    material === "obsidian" ||
    material === "sapphire" ||
    material === "emerald" ||
    material === "ruby"
  )
}

export function opacity(material: Material) {
  if (material === "bone") return 1

  return 0.5
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

const MATERIAL_COLOR = {
  topaz: { color: "b" },
  sapphire: { color: "b" },
  garnet: { color: "r" },
  ruby: { color: "r" },
  jade: { color: "g" },
  emerald: { color: "g" },
  quartz: { color: "k" },
  obsidian: { color: "k" },
} as const

export const bams = [
  { id: "bam1", suit: "bam", rank: "1", colors: ["g"], points: 1, level: 1 },
  { id: "bam2", suit: "bam", rank: "2", colors: ["g"], points: 1, level: 1 },
  { id: "bam3", suit: "bam", rank: "3", colors: ["g"], points: 1, level: 1 },
  { id: "bam4", suit: "bam", rank: "4", colors: ["g"], points: 1, level: 1 },
  { id: "bam5", suit: "bam", rank: "5", colors: ["g"], points: 1, level: 1 },
  { id: "bam6", suit: "bam", rank: "6", colors: ["g"], points: 1, level: 1 },
  { id: "bam7", suit: "bam", rank: "7", colors: ["g"], points: 1, level: 1 },
  { id: "bam8", suit: "bam", rank: "8", colors: ["g"], points: 1, level: 1 },
  { id: "bam9", suit: "bam", rank: "9", colors: ["g"], points: 1, level: 1 },
] as const
type BamCard = (typeof bams)[number]

// biome-ignore format:
export const cracks = [
  { id: "crack1", suit: "crack", rank: "1", colors: ["r"], points: 1, level: 1, },
  { id: "crack2", suit: "crack", rank: "2", colors: ["r"], points: 1, level: 1, },
  { id: "crack3", suit: "crack", rank: "3", colors: ["r"], points: 1, level: 1, },
  { id: "crack4", suit: "crack", rank: "4", colors: ["r"], points: 1, level: 1, },
  { id: "crack5", suit: "crack", rank: "5", colors: ["r"], points: 1, level: 1, },
  { id: "crack6", suit: "crack", rank: "6", colors: ["r"], points: 1, level: 1, },
  { id: "crack7", suit: "crack", rank: "7", colors: ["r"], points: 1, level: 1, },
  { id: "crack8", suit: "crack", rank: "8", colors: ["r"], points: 1, level: 1, },
  { id: "crack9", suit: "crack", rank: "9", colors: ["r"], points: 1, level: 1, },
] as const
type CrackCard = (typeof cracks)[number]

export const dots = [
  { id: "dot1", suit: "dot", rank: "1", colors: ["b"], points: 1, level: 1 },
  { id: "dot2", suit: "dot", rank: "2", colors: ["b"], points: 1, level: 1 },
  { id: "dot3", suit: "dot", rank: "3", colors: ["b"], points: 1, level: 1 },
  { id: "dot4", suit: "dot", rank: "4", colors: ["b"], points: 1, level: 1 },
  { id: "dot5", suit: "dot", rank: "5", colors: ["b"], points: 1, level: 1 },
  { id: "dot6", suit: "dot", rank: "6", colors: ["b"], points: 1, level: 1 },
  { id: "dot7", suit: "dot", rank: "7", colors: ["b"], points: 1, level: 1 },
  { id: "dot8", suit: "dot", rank: "8", colors: ["b"], points: 1, level: 1 },
  { id: "dot9", suit: "dot", rank: "9", colors: ["b"], points: 1, level: 1 },
] as const
type DotCard = (typeof dots)[number]

export const winds = [
  { id: "windn", suit: "wind", rank: "n", colors: ["k"], points: 3, level: 2 },
  { id: "windw", suit: "wind", rank: "w", colors: ["k"], points: 3, level: 2 },
  { id: "winds", suit: "wind", rank: "s", colors: ["k"], points: 3, level: 2 },
  { id: "winde", suit: "wind", rank: "e", colors: ["k"], points: 3, level: 2 },
] as const
type WindCard = (typeof winds)[number]

// biome-ignore format:
export const dragons = [
  { id: "dragonr", suit: "dragon", rank: "r", colors: ["r"], points: 2, level: 3, },
  { id: "dragong", suit: "dragon", rank: "g", colors: ["g"], points: 2, level: 3, },
  { id: "dragonb", suit: "dragon", rank: "b", colors: ["b"], points: 2, level: 3, },
  { id: "dragonk", suit: "dragon", rank: "k", colors: ["k"], points: 2, level: 3, },
] as const
type DragonCard = (typeof dragons)[number]

// biome-ignore format:
export const rabbits = [
  { id: "rabbitr", suit: "rabbit", rank: "r", colors: ["r"], points: 2, level: 5, },
  { id: "rabbitg", suit: "rabbit", rank: "g", colors: ["g"], points: 2, level: 5, },
  { id: "rabbitb", suit: "rabbit", rank: "b", colors: ["b"], points: 2, level: 5, },
] as const
type RabbitCard = (typeof rabbits)[number]

// biome-ignore format:
export const flowers = [
  { id: "flower1", suit: "flower", rank: "", colors: ["r", "g", "b"], points: 1, level: 6, },
  { id: "flower2", suit: "flower", rank: "", colors: ["r", "g", "b"], points: 1, level: 6, },
  { id: "flower3", suit: "flower", rank: "", colors: ["r", "g", "b"], points: 1, level: 6, },
] as const
type FlowerCard = (typeof flowers)[number]

// biome-ignore format:
const frogs = [
  { id: "frogr", suit: "frog", rank: "r", colors: ["r"], points: 2, level: 8 },
  { id: "frogb", suit: "frog", rank: "b", colors: ["b"], points: 2, level: 8 },
  { id: "frogg", suit: "frog", rank: "g", colors: ["g"], points: 2, level: 8 },
] as const
type FrogCard = (typeof frogs)[number]

// biome-ignore format:
export const lotuses = [
  { id: "lotusr", suit: "lotus", rank: "r", colors: ["r"], points: 2, level: 9 },
  { id: "lotusb", suit: "lotus", rank: "b", colors: ["b"], points: 2, level: 9 },
  { id: "lotusg", suit: "lotus", rank: "g", colors: ["g"], points: 2, level: 9 },
] as const
type LotusCard = (typeof lotuses)[number]

// biome-ignore format:
export const brushes = [
  { id: "brushr", suit: "brush", rank: "r", colors: ["r", "k"], points: 2, level: 9 },
  { id: "brushb", suit: "brush", rank: "b", colors: ["b", "k"], points: 2, level: 9 },
  { id: "brushg", suit: "brush", rank: "g", colors: ["g", "k"], points: 2, level: 9 },
] as const
type BrushCard = (typeof brushes)[number]

// biome-ignore format:
const phoenixes = [
  { id: "phoenix", suit: "phoenix", rank: "", colors: ["k"], points: 2, level: 11, },
] as const
type PhoenixCard = (typeof phoenixes)[number]

// biome-ignore format:
const taijitu = [
  { id: "taijitur", suit: "taijitu", rank: "r", colors: ["r"], points: 2, level: 12 },
  { id: "taijitug", suit: "taijitu", rank: "g", colors: ["g"], points: 2, level: 12 },
  { id: "taijitub", suit: "taijitu", rank: "b", colors: ["b"], points: 2, level: 12 },
  { id: "taijituk", suit: "taijitu", rank: "k", colors: ["k"], points: 2, level: 12 },
] as const
type TaijituCard = (typeof taijitu)[number]

// biome-ignore format:
export const sparrows = [
  { id: "sparrowr", suit: "sparrow", rank: "r", colors: ["r"], points: 2, level: 13 },
  { id: "sparrowb", suit: "sparrow", rank: "b", colors: ["b"], points: 2, level: 13 },
  { id: "sparrowg", suit: "sparrow", rank: "g", colors: ["g"], points: 2, level: 13 },
] as const
type SparrowCard = (typeof sparrows)[number]

// biome-ignore format:
const mutations = [
  { id: "mutation1", suit: "mutation", rank: "", colors: ["r", "g"], points: 2, level: 15 },
  { id: "mutation2", suit: "mutation", rank: "", colors: ["b", "r"], points: 2, level: 15 },
  { id: "mutation3", suit: "mutation", rank: "", colors: ["g", "b"], points: 2, level: 15 },
] as const
type MutationCard = (typeof mutations)[number]

// biome-ignore format:
const elements = [
  { id: "elementr", suit: "element", rank: "r", colors: ["r"], points: 3, level: 16, },
  { id: "elementg", suit: "element", rank: "g", colors: ["g"], points: 3, level: 16, },
  { id: "elementb", suit: "element", rank: "b", colors: ["b"], points: 3, level: 16, },
  { id: "elementk", suit: "element", rank: "k", colors: ["k"], points: 3, level: 16 },
] as const
type ElementCard = (typeof elements)[number]

// biome-ignore format:
const gems = [
  { id: "gemr", suit: "gem", rank: "r", colors: ["r"], points: 3, level: 18 },
  { id: "gemg", suit: "gem", rank: "g", colors: ["g"], points: 3, level: 18 },
  { id: "gemb", suit: "gem", rank: "b", colors: ["b"], points: 3, level: 18 },
  { id: "gemk", suit: "gem", rank: "k", colors: ["k"], points: 3, level: 18 },
] as const
type GemCard = (typeof gems)[number]

// biome-ignore format:
export const jokers = [
  { id: "joker", suit: "joker", rank: "", colors: ["g", "r", "b", "k"], points: 1, level: 19 },
] as const
type JokerCard = (typeof jokers)[number]

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
  | ElementCard
  | TaijituCard
  | FrogCard
  | GemCard
  | LotusCard
  | SparrowCard
  | BrushCard
export type CardId = Card["id"]
export type Suit = Card["suit"]

const CARDS_BY_ID = indexBy(getAllTiles(), (c) => c.id)
export function getCard(card: CardId) {
  return CARDS_BY_ID[card]!
}
