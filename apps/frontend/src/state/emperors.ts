import {
  getRank,
  isBam,
  isCrack,
  isDot,
  isWind,
  type Card,
  type Material,
} from "@/lib/game"

export type Emperor = {
  level: number
  name: string
  description: string
  material: Material
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
  // Starting value: 2 * 5 * 3 = 30 points
  // DONE
  {
    level: 1,
    name: "wizard",
    description: "Odd numbers get +2 points.",
    material: "gold",
    getRawPoints({ card }) {
      if (!card) return 0
      const rank = Number.parseInt(getRank(card))
      if (Number.isNaN(rank)) return 0

      return rank % 2 === 1 ? 1 : 0
    },
  },
  // Starting value: 3 * 4 * 3 = 36 points
  // DONE
  {
    level: 1,
    name: "sorcerer",
    material: "gold",
    description: "Even numbers get +3 points.",
    getRawPoints({ card }) {
      if (!card) return 0
      const rank = Number.parseInt(getRank(card))
      if (Number.isNaN(rank)) return 0

      return rank % 2 === 0 ? 3 / 2 : 0
    },
  },
  // Starting value: 3 * 9 = 27 points
  // DONE
  {
    level: 1,
    name: "astronomer",
    material: "bronze",
    description: "Crack tiles get +3 points.",
    getRawPoints({ card }) {
      return card && isCrack(card) ? 3 / 2 : 0
    },
  },
  // Starting value: 2 * 9 = 18 points
  // DONE
  {
    level: 1,
    name: "mathematician",
    material: "bronze",
    description: "Crack tiles get +1 mult.",
    getRawMultiplier({ card }) {
      return card && isCrack(card) ? 1 / 2 : 0
    },
  },
  // Starting value: 3 * 9 = 27 points
  // DONE
  {
    level: 1,
    name: "gardener",
    material: "jade",
    description: "Bamb tiles get +3 points.",
    getRawPoints({ card }) {
      return card && isBam(card) ? 3 / 2 : 0
    },
  },
  // Starting value: 2 * 9 = 18 points
  // DONE
  {
    level: 1,
    name: "landscaper",
    material: "jade",
    description: "Wood tiles get +1 mult.",
    getRawMultiplier({ card }) {
      return card && isBam(card) ? 1 / 2 : 0
    },
  },
  // Starting value: 3 * 9 = 27 points
  // DONE
  {
    level: 1,
    name: "accountant",
    material: "glass",
    description: "Dot tiles get +3 points.",
    getRawPoints({ card }) {
      return card && isDot(card) ? 3 / 2 : 0
    },
  },
  // Starting value: 2 * 9 = 18 points
  {
    level: 1,
    name: "the_banker",
    material: "glass",
    description: "Dot tiles get +1 mult.",
    getRawMultiplier({ card }) {
      return card && isDot(card) ? 1 / 2 : 0
    },
  },
  // {
  //   level: 1,
  //   name: "the_librarian",
  //   description: "Crack tiles are 10 coin cheaper.",
  // },
  // {
  //   level: 1,
  //   name: "the_cleric",
  //   description: "Bamb tiles are 10 coin cheaper.",
  // },
  // {
  //   level: 1,
  //   name: "the_merchant",
  //   description: "Dot tiles are 10 coin cheaper.",
  // },
  // Starting value: 1 * 34 = 34 points
  // DONE
  {
    level: 1,
    name: "muse",
    description: "All tiles get +1 point.",
    material: "gold",
    getRawPoints() {
      return 1
    },
  },
  // Starting value: 0.5 * 34 = 17 points
  {
    level: 1,
    name: "the_buffet",
    description: "All tiles get +0.5 mult.",
    material: "gold",
    getRawMultiplier() {
      return 1 / 2
    },
  },
  //{
  //  level: 1,
  //  name: "the_buffet",
  //  description: "Yor game score has a 1.2x mult.",
  //},
  //{
  //  level: 1,
  //  name: "the_investor",
  //  description: "Get an additional 10% interest on your coins.",
  //  getRawPoints() {
  //    return 1
  //  },

  //},
  // Starting value: 20 = 20 points
  {
    level: 1,
    name: "the_bird_watcher",
    description: "'Bamb 1' tile get +20 points.",
    material: "jade",
    getRawPoints({ card }) {
      return card === "b1" ? 10 : 0
    },
  },
  {
    level: 1,
    name: "the_number_one",
    description: "'Crack 1' tile get +20 points.",
    material: "bronze",
    getRawPoints({ card }) {
      return card === "c1" ? 10 : 0
    },
  },
  {
    level: 1,
    name: "the_wheel_wright",
    description: "'Dot 1' tile get +20 points.",
    material: "glass",
    getRawPoints({ card }) {
      return card === "b1" ? 10 : 0
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
  //   description: "Tiles that match the available movements get +5 points.",
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
    material: "glass",
    getRawPoints({ material }) {
      return material === "glass" ? 3 / 2 : 0
    },
  },
  {
    level: 2,
    name: "the_jadeist",
    description: "+2 mult for jade tiles.",
    material: "jade",
    getRawMultiplier({ material }) {
      return material === "jade" ? 1 : 0
    },
  },
  {
    level: 2,
    name: "the_smith",
    description: "Bronze tiles get +1 mult.",
    material: "bronze",
    getRawMultiplier({ material }) {
      return material === "bronze" ? 1 / 2 : 0
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
    material: "glass",
    getRawMultiplier({ card }) {
      return card && isWind(card) ? 2 : 0
    },
  },
  // {
  //   level: 2,
  //   name: "the_alchemist",
  //   description: "Matching different materials get +3 mult.",
  // },
  // TODO: 10 3 level
  // TODO: 10 4 level
  // TODO: 10 5 level
]
