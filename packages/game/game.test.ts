import { describe, it, expect, beforeEach } from "vitest"
import { initTileDb, deleteTile, type Tile, type TileDb } from "./tile"
import {
  getFreeTiles,
  getAvailablePairs,
  calculatePoints,
  getPoints,
  gameOverCondition,
  didPlayerWin,
  type Game,
} from "./game"
import type { Card } from "./deck"
import { initPowerupsDb, type PowerupDb } from "./powerups"
import { initPlayersDb, type PlayerDb } from "./player"

describe("game", () => {
  describe("getFreeTiles", () => {
    let db: TileDb

    beforeEach(() => {
      db = initTileDb({
        "1": { id: "1", card: "b1", x: 0, y: 0, z: 0, selections: [] }, // covered by "5"
        "2": { id: "2", card: "b2", x: 2, y: 0, z: 0, selections: [] }, // blocked
        "3": { id: "3", card: "b3", x: 4, y: 0, z: 0, selections: [] },
        "4": { id: "4", card: "b4", x: 0, y: 2, z: 0, selections: [] },
        "5": { id: "5", card: "b5", x: 0, y: 0, z: 1, selections: [] },
      })
    })

    it("returns tiles that are not covered nor blocked", () => {
      const ids = getFreeTiles(db).map((t) => t.id)
      expect(ids).toEqual(["3", "4", "5"])
    })

    it("does not return deleted tiles", () => {
      deleteTile(db, db.get("5")!, "player1")
      const ids = getFreeTiles(db).map((t) => t.id)
      expect(ids).toEqual(["1", "3", "4"])
    })
  })

  describe("getAvailablePairs", () => {
    let db: TileDb

    it("should find matching free pairs", () => {
      db = initTileDb({
        "1": { id: "1", card: "b1", x: 0, y: 0, z: 0, selections: [] },
        "2": { id: "2", card: "b2", x: 2, y: 0, z: 0, selections: [] }, // blocked
        "3": { id: "3", card: "b4", x: 4, y: 0, z: 0, selections: [] },
        "4": { id: "4", card: "b4", x: 0, y: 2, z: 0, selections: [] },
        "5": { id: "5", card: "b5", x: 0, y: 0, z: 1, selections: [] }, // covering "1"
      })

      const pairs = getAvailablePairs(db)
      expect(pairs.length).toBe(1)
      expect(pairs[0]![0].id).toBe("3")
      expect(pairs[0]![1].id).toBe("4")
    })
  })

  describe("calculatePoints", () => {
    it("should calculate points for regular tiles", () => {
      const tiles: Tile[] = [
        { id: "1", card: "b1" as Card, x: 0, y: 0, z: 0, selections: [] },
        { id: "2", card: "b4" as Card, x: 0, y: 0, z: 0, selections: [] },
        { id: "3", card: "b8" as Card, x: 0, y: 0, z: 0, selections: [] },
      ]
      expect(calculatePoints(tiles)).toBe(3) // 1 + 1 + 1
    })

    it("should calculate points for special tiles", () => {
      const tiles: Tile[] = [
        { id: "1", card: "f1" as Card, x: 0, y: 0, z: 0, selections: [] }, // 12 points
        { id: "2", card: "s1" as Card, x: 0, y: 0, z: 0, selections: [] }, // 12 points
        { id: "3", card: "dc" as Card, x: 0, y: 0, z: 0, selections: [] }, // 8 points
        { id: "4", card: "wn" as Card, x: 0, y: 0, z: 0, selections: [] }, // 24 points
      ]
      expect(calculatePoints(tiles)).toBe(36) // 8 + 8 + 4 + 16
    })
  })

  describe("getPoints", () => {
    it("should calculate points correctly", () => {
      expect(getPoints("b1")).toBe(1)
      expect(getPoints("c5")).toBe(2)
      expect(getPoints("o9")).toBe(3)
      expect(getPoints("f1")).toBe(8)
      expect(getPoints("s1")).toBe(8)
      expect(getPoints("dc")).toBe(4)
      expect(getPoints("wn")).toBe(16)
    })
  })
})

describe("gameOverCondition", () => {
  let tileDb: TileDb
  let powerupsDb: PowerupDb
  let playersDb: PlayerDb

  beforeEach(() => {
    tileDb = initTileDb({})
    powerupsDb = initPowerupsDb({})
  })

  describe("when single player", () => {
    beforeEach(() => {
      playersDb = initPlayersDb({
        "1": { id: "1", order: 0, points: 0 },
      })
    })

    it("returns empty-board when no tiles are alive", () => {
      const tiles = Array.from({ length: 2 }, (_, i) => ({
        id: String(i + 1),
        card: "b1" as Card,
        x: i * 2,
        y: 0,
        z: 0,
        selections: [],
        deletedBy: "1",
      }))
      tileDb = initTileDb(
        Object.fromEntries(tiles.map((tile) => [tile.id, tile])),
      )

      expect(gameOverCondition(tileDb, powerupsDb, "1")).toBe("empty-board")
    })

    it("returns no-pairs when there are no available pairs", () => {
      tileDb = initTileDb({
        "1": { id: "1", card: "b1", x: 0, y: 0, z: 0, selections: [] },
        "2": { id: "2", card: "b2", x: 2, y: 0, z: 0, selections: [] },
      })

      expect(gameOverCondition(tileDb, powerupsDb, "1")).toBe("no-pairs")
    })
  })

  describe("when multiplayer", () => {
    beforeEach(() => {
      playersDb = initPlayersDb({
        "1": { id: "1", order: 0, points: 0 },
        "2": { id: "2", order: 1, points: 0 },
      })
    })

    it("returns empty-board when no tiles are alive", () => {
      const tiles = Array.from({ length: 2 }, (_, i) => ({
        id: String(i + 1),
        card: "b1" as Card,
        x: i * 2,
        y: 0,
        z: 0,
        selections: [],
        deletedBy: "1",
      }))
      tileDb = initTileDb(
        Object.fromEntries(tiles.map((tile) => [tile.id, tile])),
      )

      expect(gameOverCondition(tileDb, powerupsDb, "1")).toBe("empty-board")
    })

    it("returns no-pairs when there are no available pairs", () => {
      tileDb = initTileDb({
        "1": { id: "1", card: "b1", x: 0, y: 0, z: 0, selections: [] },
        "2": { id: "2", card: "b2", x: 2, y: 0, z: 0, selections: [] },
      })

      expect(gameOverCondition(tileDb, powerupsDb, "1")).toBe("no-pairs")
    })

    it("returns null when game is not over", () => {
      tileDb = initTileDb({
        "1": { id: "1", card: "b1", x: 0, y: 0, z: 0, selections: [] },
        "2": { id: "2", card: "b1", x: 2, y: 0, z: 0, selections: [] },
      })

      expect(gameOverCondition(tileDb, powerupsDb, "1")).toBe(null)
    })
  })
})

describe("didPlayerWin", () => {
  let tileDb: TileDb
  let playerDb: PlayerDb
  let game: Game

  beforeEach(() => {
    tileDb = initTileDb({})
    playerDb = initPlayersDb({
      "1": { id: "1", order: 0, points: 10 },
      "2": { id: "2", order: 1, points: 8 },
    })
    game = {}
  })

  it("returns true for single player when board is empty", () => {
    playerDb = initPlayersDb({
      "1": { id: "1", order: 0, points: 10 },
    })
    game.endCondition = "empty-board"

    expect(didPlayerWin(game, playerDb, "1")).toBe(true)
  })

  it("returns true for multiplayer when player has highest points", () => {
    game.endCondition = "no-pairs"

    expect(didPlayerWin(game, playerDb, "1")).toBe(true)
    expect(didPlayerWin(game, playerDb, "2")).toBe(false)
  })

  it("returns false when another player has more points", () => {
    playerDb = initPlayersDb({
      "1": { id: "1", order: 0, points: 8 },
      "2": { id: "2", order: 1, points: 10 },
    })
    game.endCondition = "no-pairs"

    expect(didPlayerWin(game, playerDb, "1")).toBe(false)
  })
})
