import {
  getRank,
  isBamboo,
  isCharacter,
  isWind,
  type Card,
  type Material,
} from "@/lib/game"

export type Emperor = {
  level: number
  name: string
  description: string
  getRawPoints?: ({
    card,
    material,
  }: { card?: Card; material?: Material }) => number
  getRawMultiplier?: ({
    card,
    material,
  }: { card?: Card; material?: Material }) => number
}

// TODO: index them by name
export const EMPERORS: Emperor[] = [
  {
    level: 1,
    name: "the_odd_one",
    description: "Matching odd numbers have +1 points.",
    getRawPoints({ card }) {
      if (!card) return 0
      const rank = Number.parseInt(getRank(card))
      if (Number.isNaN(rank)) return 0

      return rank % 2 === 1 ? 1 : 0
    },
  },
  {
    level: 1,
    name: "the_even_one",
    description: "Matching even numbers have +1 points.",
    getRawPoints({ card }) {
      if (!card) return 0
      const rank = Number.parseInt(getRank(card))
      if (Number.isNaN(rank)) return 0

      return rank % 2 === 0 ? 1 : 0
    },
  },
  {
    level: 1,
    name: "the_mathematician",
    description: "Crack tiles have +1 mult.",
    getRawMultiplier({ card }) {
      return card && isCharacter(card) ? 1 : 0
    },
  },
  {
    level: 1,
    name: "the_gardener",
    description: "Bamb tiles have +3 points.",
    getRawPoints({ card }) {
      return card && isBamboo(card) ? 3 : 0
    },
  },
  // {
  //   level: 1,
  //   name: "the_banker",
  //   description: "Dot tiles are 1 coin cheaper.",
  // },
  {
    level: 1,
    name: "the_bird_watcher",
    description: "'Bamb 1' tile have +30 points.",
    getRawPoints({ card }) {
      return card === "b1" ? 30 : 0
    },
  },
  {
    level: 1,
    name: "the_third_eye",
    description: "Matching a 3 has +1 mult.",
    getRawMultiplier({ card }) {
      return card && getRank(card) === "3" ? 1 : 0
    },
  },
  // {
  //   level: 1,
  //   name: "the_sprinter",
  //   description: "Matching within 3 seconds has +2 points.",
  // },
  // {
  //   level: 1,
  //   name: "the_clockmaker",
  //   description: "The timer stops every 10 matches.",
  // },
  // {
  //   level: 1,
  //   name: "the_mystic",
  //   description: "Tiles that match the available movements have +5 points.",
  // },
  // {
  //   level: 2,
  //   name: "the_dragonist",
  //   description:
  //     "Matching a dragon converts all tiles into jade until next match.",
  // },
  // {
  //   level: 2,
  //   name: "the_kamikaze",
  //   description: "+5 multiplier if only 1 move is available.",
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
  {
    level: 2,
    name: "the_glass_blower",
    description: "+3 points for glass tiles.",
    getRawPoints({ material }) {
      return material === "glass" ? 3 : 0
    },
  },
  {
    level: 2,
    name: "the_jadeist",
    description: "+2 mult for jade tiles.",
    getRawMultiplier({ material }) {
      return material === "jade" ? 2 : 0
    },
  },
  {
    level: 2,
    name: "the_smith",
    description: "Bronze tiles have +1 mult.",
    getRawMultiplier({ material }) {
      return material === "bronze" ? 1 : 0
    },
  },
  // {
  //   level: 2,
  //   name: "the_trader",
  //   description: "Gold tiles have 2 freedom.",
  // },
  {
    level: 2,
    name: "the_sailor",
    description: "+2 mult for winds tiles.",
    getRawMultiplier({ card }) {
      return card && isWind(card) ? 2 : 0
    },
  },
  // {
  //   level: 2,
  //   name: "the_alchemist",
  //   description: "Matching different materials have +3 mult.",
  // },
  // TODO: 10 3 level
  // TODO: 10 4 level
  // TODO: 10 5 level
]
