import { describe, it, expect } from "vitest"
import { getDeck } from "./deck"

describe("deck", () => {
  it("should generate correct number of pairs", () => {
    const deck = getDeck()

    expect(deck.length).toBe(36 * 2)
  })

  it("should generate shuffled deck", () => {
    const deck1 = getDeck()
    const deck2 = getDeck()

    // Note: There's a 1 out of 144! chance that this test fails.
    // If it does, please go buy a lottery ticket since the odds are
    // smaller than finding a particular atom in the whole universe.
    expect(deck1).not.toEqual(deck2)
  })

  it("should have correct distribution of tiles", () => {
    const deck = getDeck()
    const cardCounts = new Map<string, number>()

    for (const [card1, _] of deck) {
      cardCounts.set(card1, (cardCounts.get(card1) || 0) + 2)
    }

    // Check that each tile appears exactly 4 times (2 pairs)
    for (const count of cardCounts.values()) {
      expect(count).toBe(4)
    }
  })
})
