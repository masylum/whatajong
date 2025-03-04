import { describe, it, expect } from "vitest"
import { setupGame } from "./setupGame"
import Rand from "rand-seed"

describe("setup", () => {
  describe("initializeGame", () => {
    it("should initialize game with all tiles", () => {
      const rng = new Rand()
      const tiles = setupGame(rng)
      expect(Object.keys(tiles).length).toBe(144)
    })
  })
})
