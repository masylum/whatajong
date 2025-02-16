import { describe, it, expect } from "vitest"
import { setup } from "./setup"

describe("setup", () => {
  describe("initializeGame", () => {
    it("should initialize game with all tiles", () => {
      const tiles = setup()
      expect(Object.keys(tiles).length).toBe(144)
    })
  })
})
