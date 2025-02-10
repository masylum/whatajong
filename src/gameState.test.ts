import { describe, it, expect } from "vitest"
import {
  initializeGame,
  canRemovePair,
  removePair,
  getTiles,
  getFreeTiles,
  getAvailablePairs,
  type GameState,
} from "./gameState"
import type { Card } from "./deck"
import type { Position } from "./types"
import { getMap, PositionMap } from "./map"

// Helper to create a test game state with known positions and cards
function createTestGameState(): GameState {
  const positionMap = new PositionMap()
  const tilesByPosition = new Map<Position, Card>()

  // Create a small pseudo-pyramid structure:
  // Level 2 (top):      [b1]
  //
  // Level 1:       [b3][b3]
  //                [b2][b2][b1]
  //                [b4][b5]

  const tiles = [
    [{ x: 0, y: 0, z: 0 }, "b3"],
    [{ x: 2, y: 0, z: 0 }, "b3"],
    [{ x: 0, y: 2, z: 0 }, "b2"],
    [{ x: 2, y: 2, z: 0 }, "b2"],
    [{ x: 4, y: 2, z: 0 }, "b1"],
    [{ x: 0, y: 4, z: 0 }, "b4"],
    [{ x: 2, y: 4, z: 0 }, "b5"],
    [{ x: 1, y: 1, z: 1 }, "b1"],
  ] as const

  for (const [pos, card] of tiles) {
    positionMap.add(pos)
    tilesByPosition.set(pos, card)
  }

  return {
    positionMap,
    tilesByPosition,
    remainingPairs: [],
    players: {
      player1: { name: "Player 1", tiles: [] },
      player2: { name: "Player 2", tiles: [] },
    },
  }
}

describe("gameState", () => {
  const game = createTestGameState()

  describe("initializeGame", () => {
    it("should initialize game with valid tile placement", () => {
      const game = initializeGame()
      const tiles = getTiles(game)
      expect(tiles.length).toBeGreaterThan(0)
      expect(tiles.length % 2).toBe(0) // Should have even number of tiles
    })

    it("should place tiles in valid positions according to the map", () => {
      const game = initializeGame()
      const mapLayout = getMap()
      const tiles = getTiles(game)

      // All tiles should be in positions marked in the map
      for (const tile of tiles) {
        expect(
          mapLayout[tile.position.z][tile.position.y][tile.position.x],
        ).not.toBeNull()
      }
    })
  })

  describe("canRemovePair", () => {
    it("should allow removing matching accessible pairs", () => {
      expect(
        canRemovePair(game, { x: 1, y: 1, z: 1 }, { x: 4, y: 2, z: 0 }),
      ).toBe(true)
    })

    it("should reject non-matching pairs", () => {
      expect(
        canRemovePair(game, { x: 0, y: 0, z: 0 }, { x: 4, y: 2, z: 0 }),
      ).toBe(false)
    })

    it("should reject covered or blocked tiles", () => {
      expect(
        canRemovePair(game, { x: 0, y: 0, z: 0 }, { x: 2, y: 0, z: 0 }),
      ).toBe(false)
      expect(
        canRemovePair(game, { x: 2, y: 2, z: 0 }, { x: 4, y: 2, z: 0 }),
      ).toBe(false)
    })

    it("should reject invalid positions", () => {
      expect(
        canRemovePair(game, { x: -1, y: 0, z: 0 }, { x: 1, y: 1, z: 0 }),
      ).toBe(false)
    })
  })

  describe("getFreeTiles", () => {
    it("should return only free tiles", () => {
      const freeTiles = getFreeTiles(game)

      expect(freeTiles.length).toBe(4)
      expect(freeTiles).toContainEqual({
        position: { x: 4, y: 2, z: 0 },
        card: "b1",
      })
      expect(freeTiles).toContainEqual({
        position: { x: 1, y: 1, z: 1 },
        card: "b1",
      })
      expect(freeTiles).toContainEqual({
        position: { x: 0, y: 4, z: 0 },
        card: "b4",
      })
      expect(freeTiles).toContainEqual({
        position: { x: 2, y: 4, z: 0 },
        card: "b5",
      })
    })
  })

  describe("getAvailablePairs", () => {
    it("should return only free tiles", () => {
      const pairs = getAvailablePairs(game)
      expect(pairs.length).toBe(1)
      expect(pairs[0]).toContainEqual({
        position: { x: 4, y: 2, z: 0 },
        card: "b1",
      })
      expect(pairs[0]).toContainEqual({
        position: { x: 1, y: 1, z: 1 },
        card: "b1",
      })
    })
  })
})
