import { describe, it, expect } from "vitest"
import { isFree, tiltMap, mapGet, MAP_WIDTH } from "./map"
import { stateStub } from "./test/stateStub"
import type { Asset, AssetById, GameState, TileById } from "./types"
import type { Card } from "./deck"

describe("map", () => {
  const gameState = stateStub()
  const n = null

  function tile(id: string) {
    return {
      deleted: false,
      card: "b1",
      id,
    } as const
  }

  function windAsset(id: string, wind: "wn" | "ws" | "we" | "ww"): Asset {
    return {
      id,
      card: wind,
      playerId: "1",
    }
  }

  function findTile(map: GameState["map"], id: string | number) {
    for (let z = 0; z < map.length; z++) {
      for (let y = 0; y < map[z]!.length; y++) {
        for (let x = 0; x < map[z]![y]!.length; x++) {
          if (map[z]![y]![x]?.toString() === id.toString()) {
            return { x, y, z }
          }
        }
      }
    }
    return null
  }

  function makeTile(id: string, card: Card = "b1") {
    return {
      id,
      card,
      deleted: false,
    }
  }

  describe("isFree", () => {
    it("should identify free positions", () => {
      expect(isFree(gameState, tile("1"))).toBe(true)
      expect(isFree(gameState, tile("6"))).toBe(true)
      expect(isFree(gameState, tile("7"))).toBe(true)
    })

    it("should identify covered positions", () => {
      expect(isFree(gameState, tile("2"))).toBe(false)
      expect(isFree(gameState, tile("3"))).toBe(false)
      expect(isFree(gameState, tile("4"))).toBe(false)
      expect(isFree(gameState, tile("5"))).toBe(false)
    })

    it("should identify blocked positions", () => {
      expect(isFree(gameState, tile("5"))).toBe(false)
      expect(isFree(gameState, tile("8"))).toBe(false)
    })
  })

  describe("getMap with wind bias", () => {
    it("should move tiles east", () => {
      const map = [
        [
          [1, 1, n, n],
          [1, 1, n, n],
        ],
      ]
      const tiles = {
        "1": makeTile("1"),
      } as TileById
      const assets = {
        "1": windAsset("1", "we"),
      } as AssetById

      const result = tiltMap({ map, tiles, assets })

      const expected = [
        [
          [n, n, 1, 1],
          [n, n, 1, 1],
        ],
      ]
      expect(result).toEqual(expected)
    })

    it("should move tiles west", () => {
      const map = [
        [
          [n, n, 1, 1],
          [n, n, 1, 1],
        ],
      ]
      const tiles = {
        "1": makeTile("1"),
      } as TileById
      const assets = {
        "1": windAsset("1", "ww"),
      } as AssetById

      const result = tiltMap({ map, tiles, assets })

      const expected = [
        [
          [1, 1, n, n],
          [1, 1, n, n],
        ],
      ]
      expect(result).toEqual(expected)
    })

    it("should move tiles north", () => {
      const map = [
        [
          [n, n],
          [1, 1],
          [1, 1],
          [n, n],
        ],
      ]
      const tiles = {
        "1": makeTile("1"),
      } as TileById
      const assets = {
        "1": windAsset("1", "wn"),
      } as AssetById

      const result = tiltMap({ map, tiles, assets })

      const expected = [
        [
          [1, 1],
          [1, 1],
          [n, n],
          [n, n],
        ],
      ]
      expect(result).toEqual(expected)
    })

    it("should move tiles south", () => {
      const map = [
        [
          [n, n],
          [1, 1],
          [1, 1],
          [n, n],
        ],
      ]
      const tiles = {
        "1": makeTile("1"),
      } as TileById
      const assets = {
        "1": windAsset("1", "ws"),
      } as AssetById

      const result = tiltMap({ map, tiles, assets })

      const expected = [
        [
          [n, n],
          [n, n],
          [1, 1],
          [1, 1],
        ],
      ]
      expect(result).toEqual(expected)
    })

    it("should respect support", () => {
      const map = [
        [
          [2, 2, n, n],
          [2, 2, n, n],
        ],
        [
          [n, 1, 1, n],
          [n, 1, 1, n],
        ],
      ]
      const tiles = {
        "1": makeTile("1"),
        "2": makeTile("2"),
      } as TileById
      const assets = {
        "1": windAsset("1", "we"),
      } as AssetById

      const result = tiltMap({ map, tiles, assets })

      // Tile 1 can't move because it would lose support
      expect(result).toEqual(map)
    })

    it("should respect blocking", () => {
      const map = [
        [
          [1, 1, 2, 2, 3, 3],
          [1, 1, 2, 2, 3, 3],
        ],
      ]
      const tiles = {
        "1": makeTile("1"),
        "2": makeTile("2"),
        "3": makeTile("3"),
      } as TileById
      const assets = {
        "1": windAsset("1", "we"),
      } as AssetById

      const result = tiltMap({ map, tiles, assets })

      // Tile 2 can't move because it's blocked by tiles 1 and 3
      expect(result).toEqual(map)
    })

    it("should handle multiple winds", () => {
      const map = [
        [
          [n, n, n, n],
          [n, 1, 1, n],
          [n, 1, 1, n],
          [n, n, n, n],
        ],
      ]
      const tiles = {
        "1": makeTile("1"),
      } as TileById
      const assets = {
        "1": windAsset("1", "we"),
        "2": windAsset("2", "ws"),
      } as AssetById

      const result = tiltMap({ map, tiles, assets })

      const expected = [
        [
          [n, n, n, n],
          [n, n, n, n],
          [n, n, 1, 1],
          [n, n, 1, 1],
        ],
      ]
      expect(result).toEqual(expected)
    })

    it("should not move tiles beyond map boundaries", () => {
      const state = {
        ...gameState,
        assets: {
          "1": windAsset("1", "we"),
          "2": windAsset("2", "we"),
          "3": windAsset("3", "we"),
        } as AssetById,
      }
      const result = tiltMap(state)

      // Check that rightmost tile hasn't moved beyond the map width
      const pos = findTile(result, 6)
      expect(pos).not.toBeNull()
      expect(pos!.x).toBeLessThan(MAP_WIDTH - 1)
    })

    it("should not move tiles if they would lose support", () => {
      const state = {
        ...gameState,
        assets: {
          "1": windAsset("1", "we"),
        } as AssetById,
      }
      const result = tiltMap(state)

      // Check that tile 1 (which is on level 1) hasn't moved if it would lose support
      const originalPos = findTile(state.map, 1)
      const newPos = findTile(result, 1)
      expect(originalPos).not.toBeNull()
      expect(newPos).not.toBeNull()

      // If it moved, verify it still has support
      if (newPos!.x !== originalPos!.x) {
        const hasSupport =
          !!mapGet(result, newPos!.x, newPos!.y, newPos!.z - 1) ||
          !!mapGet(result, newPos!.x + 1, newPos!.y, newPos!.z - 1) ||
          !!mapGet(result, newPos!.x, newPos!.y + 1, newPos!.z - 1) ||
          !!mapGet(result, newPos!.x + 1, newPos!.y + 1, newPos!.z - 1)
        expect(hasSupport).toBe(true)
      }
    })

    it("should not move tiles if blocked by other tiles", () => {
      const state = {
        ...gameState,
        assets: {
          "1": windAsset("1", "we"),
        } as AssetById,
      }
      const result = tiltMap(state)

      // Check that tile 5 (which is blocked horizontally) hasn't moved
      const originalPos = findTile(state.map, 5)
      const newPos = findTile(result, 5)
      expect(originalPos).not.toBeNull()
      expect(newPos).not.toBeNull()
      expect(newPos!.x).toBe(originalPos!.x)
      expect(newPos!.y).toBe(originalPos!.y)
    })
  })
})
