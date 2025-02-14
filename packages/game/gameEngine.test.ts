import { describe, it, expect } from "vitest"
import { initializeGame, getFreeTiles, getAvailablePairs } from "./gameEngine"
import { stateStub } from "./test/stateStub"

describe("gameState", () => {
  describe("initializeGame", () => {
    it("should initialize game with all tiles", () => {
      const tiles = initializeGame()
      expect(Object.keys(tiles).length).toBe(144)
    })
  })

  describe("getFreeTiles", () => {
    it("should return only free tiles", () => {
      const gameState = stateStub()
      const freeTiles = getFreeTiles(gameState)

      expect(freeTiles.length).toBe(4)
      expect(freeTiles).toContainEqual({
        position: { x: 1, y: 1, z: 1 },
        id: 1,
        selected: false,
        card: "b1",
      })
      expect(freeTiles).toContainEqual({
        position: { x: 4, y: 2, z: 0 },
        selected: false,
        id: 6,
        card: "b1",
      })
      expect(freeTiles).toContainEqual({
        position: { x: 0, y: 4, z: 0 },
        id: 7,
        selected: false,
        card: "b4",
      })
      expect(freeTiles).toContainEqual({
        position: { x: 4, y: 4, z: 0 },
        id: 9,
        selected: false,
        card: "b5",
      })
    })
  })

  describe("getAvailablePairs", () => {
    it("should return only free tiles", () => {
      const gameState = stateStub()
      const pairs = getAvailablePairs(gameState)

      expect(pairs.length).toBe(1)
      expect(pairs[0]).toContainEqual({
        position: { x: 4, y: 2, z: 0 },
        id: 6,
        selected: false,
        card: "b1",
      })
      expect(pairs[0]).toContainEqual({
        position: { x: 1, y: 1, z: 1 },
        id: 1,
        selected: false,
        card: "b1",
      })
    })
  })
})
