const suits = ["b", "c", "o", "d", "w", "f", "s"] as const
type Suit = (typeof suits)[number]

export const STRENGTH_SUITS = ["b", "c", "o"] as const
export type StrengthSuit = (typeof STRENGTH_SUITS)[number]

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

type ExtractSuit<T> = T extends `${infer S}${string}`
  ? S extends Suit
    ? S
    : never
  : never
type ExtractNumber<T> = T extends `${Suit}${infer N}` ? N : never

export function getSuit<T extends Card>(card: T): ExtractSuit<T> {
  return card[0] as ExtractSuit<T>
}

export function getNumber<T extends Card>(card: T): ExtractNumber<T> {
  return card.charAt(1) as ExtractNumber<T>
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

export function isDragon(card: Card) {
  return matchesSuit(card, "d") ? (card as Dragons) : null
}

export function isFlower(card: Card) {
  return matchesSuit(card, "f") ? (card as Flowers) : null
}

export function isSeason(card: Card) {
  return matchesSuit(card, "s") ? (card as Seasons) : null
}

export function isJoker(card: Card) {
  return isFlower(card) || isSeason(card)
}

export function isWind(card: Card) {
  return matchesSuit(card, "w") ? (card as Winds) : null
}

export function isBamboo(card: Card) {
  return matchesSuit(card, "b") ? (card as Bamboo) : null
}

export function isCharacter(card: Card) {
  return matchesSuit(card, "c") ? (card as Character) : null
}

export function isCircle(card: Card) {
  return matchesSuit(card, "o") ? (card as Circle) : null
}
