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
const winds = ["w1", "w2", "w3", "w4"] as const
const flowers = ["h1", "h2", "h3", "h4"] as const
const seasons = ["h5", "h6", "h7", "h8"] as const
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
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
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
  const [s1, s2] = seasons
  const [f1, f2] = flowers
  pairs.push([s1, s2], [s1, s2])
  pairs.push([f1, f2], [f1, f2])

  // Shuffle the pairs
  return shuffle(pairs)
}
