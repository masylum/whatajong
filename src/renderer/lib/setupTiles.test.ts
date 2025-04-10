import { getStandardDeck } from "@/lib/game"
import Rand from "rand-seed"
import { describe, expect, it } from "vitest"
import { setupTiles } from "./setupTiles"

describe("setup", () => {
  describe("initializeGame", () => {
    it("should initialize game with all tiles", () => {
      const rng = new Rand()
      const tiles = setupTiles({
        rng,
        deck: getStandardDeck(),
      })
      expect(Object.keys(tiles).length).toBe(144)
    })
  })
})
