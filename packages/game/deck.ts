const suits = ["b", "c", "o", "d", "w", "f", "s"] as const
type Suit = (typeof suits)[number]

const bamboo = ["b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9"] as const
const character = [
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "c6",
  "c7",
  "c8",
  "c9",
] as const
const circle = ["o1", "o2", "o3", "o4", "o5", "o6", "o7", "o8", "o9"] as const
const winds = ["wn", "ww", "ws", "we"] as const
const flowers = ["f1", "f2", "f3", "f4"] as const
const seasons = ["s1", "s2", "s3", "s4"] as const
const dragons = ["dc", "df", "dp"] as const
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

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i]!, shuffled[j]!] = [shuffled[j]!, shuffled[i]!]
  }
  return shuffled
}

export function getDeck(): [Card, Card][] {
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

  // Shuffle the pairs
  return shuffle(pairs)
}

export function getSuit(card: Card) {
  return card.split("")[0]!
}

export function getNumber(card: Card) {
  return card.split("")[1]!
}

export function getPoints(card: Card) {
  return Number.parseInt(getNumber(card))
}

export function getStrength(card: Card) {
  return 10 - getPoints(card)
}

export function matchesSuit(card: Card, suit: Suit) {
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
