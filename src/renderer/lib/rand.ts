import type Rand from "rand-seed"

export function shuffle<T>(array: T[], rng: Rand): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1))
    ;[shuffled[i]!, shuffled[j]!] = [shuffled[j]!, shuffled[i]!]
  }

  return shuffled
}

export function pick<T>(arr: readonly T[]) {
  return arr[Math.floor(Math.random() * arr.length)]!
}
