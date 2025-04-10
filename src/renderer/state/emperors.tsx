import { Description } from "@/components/description"
import { useTranslation } from "@/i18n/useTranslation"
import {
  type Card,
  type Deck,
  type Game,
  type Level,
  type Material,
  type Suit,
  type Tile,
  type TileDb,
  getAvailablePairs,
  getRank,
  isBam,
  isCrack,
  isDot,
  isDragon,
  isFlower,
  isJoker,
  isMutation,
  isPhoenix,
  isRabbit,
  isSeason,
  isSuit,
  isTransport,
  isWind,
  matchesSuit,
  toPairs,
} from "@/lib/game"
import { shuffle } from "@/lib/rand"
import Rand from "rand-seed"
import { batch, createMemo } from "solid-js"
import { useGameState } from "./gameState"
import type { RunState } from "./runState"
import type { Item } from "./shopState"

export type EmperorName =
  | "astronomer"
  | "mathematician"
  | "gardener"
  | "herbolist"
  | "wheelwright"
  | "treasurer"
  | "birdwatcher"
  | "caligrapher"
  | "numismatic"
  | "woodworker"
  | "librarian"
  | "cooper"
  | "barterer"
  | "food_vendor"
  | "retailer"
  | "fisherwoman"
  | "shopkeeper"
  | "trader"
  | "fishmonger"
  | "martyr"
  | "warrior"
  | "combatant"
  | "gambler"
  | "builder"
  | "biologist"
  | "florist"
  | "botanist"
  | "breeder"
  | "veterinarian"
  | "butcher"
  | "drakologist"
  | "dragon_rider"
  | "warden"
  | "phoenixologist"
  | "phoenix_rider"
  | "keeper"
  | "glassblower"
  | "stonemason"
  | "smith"
  | "sailor"
  | "wizard"
  | "sorcerer"
  | "recruiter"
  | "jeweler"
  | "lapidarist"
  | "miner"
  // new
  | "aerologist"
  | "climatologist"
  | "millwright"
  | "kamikaze"
  | "prepper"
  | "insurer"
  | "timekeeper"
  | "alchemist"
  | "meteorologist"
  | "buffon"
  | "clown"
  | "occultist"
  | "governor"
  | "horologist"

export type Emperor = {
  level: Level
  name: EmperorName
  suit?: Suit
  type?: "discard" | "tile"
  getCoins?: ({
    card,
    material,
    tileDb,
    game,
  }: { card: Card; material: Material; tileDb?: TileDb; game?: Game }) => number
  getRawPoints?: ({
    card,
    material,
    tileDb,
    game,
  }: {
    card: Card
    material: Material
    tileDb?: TileDb
    game?: Game
  }) => number
  getRawMultiplier?: ({
    card,
    material,
    tileDb,
    game,
  }: {
    card: Card
    material: Material
    tileDb?: TileDb
    game?: Game
  }) => number
  getDiscount?: ({ item }: { item: Item }) => number
  whenDiscarded?: ({
    run,
    deck,
    game,
    tileDb,
  }: { run: RunState; deck: Deck; game: Game; tileDb: TileDb }) => void
  whenMatched?: ({
    game,
    run,
    tileDb,
    tile,
  }: { game: Game; run: RunState; tileDb: TileDb; tile: Tile }) => void
}

export const EMPERORS: Emperor[] = [
  // 1-DONE
  {
    level: 1,
    name: "astronomer",
    suit: "c",
    type: "tile",
    getRawPoints({ card }) {
      return isCrack(card) ? 3 / 2 : 0
    },
  },
  // 2-DONE
  {
    level: 1,
    name: "mathematician",
    suit: "c",
    type: "tile",
    getRawMultiplier({ card }) {
      return isCrack(card) ? 1 / 2 : 0
    },
  },
  // 3-DONE
  {
    level: 1,
    name: "gardener",
    suit: "b",
    type: "tile",
    getRawPoints({ card }) {
      return isBam(card) ? 3 / 2 : 0
    },
  },
  // 4-DONE
  {
    level: 1,
    name: "herbolist",
    suit: "b",
    type: "tile",
    getRawMultiplier({ card }) {
      return isBam(card) ? 1 / 2 : 0
    },
  },
  // 5-DONE
  {
    level: 1,
    name: "wheelwright",
    suit: "o",
    type: "tile",
    getRawPoints({ card }) {
      return isDot(card) ? 3 / 2 : 0
    },
  },
  // 6-DONE
  {
    level: 1,
    name: "treasurer",
    suit: "o",
    type: "tile",
    getRawMultiplier({ card }) {
      return isDot(card) ? 1 / 2 : 0
    },
  },
  // 7-DONE
  {
    level: 1,
    name: "birdwatcher",
    suit: "b",
    type: "tile",
    getRawPoints({ card }) {
      return card === "b1" ? 10 : 0
    },
  },
  // 8-DONE
  {
    level: 1,
    name: "caligrapher",
    suit: "c",
    type: "tile",
    getRawPoints({ card }) {
      return card === "c1" ? 10 : 0
    },
  },
  // 9-DONE
  {
    level: 1,
    name: "numismatic",
    suit: "o",
    type: "tile",
    getRawPoints({ card }) {
      return card === "o1" ? 10 : 0
    },
  },
  // 10-DONE
  {
    level: 1,
    name: "woodworker",
    suit: "b",
    type: "tile",
    getDiscount({ item }) {
      return item.type === "tile" && isBam(item.card) ? 0.75 : 1
    },
  },
  // 11-DONE
  {
    level: 1,
    name: "librarian",
    suit: "c",
    type: "tile",
    getDiscount({ item }) {
      return item.type === "tile" && isCrack(item.card) ? 0.75 : 1
    },
  },
  // 12-DONE
  {
    level: 1,
    name: "cooper",
    suit: "o",
    type: "tile",
    getDiscount({ item }) {
      return item.type === "tile" && isDot(item.card) ? 0.75 : 1
    },
  },
  // 13-DONE
  {
    level: 1,
    name: "barterer",
    type: "discard",
    whenDiscarded({ run }) {
      run.money = run.money + 100
    },
  },
  // 14-DONE
  {
    level: 1,
    name: "food_vendor",
    suit: "o",
    type: "discard",
    whenDiscarded({ deck, tileDb }) {
      changeTilesPermanently({ from: "b", to: "o", deck, tileDb })
    },
  },
  // 15-DONE
  {
    level: 1,
    name: "retailer",
    suit: "c",
    type: "discard",
    whenDiscarded({ deck, tileDb }) {
      changeTilesPermanently({ from: "b", to: "c", deck, tileDb })
    },
  },
  // 16-DONE
  {
    level: 1,
    name: "fisherwoman",
    suit: "c",
    type: "discard",
    whenDiscarded({ deck, tileDb }) {
      changeTilesPermanently({ from: "o", to: "c", deck, tileDb })
    },
  },
  // 17-DONE
  {
    level: 1,
    name: "shopkeeper",
    suit: "b",
    type: "discard",
    whenDiscarded({ deck, tileDb }) {
      changeTilesPermanently({ from: "o", to: "b", deck, tileDb })
    },
  },
  // 18-DONE
  {
    level: 1,
    name: "trader",
    suit: "b",
    type: "discard",
    whenDiscarded({ deck, tileDb }) {
      changeTilesPermanently({ from: "c", to: "b", deck, tileDb })
    },
  },
  // 19-DONE
  {
    level: 1,
    name: "fishmonger",
    suit: "o",
    type: "discard",
    whenDiscarded({ deck, tileDb }) {
      changeTilesPermanently({ from: "c", to: "o", deck, tileDb })
    },
  },
  // 20-DONE
  {
    level: 1,
    name: "martyr",
    type: "discard",
    whenDiscarded() {
      const game = useGameState()
      game.points *= 2
    },
  },
  // 21-DONE
  {
    level: 2,
    name: "warrior",
    getRawPoints() {
      return 1
    },
  },
  // 22-DONE
  {
    level: 2,
    name: "combatant",
    getRawMultiplier() {
      return 1 / 4
    },
  },
  // 23-DONE
  {
    level: 2,
    name: "gambler",
    getDiscount({ item }) {
      return item.type === "reroll" ? 0.5 : 1
    },
  },
  // 24-DONE
  {
    level: 2,
    name: "builder",
    getDiscount({ item }) {
      return item.type === "upgrade" ? 0.75 : 1
    },
  },
  // 25-DONE
  {
    level: 2,
    name: "biologist",
    getRawMultiplier({ card }) {
      return isFlower(card) || isSeason(card) ? 1 / 2 : 0
    },
  },
  // 26-DONE
  {
    level: 2,
    name: "florist",
    getRawPoints({ card }) {
      return isFlower(card) || isSeason(card) ? 10 / 2 : 0
    },
  },
  // 27-DONE
  {
    level: 2,
    name: "botanist",
    getCoins({ card }) {
      return isFlower(card) || isSeason(card) ? 4 / 2 : 0
    },
  },
  // 28-DONE
  {
    level: 2,
    name: "breeder",
    getRawMultiplier({ card }) {
      return isRabbit(card) ? 1 / 2 : 0
    },
  },
  // 29-DONE
  {
    level: 2,
    name: "veterinarian",
    getRawPoints({ card }) {
      return isRabbit(card) ? 10 / 2 : 0
    },
  },
  // 30-DONE
  {
    level: 2,
    name: "butcher",
    getCoins({ card }) {
      return isRabbit(card) ? 4 / 2 : 0
    },
  },
  // 31-DONE
  {
    level: 3,
    name: "drakologist",
    getRawPoints({ card }) {
      return isDragon(card) ? 16 / 2 : 0
    },
  },
  // 32-DONE
  {
    level: 3,
    name: "dragon_rider",
    getRawMultiplier({ card }) {
      return isDragon(card) ? 2 / 2 : 0
    },
  },
  // 33-DONE
  {
    level: 3,
    name: "warden",
    getCoins({ card }) {
      return isDragon(card) ? 6 / 2 : 0
    },
  },
  // 34-DONE
  {
    level: 3,
    name: "phoenixologist",
    getRawPoints({ card }) {
      return isPhoenix(card) ? 16 / 2 : 0
    },
  },
  // 35-DONE
  {
    level: 3,
    name: "phoenix_rider",
    getRawMultiplier({ card }) {
      return isPhoenix(card) ? 2 / 2 : 0
    },
  },
  // 36-DONE
  {
    level: 3,
    name: "keeper",
    getCoins({ card }) {
      return isPhoenix(card) ? 6 / 2 : 0
    },
  },
  // 37-DONE
  {
    level: 3,
    name: "glassblower",
    getRawPoints({ material }) {
      return material === "glass" ? 20 / 2 : 0
    },
  },
  // 38-DONE
  {
    level: 3,
    name: "stonemason",
    getCoins({ material }) {
      return material === "ivory" ? 10 / 2 : 0
    },
  },
  // 39-DONE
  {
    level: 3,
    name: "smith",
    getRawMultiplier({ material }) {
      return material === "bronze" ? 2 / 2 : 0
    },
  },
  // 40-DONE
  {
    level: 2,
    name: "recruiter",
    getDiscount({ item }) {
      return item.type === "emperor" ? 2 / 3 : 1
    },
  },
  // 41-PENDING
  {
    level: 4,
    name: "climatologist",
    getRawMultiplier({ card }) {
      return isWind(card) ? 3 / 2 : 0
    },
  },
  // 42-DONE
  {
    level: 4,
    name: "millwright",
    getRawPoints({ card }) {
      return isWind(card) ? 24 / 2 : 0
    },
  },
  // 43-PENDING
  {
    level: 4,
    name: "aerologist",
    getCoins({ card }) {
      return isWind(card) ? 10 / 2 : 0
    },
  },
  // 44-DONE
  {
    level: 4,
    name: "wizard",
    getRawPoints({ card }) {
      const rank = Number.parseInt(getRank(card))
      if (Number.isNaN(rank)) return 0

      return rank % 2 === 1 ? 6 / 2 : 0
    },
  },
  // 45-DONE
  {
    level: 4,
    name: "sorcerer",
    getRawPoints({ card }) {
      const rank = Number.parseInt(getRank(card))
      if (Number.isNaN(rank)) return 0

      return rank % 2 === 0 ? 8 / 2 : 0
    },
  },
  // 46-PENDING
  {
    level: 4,
    name: "kamikaze",
    getRawMultiplier({ tileDb, game }) {
      if (!tileDb || !game) return 0
      const pairs = getAvailablePairs(tileDb, game)
      if (pairs.length === 1) {
        return 3 / 2
      }

      return 0
    },
  },
  // 47-PENDING
  {
    level: 4,
    name: "prepper",
    getRawPoints({ tileDb, game }) {
      if (!tileDb || !game) return 0
      const pairs = getAvailablePairs(tileDb, game)
      if (pairs.length < 3) {
        return 10 / 2
      }
      return 0
    },
  },
  // 48-PENDING
  {
    level: 4,
    name: "insurer",
    getCoins({ tileDb, game }) {
      if (!tileDb || !game) return 0
      const pairs = getAvailablePairs(tileDb, game)
      if (pairs.length > 10) {
        return 2 / 2
      }

      return 0
    },
  },
  // 49-PENDING
  {
    level: 4,
    name: "horologist",
    whenMatched({ game }) {
      if (!game.startedAt) return

      const time = Math.min(game.startedAt + 2 * 1000, Date.now())
      game.startedAt = time
    },
  },
  // 50-PENDING
  {
    level: 4,
    name: "timekeeper",
    whenDiscarded({ game }) {
      game.startedAt = Date.now()
    },
  },
  // 51-DONE
  {
    level: 5,
    name: "jeweler",
    getRawPoints({ material }) {
      return material === "diamond" ? 100 / 2 : 0
    },
  },
  // 52-DONE
  {
    level: 5,
    name: "lapidarist",
    getCoins({ material }) {
      return material === "jade" ? 40 / 2 : 0
    },
  },
  // 53-DONE
  {
    level: 5,
    name: "miner",
    getRawMultiplier({ material }) {
      return material === "gold" ? 6 / 2 : 0
    },
  },
  // 54-PENDING
  {
    level: 5,
    name: "alchemist",
    whenMatched({ game, tile }) {
      if (isMutation(tile.card)) {
        game.temporaryMaterial = "gold"
      }
    },
  },
  // 55-PENDING
  {
    level: 5,
    name: "meteorologist",
    whenMatched({ game, tile }) {
      if (isWind(tile.card)) {
        game.temporaryMaterial = "diamond"
      }
    },
  },
  // 56-PENDING
  {
    level: 5,
    name: "clown",
    whenMatched({ game, tile }) {
      if (isJoker(tile.card)) {
        game.temporaryMaterial = "jade"
      }
    },
  },
  // 57-PENDING
  {
    level: 5,
    name: "sailor",
    whenMatched({ tile, tileDb }) {
      if (isTransport(tile.card)) {
        for (const tile of tileDb.filterBy({ deleted: false })) {
          tile.material = "glass"
        }
      }
    },
  },
  // 58-PENDING
  {
    level: 5,
    name: "occultist",
    getRawPoints({ card }) {
      return !isSuit(card) ? 30 / 2 : 0
    },
  },
  // 59-PENDING
  {
    level: 5,
    name: "governor",
    getRawPoints({ card }) {
      return isSuit(card) ? 10 / 2 : 0
    },
  },
  // 60-PENDING
  {
    level: 5,
    name: "buffon",
    getRawMultiplier({ tileDb, game, card }) {
      if (!tileDb || !game) return 0
      if (isJoker(card)) {
        return getAvailablePairs(tileDb, game).length / 2
      }

      return 0
    },
  },
] as const

function changeTilesPermanently({
  from,
  to,
  deck,
  tileDb,
}: { from: Suit; to: Suit; deck: Deck; tileDb: TileDb }) {
  const fromTiles = tileDb
    .filterBy({ deleted: false })
    .filter((tile) => matchesSuit(tile.card, from))
  const rng = new Rand()
  const pairs = toPairs(fromTiles)
  const threePairs = shuffle(pairs, rng).slice(0, 3)

  batch(() => {
    for (const pair of threePairs) {
      for (const tile of pair) {
        const oldCard = tile.card
        const newCard = oldCard.replace(from, to) as Card
        tileDb.set(tile.id, {
          ...tile,
          card: newCard,
        })

        const deckTile = deck.findBy({ card: oldCard })
        if (deckTile) {
          deck.set(deckTile.id, {
            ...deckTile,
            card: newCard,
          })
        }
      }
    }
  })
}

export function EmperorTitle(props: { name: EmperorName }) {
  const t = useTranslation()
  return t.emperors[props.name].name()
}

export function EmperorDescription(props: { name: EmperorName }) {
  const t = useTranslation()
  const description = createMemo(() => t.emperors[props.name].description())

  return <Description str={description()} />
}
