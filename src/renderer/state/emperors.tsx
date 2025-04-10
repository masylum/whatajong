import {
  getRank,
  isBam,
  isCrack,
  isDot,
  isDragon,
  isFlower,
  isPhoenix,
  isRabbit,
  isSeason,
  isWind,
  matchesSuit,
  toPairs,
  type Card,
  type Deck,
  type Level,
  type Material,
  type Suit,
  type Tile,
  type TileDb,
} from "@/lib/game"
import { shuffle } from "@/lib/rand"
import Rand from "rand-seed"
import { batch, createMemo } from "solid-js"
import { useGameState } from "./gameState"
import type { RunState } from "./runState"
import { useTranslation } from "@/i18n/useTranslation"
import { Description } from "@/components/description"
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
  | "skipper"
  | "captain"
  | "wizard"
  | "sorcerer"
  | "recruiter"
  | "jeweler"
  | "lapidarist"
  | "miner"

export type Emperor = {
  level: Level
  name: EmperorName
  suit?: Suit
  type?: "discard" | "tile"
  getCoins?: ({ tile }: { tile: Tile }) => number
  getRawPoints?: ({
    card,
    material,
  }: { card?: Card; material?: Material }) => number
  getRawMultiplier?: ({
    card,
    material,
  }: { card?: Card; material?: Material }) => number
  getDiscount?: ({ item }: { item: Item }) => number
  whenDiscarded?: ({
    run,
    deck,
    tiles,
  }: { run: RunState; deck: Deck; tiles: TileDb }) => void
}

export const EMPERORS: Emperor[] = [
  // 1-DONE
  {
    level: 1,
    name: "astronomer",
    suit: "c",
    type: "tile",
    getRawPoints({ card }) {
      return card && isCrack(card) ? 3 / 2 : 0
    },
  },
  // 2-DONE
  {
    level: 1,
    name: "mathematician",
    suit: "c",
    type: "tile",
    getRawMultiplier({ card }) {
      return card && isCrack(card) ? 1 / 2 : 0
    },
  },
  // 3-DONE
  {
    level: 1,
    name: "gardener",
    suit: "b",
    type: "tile",
    getRawPoints({ card }) {
      return card && isBam(card) ? 3 / 2 : 0
    },
  },
  // 4-DONE
  {
    level: 1,
    name: "herbolist",
    suit: "b",
    type: "tile",
    getRawMultiplier({ card }) {
      return card && isBam(card) ? 1 / 2 : 0
    },
  },
  // 5-DONE
  {
    level: 1,
    name: "wheelwright",
    suit: "o",
    type: "tile",
    getRawPoints({ card }) {
      return card && isDot(card) ? 3 / 2 : 0
    },
  },
  // 6-DONE
  {
    level: 1,
    name: "treasurer",
    suit: "o",
    type: "tile",
    getRawMultiplier({ card }) {
      return card && isDot(card) ? 1 / 2 : 0
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
    whenDiscarded({ deck, tiles }) {
      changeTilesPermanently({ from: "b", to: "o", deck, tiles })
    },
  },
  // 15-DONE
  {
    level: 1,
    name: "retailer",
    suit: "c",
    type: "discard",
    whenDiscarded({ deck, tiles }) {
      changeTilesPermanently({ from: "b", to: "c", deck, tiles })
    },
  },
  // 16-DONE
  {
    level: 1,
    name: "fisherwoman",
    suit: "c",
    type: "discard",
    whenDiscarded({ deck, tiles }) {
      changeTilesPermanently({ from: "o", to: "c", deck, tiles })
    },
  },
  // 17-DONE
  {
    level: 1,
    name: "shopkeeper",
    suit: "b",
    type: "discard",
    whenDiscarded({ deck, tiles }) {
      changeTilesPermanently({ from: "o", to: "b", deck, tiles })
    },
  },
  // 18-DONE
  {
    level: 1,
    name: "trader",
    suit: "b",
    type: "discard",
    whenDiscarded({ deck, tiles }) {
      changeTilesPermanently({ from: "c", to: "b", deck, tiles })
    },
  },
  // 19-DONE
  {
    level: 1,
    name: "fishmonger",
    suit: "o",
    type: "discard",
    whenDiscarded({ deck, tiles }) {
      changeTilesPermanently({ from: "c", to: "o", deck, tiles })
    },
  },
  // 20-DONE
  {
    level: 1,
    name: "martyr",
    type: "discard",
    whenDiscarded() {
      const game = useGameState()
      game.points = game.points + 300
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
      return card && (isFlower(card) || isSeason(card)) ? 1 / 2 : 0
    },
  },
  // 26-DONE
  {
    level: 2,
    name: "florist",
    getRawPoints({ card }) {
      return card && (isFlower(card) || isSeason(card)) ? 10 / 2 : 0
    },
  },
  // 27-DONE
  {
    level: 2,
    name: "botanist",
    getCoins({ tile }) {
      return isFlower(tile.card) || isSeason(tile.card) ? 4 / 2 : 0
    },
  },
  // 28-DONE
  {
    level: 2,
    name: "breeder",
    getRawMultiplier({ card }) {
      return card && isRabbit(card) ? 1 / 2 : 0
    },
  },
  // 29-DONE
  {
    level: 2,
    name: "veterinarian",
    getRawPoints({ card }) {
      return card && isRabbit(card) ? 10 / 2 : 0
    },
  },
  // 30-DONE
  {
    level: 2,
    name: "butcher",
    getCoins({ tile }) {
      return isRabbit(tile.card) ? 4 / 2 : 0
    },
  },
  // 31-DONE
  {
    level: 3,
    name: "drakologist",
    getRawPoints({ card }) {
      return card && isDragon(card) ? 16 / 2 : 0
    },
  },
  // 32-DONE
  {
    level: 3,
    name: "dragon_rider",
    getRawMultiplier({ card }) {
      return card && isDragon(card) ? 2 / 2 : 0
    },
  },
  // 33-DONE
  {
    level: 3,
    name: "warden",
    getCoins({ tile }) {
      return isDragon(tile.card) ? 6 / 2 : 0
    },
  },
  // 34-DONE
  {
    level: 3,
    name: "phoenixologist",
    getRawPoints({ card }) {
      return card && isPhoenix(card) ? 16 / 2 : 0
    },
  },
  // 35-DONE
  {
    level: 3,
    name: "phoenix_rider",
    getRawMultiplier({ card }) {
      return card && isPhoenix(card) ? 2 / 2 : 0
    },
  },
  // 36-DONE
  {
    level: 3,
    name: "keeper",
    getCoins({ tile }) {
      return isPhoenix(tile.card) ? 6 / 2 : 0
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
    getCoins({ tile }) {
      return tile.material === "ivory" ? 10 / 2 : 0
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
  // 41-DONE
  {
    level: 4,
    name: "sailor",
    getRawMultiplier({ card }) {
      return card && isWind(card) ? 3 / 2 : 0
    },
  },
  // 42-DONE
  {
    level: 4,
    name: "skipper",
    getRawPoints({ card }) {
      return card && isWind(card) ? 24 / 2 : 0
    },
  },
  // 43-DONE
  {
    level: 4,
    name: "captain",
    getCoins({ tile }) {
      return isWind(tile.card) ? 10 / 2 : 0
    },
  },
  // 44-DONE
  {
    level: 2,
    name: "wizard",
    getRawPoints({ card }) {
      if (!card) return 0
      const rank = Number.parseInt(getRank(card))
      if (Number.isNaN(rank)) return 0

      return rank % 2 === 1 ? 1 : 0
    },
  },
  // 45-DONE
  {
    level: 2,
    name: "sorcerer",
    getRawPoints({ card }) {
      if (!card) return 0
      const rank = Number.parseInt(getRank(card))
      if (Number.isNaN(rank)) return 0

      return rank % 2 === 0 ? 3 / 2 : 0
    },
  },
  // 46-NOT_IMPLEMENTED
  // {
  //   level: 2,
  //   name: "kamikaze",
  //   description: "+3 multiplier if only 1 move is available.",
  // },
  // 47-NOT_IMPLEMENTED
  // {
  //   level: 2,
  //   name: "prepper",
  //   description: "+30 points if less than 3 moves are available.",
  // },
  // 48-NOT_IMPLEMENTED
  // {
  //   level: 2,
  //   name: "investor",
  //   description: "+2 coins if more than 10 moves are available.",
  // },
  // 49-NOT_IMPLEMENTED
  // 50-DONE
  {
    level: 3,
    name: "jeweler",
    getRawPoints({ material }) {
      return material === "diamond" ? 100 / 2 : 0
    },
  },
  // 51-DONE
  {
    level: 3,
    name: "lapidarist",
    getCoins({ tile }) {
      return tile.material === "jade" ? 40 / 2 : 0
    },
  },
  // 52-DONE
  {
    level: 3,
    name: "miner",
    getRawMultiplier({ material }) {
      return material === "gold" ? 6 / 2 : 0
    },
  },
  // 53-PENDING
  // 54-PENDING
  // 55-PENDING
  // 56-PENDING
  // 57-PENDING
  // 58-PENDING
  // 59-PENDING
  // 60-PENDING
] as const

function changeTilesPermanently({
  from,
  to,
  deck,
  tiles,
}: { from: Suit; to: Suit; deck: Deck; tiles: TileDb }) {
  const fromTiles = tiles
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
        tiles.set(tile.id, {
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
