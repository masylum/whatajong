import { describe, it, expect } from "vitest"
import { setupTiles } from "./setupTiles"
import Rand from "rand-seed"
import { getStandardDeck } from "./deck"

describe("setup", () => {
  describe("initializeGame", () => {
    it("should initialize game with all tiles", () => {
      const rng = new Rand()
      const tiles = setupTiles({
        rng,
        mapName: "default",
        deck: getStandardDeck(),
      })
      expect(Object.keys(tiles).length).toBe(144)
    })
  })
})
