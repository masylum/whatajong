import type Rand from "rand-seed"

export function shuffle<T>(array: T[], rng: Rand): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    ;[shuffled[i]!, shuffled[j]!] = [shuffled[j]!, shuffled[i]!]
  }

  return shuffled
}

export function pickFromArray<T>(arr: T[], rand: Rand) {
  if (arr.length === 0) return undefined
  const n = rand.next()
  const index = Math.floor(n * arr.length)

  return arr[index]
}
