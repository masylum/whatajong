import { describe, it, expect } from "vitest"
import { setupTiles } from "./setupTiles"
import Rand from "rand-seed"
import { getDefaultSoloSettings } from "./settings"

describe("setup", () => {
  describe("initializeGame", () => {
    it("should initialize game with all tiles", () => {
      const rng = new Rand()
      const tiles = setupTiles(rng, getDefaultSoloSettings())
      expect(Object.keys(tiles).length).toBe(144)
    })
  })
})
