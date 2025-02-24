import { describe, it, expect } from "vitest"
import { getDeck, getSuit, getNumber, matchesSuit, cardsMatch } from "./deck"

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

  describe("card utility functions", () => {
    it("should extract suit correctly", () => {
      expect(getSuit("b1")).toBe("b")
      expect(getSuit("c5")).toBe("c")
      expect(getSuit("wn")).toBe("w")
      expect(getSuit("dc")).toBe("d")
    })

    it("should extract number correctly", () => {
      expect(getNumber("b1")).toBe("1")
      expect(getNumber("c5")).toBe("5")
      expect(getNumber("wn")).toBe("n")
      expect(getNumber("dc")).toBe("c")
    })

    it("should match suits correctly", () => {
      expect(matchesSuit("b1", "b")).toBe(true)
      expect(matchesSuit("c5", "b")).toBe(false)
      expect(matchesSuit("wn", "w")).toBe(true)
      expect(matchesSuit("dc", "c")).toBe(false)
    })
  })

  describe("cardsMatch", () => {
    it("should match identical cards", () => {
      expect(cardsMatch("b1", "b1")).toBe(true)
      expect(cardsMatch("c5", "c5")).toBe(true)
      expect(cardsMatch("wn", "wn")).toBe(true)
      expect(cardsMatch("dc", "dc")).toBe(true)
    })

    it("should match any flower with any flower", () => {
      expect(cardsMatch("f1", "f2")).toBe(true)
      expect(cardsMatch("f2", "f3")).toBe(true)
      expect(cardsMatch("f3", "f4")).toBe(true)
      expect(cardsMatch("f4", "f1")).toBe(true)
    })

    it("should match any season with any season", () => {
      expect(cardsMatch("s1", "s2")).toBe(true)
      expect(cardsMatch("s2", "s3")).toBe(true)
      expect(cardsMatch("s3", "s4")).toBe(true)
      expect(cardsMatch("s4", "s1")).toBe(true)
    })

    it("should not match different non-flower/season cards", () => {
      expect(cardsMatch("b1", "b2")).toBe(false)
      expect(cardsMatch("c5", "c6")).toBe(false)
      expect(cardsMatch("wn", "ws")).toBe(false)
      expect(cardsMatch("dc", "df")).toBe(false)
    })

    it("should not match cards of different types", () => {
      expect(cardsMatch("b1", "c1")).toBe(false)
      expect(cardsMatch("f1", "s1")).toBe(false)
      expect(cardsMatch("wn", "dc")).toBe(false)
    })
  })
})
