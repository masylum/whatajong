import {
  getRank,
  isBam,
  isCrack,
  isDot,
  isDragon,
  isFlower,
  isPhoenix,
  isRabbit,
  isWind,
  matchesSuit,
  type Card,
  type Material,
  type Suit,
  type Tile,
} from "@/lib/game"
import { shuffle } from "@/lib/rand"
import Rand from "rand-seed"
import { useDeckState } from "./deckState"
import { useRunState } from "./runState"
import { useTileState } from "./tileState"
import { batch, type JSXElement } from "solid-js"
import { useGameState } from "./gameState"
import { MiniTiles } from "@/components/miniTiles"
import { MiniTile } from "@/components/miniTile"

export type Emperor = {
  level: number
  name: string
  description: JSXElement
  getCoins?: ({ tile }: { tile: Tile }) => number
  getRawPoints?: ({
    card,
    material,
  }: { card?: Card; material?: Material }) => number
  getRawMultiplier?: ({
    card,
    material,
  }: { card?: Card; material?: Material }) => number
  whenDiscarded?: () => void
}

// TODO: index them by name
export function getEmperors(): Emperor[] {
  return [
    // Starting value: 3 * 9 = 27 points
    // 1-DONE
    {
      level: 1,
      name: "astronomer",
      description: (
        <>
          +3 points when matching crack tiles (<MiniTiles suit="c" />)
        </>
      ),
      getRawPoints({ card }) {
        return card && isCrack(card) ? 3 / 2 : 0
      },
    },
    // Starting value: 2 * 9 = 18 points
    // 2-DONE
    {
      level: 1,
      name: "mathematician",
      description: (
        <>
          +1 mult when matching crack tiles (<MiniTiles suit="c" />)
        </>
      ),
      getRawMultiplier({ card }) {
        return card && isCrack(card) ? 1 / 2 : 0
      },
    },
    // Starting value: 3 * 9 = 27 points
    // 3-DONE
    {
      level: 1,
      name: "gardener",
      description: (
        <>
          +3 points when matching bam tiles (<MiniTiles suit="b" />)
        </>
      ),
      getRawPoints({ card }) {
        return card && isBam(card) ? 3 / 2 : 0
      },
    },
    // Starting value: 2 * 9 = 18 points
    // 4-DONE
    {
      level: 1,
      name: "herbolist",
      description: (
        <>
          +1 mult when matching bam tiles (<MiniTiles suit="b" />)
        </>
      ),
      getRawMultiplier({ card }) {
        return card && isBam(card) ? 1 / 2 : 0
      },
    },
    // Starting value: 3 * 9 = 27 points
    // 5-DONE
    {
      level: 1,
      name: "wheelwright",
      description: (
        <>
          +3 points when matching dot tiles (<MiniTiles suit="o" />)
        </>
      ),
      getRawPoints({ card }) {
        return card && isDot(card) ? 3 / 2 : 0
      },
    },
    // Starting value: 2 * 9 = 18 points
    // 6-DONE
    {
      level: 1,
      name: "treasurer",
      description: (
        <>
          +1 mult when matching dot tiles (<MiniTiles suit="o" />)
        </>
      ),
      getRawMultiplier({ card }) {
        return card && isDot(card) ? 1 / 2 : 0
      },
    },
    // Starting value: 20 = 20 points
    // 7-DONE
    {
      level: 1,
      name: "birdwatcher",
      description: (
        <>
          +20 points when matching the tile "bam 1" (<MiniTile card="b1" />)
          tile
        </>
      ),
      getRawPoints({ card }) {
        return card === "b1" ? 10 : 0
      },
    },
    // Starting value: 20 = 20 points
    // 8-DONE
    {
      level: 1,
      name: "caligrapher",
      description: (
        <>
          +20 points when matching the tile "crack 1" ( <MiniTile card="c1" />)
          tile
        </>
      ),
      getRawPoints({ card }) {
        return card === "c1" ? 10 : 0
      },
    },
    // Starting value: 20 = 20 points
    // 9-DONE
    {
      level: 1,
      name: "numismatic",
      description: (
        <>
          +20 points when matching the tile "dot 1" (<MiniTile card="o1" />)
        </>
      ),
      getRawPoints({ card }) {
        return card === "o1" ? 10 : 0
      },
    },
    // Starting value: 20 = 20 points
    // 10-DONE
    {
      level: 1,
      name: "woodworker",
      description: (
        <>
          +20 points when matching the tile "bam 9" (<MiniTile card="b9" />)
        </>
      ),
      getRawPoints({ card }) {
        return card === "b9" ? 10 : 0
      },
    },
    // Starting value: 20 = 20 points
    // 11-DONE
    {
      level: 1,
      name: "librarian",
      description: (
        <>
          +20 points when matching the tile "crack 9" (<MiniTile card="c9" />)
        </>
      ),
      getRawPoints({ card }) {
        return card === "c9" ? 10 : 0
      },
    },
    // Starting value: 20 = 20 points
    // 12-DONE
    {
      level: 1,
      name: "cooper",
      description: (
        <>
          +20 points when matching the tile "dot 9" (<MiniTile card="o9" />)
        </>
      ),
      getRawPoints({ card }) {
        return card === "o9" ? 10 : 0
      },
    },
    // 13-DONE
    {
      level: 1,
      name: "barterer",
      description: <>When discarded, get 100 coins</>,
      whenDiscarded() {
        const run = useRunState()
        run.money = run.money + 100
      },
    },
    // 14-DONE
    {
      level: 1,
      name: "food_vendor",
      description: (
        <>
          When discarded, permanently change 3 random bam tiles (
          <MiniTiles suit="b" />) to dot tiles (<MiniTiles suit="o" />) from the
          board and your deck
        </>
      ),
      whenDiscarded() {
        changeTilesPermanently("b", "o")
      },
    },
    // 15-DONE
    {
      level: 1,
      name: "retailer",
      description: (
        <>
          When discarded, permanently change 3 random bam tiles (
          <MiniTiles suit="b" />) to crack tiles (<MiniTiles suit="c" />) from
          the board and your deck
        </>
      ),
      whenDiscarded() {
        changeTilesPermanently("b", "c")
      },
    },
    // 16-DONE
    {
      level: 1,
      name: "fisherwoman",
      description: (
        <>
          When discarded, permanently change 3 random dot tiles (
          <MiniTiles suit="o" />) to crack tiles (<MiniTiles suit="c" />) from
          the board and your deck
        </>
      ),
      whenDiscarded() {
        changeTilesPermanently("o", "c")
      },
    },
    // 17-DONE
    {
      level: 1,
      name: "shopkeeper",
      description: (
        <>
          When discarded, permanently change 3 random dot tiles (
          <MiniTiles suit="o" />) to bam tiles (<MiniTiles suit="b" />) from the
          board and your deck
        </>
      ),
      whenDiscarded() {
        changeTilesPermanently("o", "b")
      },
    },
    // 18-DONE
    {
      level: 1,
      name: "trader",
      description: (
        <>
          When discarded, permanently change 3 random crack tiles (
          <MiniTiles suit="c" />) to bam tiles (<MiniTiles suit="b" />) from the
          board and your deck
        </>
      ),
      whenDiscarded() {
        changeTilesPermanently("c", "b")
      },
    },
    // 19-DONE
    {
      level: 1,
      name: "fishmonger",
      description: (
        <>
          When discarded, permanently change 3 random crack tiles (
          <MiniTiles suit="c" />) to dot tiles (<MiniTiles suit="o" />) from the
          board and your deck
        </>
      ),
      whenDiscarded() {
        changeTilesPermanently("c", "o")
      },
    },
    // 20-DONE
    {
      level: 1,
      name: "martyr",
      description: <>+300 points when discarded</>,
      whenDiscarded() {
        const game = useGameState()
        game.points = game.points + 300
      },
    },
    // Starting value: 1 * 34 = 34 points
    // 21-DONE
    {
      level: 2,
      name: "warrior",
      description: <>+2 points when matching any tiles</>,
      getRawPoints() {
        return 1
      },
    },
    // Starting value: 0.5 * 34 = 17 points
    // 22-DONE
    {
      level: 2,
      name: "combatant",
      description: <>+0.5 mult when matching any tiles</>,
      getRawMultiplier() {
        return 1 / 4
      },
    },
    // Starting value: 2 * 5 * 3 = 30 points
    // 23-DONE
    {
      level: 2,
      name: "wizard",
      description: <>+2 points when matching odd tiles.</>,
      getRawPoints({ card }) {
        if (!card) return 0
        const rank = Number.parseInt(getRank(card))
        if (Number.isNaN(rank)) return 0

        return rank % 2 === 1 ? 1 : 0
      },
    },
    // Starting value: 3 * 4 * 3 = 36 points
    // 24-DONE
    {
      level: 2,
      name: "sorcerer",
      description: <>+2 points when matching even tiles.</>,
      getRawPoints({ card }) {
        if (!card) return 0
        const rank = Number.parseInt(getRank(card))
        if (Number.isNaN(rank)) return 0

        return rank % 2 === 0 ? 3 / 2 : 0
      },
    },
    // 25-DONE
    {
      level: 2,
      name: "biologist",
      description: (
        <>
          +1 mult when matching flower tiles (<MiniTiles suit="f" />
          <MiniTiles suit="s" />)
        </>
      ),
      getRawMultiplier({ card }) {
        return card && isFlower(card) ? 1 / 2 : 0
      },
    },
    // 26-DONE
    {
      level: 2,
      name: "florist",
      description: (
        <>
          +10 points when matching flower tiles (<MiniTiles suit="f" />
          <MiniTiles suit="s" />)
        </>
      ),
      getRawPoints({ card }) {
        return card && isFlower(card) ? 10 / 2 : 0
      },
    },
    // 27-DONE
    {
      level: 2,
      name: "botanist",
      description: (
        <>
          +4 coins when matching flower tiles (<MiniTiles suit="f" />
          <MiniTiles suit="s" />)
        </>
      ),
      getCoins({ tile }) {
        return isFlower(tile.card) ? 4 / 2 : 0
      },
    },
    // 28-DONE
    {
      level: 2,
      name: "breeder",
      description: (
        <>
          +2 mult when matching rabbit tiles (<MiniTiles suit="r" />)
        </>
      ),
      getRawMultiplier({ card }) {
        return card && isRabbit(card) ? 2 : 0
      },
    },
    // 29-DONE
    {
      level: 2,
      name: "veterinarian",
      description: (
        <>
          +10 points when matching rabbit tiles (<MiniTiles suit="r" />)
        </>
      ),
      getRawPoints({ card }) {
        return card && isRabbit(card) ? 10 / 2 : 0
      },
    },
    // 30-DONE
    {
      level: 2,
      name: "butcher",
      description: (
        <>
          +4 coins when matching rabbit tiles (<MiniTiles suit="r" />)
        </>
      ),
      getCoins({ tile }) {
        return isRabbit(tile.card) ? 4 / 2 : 0
      },
    },
    // 31-DONE
    {
      level: 3,
      name: "drakologist",
      description: (
        <>
          +16 points when matching dragon tiles (<MiniTiles suit="d" />)
        </>
      ),
      getRawPoints({ card }) {
        return card && isDragon(card) ? 16 / 2 : 0
      },
    },
    // 32-DONE
    {
      level: 3,
      name: "dragon_rider",
      description: (
        <>
          +2 mult when matching dragon tiles (<MiniTiles suit="d" />)
        </>
      ),
      getRawMultiplier({ card }) {
        return card && isDragon(card) ? 2 / 2 : 0
      },
    },
    // 33-DONE
    {
      level: 3,
      name: "warden",
      description: (
        <>
          +6 coins when matching dragon tiles (<MiniTiles suit="d" />)
        </>
      ),
      getCoins({ tile }) {
        return isDragon(tile.card) ? 6 / 2 : 0
      },
    },
    // 34-DONE
    {
      level: 3,
      name: "phoenixologist",
      description: (
        <>
          +16 points when matching phoenix tiles (<MiniTiles suit="p" />)
        </>
      ),
      getRawPoints({ card }) {
        return card && isPhoenix(card) ? 16 / 2 : 0
      },
    },
    // 35-DONE
    {
      level: 3,
      name: "phoenix_rider",
      description: (
        <>
          +2 mult when matching phoenix tiles (<MiniTiles suit="p" />)
        </>
      ),
      getRawMultiplier({ card }) {
        return card && isPhoenix(card) ? 2 / 2 : 0
      },
    },
    // 36-DONE
    {
      level: 3,
      name: "keeper",
      description: (
        <>
          +6 coins when matching phoenix tiles (<MiniTiles suit="p" />)
        </>
      ),
      getCoins({ tile }) {
        return isPhoenix(tile.card) ? 6 / 2 : 0
      },
    },
    // 37-DONE
    {
      level: 3,
      name: "glassblower",
      description: (
        <>
          +20 points when matching glass tiles (<MiniTile material="glass" />)
        </>
      ),
      getRawPoints({ material }) {
        return material === "glass" ? 20 / 2 : 0
      },
    },
    // 38-NOT_IMPLEMENTED
    //{
    //  level: 3,
    //  name: "carver",
    //  description: "+10 coins for ivory tiles.",
    //  description: (
    //    <>
    //      +10 coins when matching ivory tiles (<MiniTile material="ivory" />)
    //    </>
    //  ),
    //  getRawPoints({ material }) {
    //    return material === "ivory" ? 10 / 2 : 0
    //  },
    //},
    // 39-DONE
    {
      level: 3,
      name: "smith",
      description: (
        <>
          +2 mult when matching bronze tiles (<MiniTile material="bronze" />)
        </>
      ),
      getRawMultiplier({ material }) {
        return material === "bronze" ? 2 / 2 : 0
      },
    },
    // 40-NOT_IMPLEMENTED
    // {
    //   level: 2,
    //   name: "the_kamikaze",
    //   description: "+5 multiplier if only 1 move is available.",
    // },

    // 41-PENDING
    {
      level: 4,
      name: "sailor",
      description: (
        <>
          +3 mult for winds tiles (<MiniTiles suit="w" />)
        </>
      ),
      getRawMultiplier({ card }) {
        return card && isWind(card) ? 3 / 2 : 0
      },
    },
    // 42-DONE
    {
      level: 4,
      name: "skipper",
      description: (
        <>
          +24 points for winds tiles (<MiniTiles suit="w" />)
        </>
      ),
      getRawPoints({ card }) {
        return card && isWind(card) ? 24 / 2 : 0
      },
    },
    // 43-DONE
    {
      level: 4,
      name: "captain",
      description: (
        <>
          +10 coins for winds tiles (<MiniTiles suit="w" />)
        </>
      ),
      getCoins({ tile }) {
        return isWind(tile.card) ? 10 / 2 : 0
      },
    },

    // XX-NOT_IMPLEMENTED
    // {
    //   level: 4,
    //   name: "the_jadeist",
    //   description: "+2 mult for jade tiles.",
    //   getRawMultiplier({ material }) {
    //     return material === "jade" ? 1 : 0
    //   },
    // },
    // {
    //   level: 2,
    //   name: "the_dragonist",
    //   description:
    //     "Matching a dragon converts all tiles into jade until next match.",
    // },
    // {
    //   level: 2,
    //   name: "confucius",
    //   description: "Shuffles the board after a 4+ dragon run.",
    // },
    // {
    //   level: 2,
    //   name: "the_tactician",
    //   description: "+1 mult your dragon runs.",
    // },
    // {
    //   level: 2,
    //   name: "the_trader",
    //   description: "Gold tiles have 2 freedom.",
    // },
    // {
    //   level: 2,
    //   name: "the_alchemist",
    //   description: "Matching different materials get +3 mult.",
    // },
    // TODO: 10 4 level
    // TODO: 10 5 level
  ]
}

function changeTilesPermanently(from: Suit, to: Suit) {
  const deck = useDeckState()
  const tiles = useTileState()
  const fromTiles = tiles
    .filterBy({ deleted: false })
    .filter((tile) => matchesSuit(tile.card, from))
  const rng = new Rand()
  const threeTiles = shuffle(fromTiles, rng).slice(0, 3)

  batch(() => {
    for (const tile of threeTiles) {
      const newCard = tile.card.replace(from, to) as Card
      tiles.set(tile.id, {
        ...tile,
        card: newCard,
      })

      const deckTile = deck.findBy({ card: tile.card })
      if (deckTile) {
        deck.set(deckTile.id, {
          ...deckTile,
          card: newCard,
        })
      }
    }
  })
}
