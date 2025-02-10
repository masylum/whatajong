import { describe, it, expect } from "vitest"
import { getDeck } from "./deck"

describe("deck", () => {
  it("should generate correct number of pairs", () => {
    const deck = getDeck()
    // 9 bamboo + 9 character + 9 circle + 4 winds + 3 dragons = 34 tile types
    // Each tile type gets 2 pairs (4 tiles total)
    expect(deck.length).toBe(34 * 2)
  })

  it("should generate matching pairs", () => {
    const deck = getDeck()
    for (const [card1, card2] of deck) {
      expect(card1).toBe(card2)
    }
  })

  it("should generate shuffled deck", () => {
    const deck1 = getDeck()
    const deck2 = getDeck()
    // Note: There's a tiny chance this could fail even with correct implementation
    expect(deck1).not.toEqual(deck2)
  })

  it("should have correct distribution of tiles", () => {
    const deck = getDeck()
    const cardCounts = new Map<string, number>()

    for (const [card1, card2] of deck) {
      cardCounts.set(card1, (cardCounts.get(card1) || 0) + 2)
    }

    // Check that each tile appears exactly 4 times (2 pairs)
    for (const count of cardCounts.values()) {
      expect(count).toBe(4)
    }
  })
})
