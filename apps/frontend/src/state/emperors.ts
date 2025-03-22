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
  // 1-DONE
  {
    level: 1,
    name: "wizard",
    description: "Odd numbers get +2 points.",
    getRawPoints({ card }) {
      if (!card) return 0
      const rank = Number.parseInt(getRank(card))
      if (Number.isNaN(rank)) return 0

      return rank % 2 === 1 ? 1 : 0
    },
  },
  // Starting value: 3 * 4 * 3 = 36 points
  // 2-DONE
  {
    level: 1,
    name: "sorcerer",
    description: "Even numbers get +3 points.",
    getRawPoints({ card }) {
      if (!card) return 0
      const rank = Number.parseInt(getRank(card))
      if (Number.isNaN(rank)) return 0

      return rank % 2 === 0 ? 3 / 2 : 0
    },
  },
  // Starting value: 3 * 9 = 27 points
  // 3-DONE
  {
    level: 1,
    name: "astronomer",
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
    description: "Crack tiles get +1 mult.",
    getRawMultiplier({ card }) {
      return card && isCrack(card) ? 1 / 2 : 0
    },
  },
  // Starting value: 3 * 9 = 27 points
  // 4-DONE
  {
    level: 1,
    name: "gardener",
    description: "Bamb tiles get +3 points.",
    getRawPoints({ card }) {
      return card && isBam(card) ? 3 / 2 : 0
    },
  },
  // Starting value: 2 * 9 = 18 points
  // 5-DONE
  {
    level: 1,
    name: "landscaper",
    description: "Wood tiles get +1 mult.",
    getRawMultiplier({ card }) {
      return card && isBam(card) ? 1 / 2 : 0
    },
  },
  // Starting value: 3 * 9 = 27 points
  // 6-DONE
  {
    level: 1,
    name: "accountant",
    description: "Dot tiles get +3 points.",
    getRawPoints({ card }) {
      return card && isDot(card) ? 3 / 2 : 0
    },
  },
  // Starting value: 2 * 9 = 18 points
  // 7-DONE
  {
    level: 1,
    name: "advisor",
    description: "Dot tiles get +1 mult.",
    getRawMultiplier({ card }) {
      return card && isDot(card) ? 1 / 2 : 0
    },
  },
  // Starting value: 1 * 34 = 34 points
  // 8-DONE
  {
    level: 1,
    name: "shaman",
    description: "All tiles get +1 point.",
    getRawPoints() {
      return 1
    },
  },
  // Starting value: 0.5 * 34 = 17 points
  // 9-DONE
  {
    level: 1,
    name: "herbolist",
    description: "All tiles get +0.5 mult.",
    getRawMultiplier() {
      return 1 / 2
    },
  },
  // 10-NOT-IMPLEMENTED
  //{
  //  level: 1,
  //  name: "investor",
  //  description: "Yor game score has a 1.2x mult.",
  //},
  // 11-NOT-IMPLEMENTED
  //{
  //  level: 1,
  //  name: "lender",
  //  description: "Get an additional 20% interest on your coins.",
  //  getRawPoints() {
  //    return 1
  //  },
  //},
  // Starting value: 20 = 20 points
  // 12-DONE
  {
    level: 1,
    name: "birdwatcher",
    description: "'Bamb 1' tile get +20 points.",
    getRawPoints({ card }) {
      return card === "b1" ? 10 : 0
    },
  },
  // 13-DONE
  {
    level: 1,
    name: "muse",
    description: "'Crack 1' tile get +20 points.",
    getRawPoints({ card }) {
      return card === "c1" ? 10 : 0
    },
  },
  // 14-DONE
  {
    level: 1,
    name: "drummer",
    description: "'Dot 1' tile get +20 points.",
    getRawPoints({ card }) {
      return card === "b1" ? 10 : 0
    },
  },
  // 15-NOT-IMPLEMENTED
  // {
  //   level: 1,
  //   name: "barterer",
  //   description: "When discarded, get 100 coins.",
  // },
  // 16-NOT-IMPLEMENTED
  // {
  //   level: 1,
  //   name: "dealer",
  //   description: "When discarded change 3 random bam tiles to dot tiles.",
  // },
  // 17-NOT-IMPLEMENTED
  // {
  //   level: 1,
  //   name: "trader",
  //   description: "When discarded, change 3 random dot tiles to bam tiles.",
  // },
  // 18-NOT-IMPLEMENTED
  // {
  //   level: 1,
  //   name: "merchant",
  //   description: "When discarded change 3 random crack tiles to dot tiles.",
  // },
  // 19-NOT-IMPLEMENTED
  // {
  //   level: 1,
  //   name: "broker",
  //   description: "When discarded, change 3 random dot tiles to crack tiles.",
  // },
  // 20-NOT-IMPLEMENTED
  // {
  //   level: 1,
  //   name: "sacrificer",
  //   description: "When discarded, get 200 points.",
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
      return material === "glass" ? 3 / 2 : 0
    },
  },
  {
    level: 2,
    name: "the_jadeist",
    description: "+2 mult for jade tiles.",
    getRawMultiplier({ material }) {
      return material === "jade" ? 1 : 0
    },
  },
  {
    level: 2,
    name: "the_smith",
    description: "Bronze tiles get +1 mult.",
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
