import { describe, it, expect, beforeEach } from "vitest"
import { createGame, POST } from "./game"
import type { RemovePairRequest } from "./game"

// Helper to create a mock Request
function createRequest(body: RemovePairRequest): Request {
  return new Request("http://test.com", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

describe("game API", () => {
  describe("createGame", () => {
    it("should create a new game", async () => {
      const response = await createGame()
      const data = await response.json()

      expect(data.gameId).toBeDefined()
      expect(data.tiles).toBeDefined()
      expect(data.tiles.length).toBeGreaterThan(0)
      expect(data.tiles.length % 2).toBe(0) // Should have even number of tiles
    })

    it("should create unique games", async () => {
      const response1 = await createGame()
      const response2 = await createGame()
      const data1 = await response1.json()
      const data2 = await response2.json()

      expect(data1.gameId).not.toBe(data2.gameId)
    })
  })

  describe("POST", () => {
    let gameId: string
    let tiles: { position: { x: number; y: number; z: number }; card: string }[]

    beforeEach(async () => {
      const response = await createGame()
      const data = await response.json()
      gameId = data.gameId
      tiles = data.tiles
    })

    it("should remove valid pairs", async () => {
      // Find a valid pair
      const tile1 = tiles[0]
      const tile2 = tiles.find(t => t !== tile1 && t.card === tile1.card)
      if (!tile2) throw new Error("No matching pair found")

      const request: RemovePairRequest = {
        gameId,
        positions: [tile1.position, tile2.position],
        clientVersion: 1,
      }

      const response = await POST({ request: createRequest(request) })
      const data = await response.json()

      expect(data.success).toBe(true)
      expect(data.tiles.length).toBe(tiles.length - 2)
    })

    it("should reject invalid pairs", async () => {
      const request: RemovePairRequest = {
        gameId,
        positions: [
          { x: -1, y: 0, z: 0 },
          { x: 0, y: 0, z: 0 },
        ],
        clientVersion: 1,
      }

      const response = await POST({ request: createRequest(request) })
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it("should reject invalid game IDs", async () => {
      const request: RemovePairRequest = {
        gameId: "invalid-id",
        positions: [
          { x: 0, y: 0, z: 0 },
          { x: 1, y: 0, z: 0 },
        ],
        clientVersion: 1,
      }

      const response = await POST({ request: createRequest(request) })
      const data = await response.json()

      expect(data.success).toBe(false)
      expect(data.error).toBe("Game not found")
    })
  })
})
