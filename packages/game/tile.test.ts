import { describe, it, expect, beforeEach } from "vitest"
import {
  initTileDb,
  getFreeTiles,
  overlaps,
  isFree,
  deleteTile,
  getAvailablePairs,
  calculatePoints,
  type Tile,
  type TileDb,
} from "./tile"
import type { Card } from "./deck"

describe("tile", () => {
  describe("initTileDb", () => {
    it("initializes empty database", () => {
      const db = initTileDb({})
      expect(db.size).toBe(0)
    })

    it("initializes database with tiles", () => {
      const db = initTileDb({
        "1": { id: "1", card: "b1" as Card, x: 0, y: 0, z: 0, selections: [] },
        "2": { id: "2", card: "b2" as Card, x: 1, y: 0, z: 0, selections: [] },
      })
      expect(db.size).toBe(2)
    })
  })

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

  describe("overlaps", () => {
    let db: TileDb
    let tile: Tile

    beforeEach(() => {
      db = initTileDb({
        "1": { id: "1", card: "b1" as Card, x: 2, y: 2, z: 0, selections: [] },
        "2": { id: "2", card: "b2" as Card, x: 2, y: 2, z: 1, selections: [] },
        "3": { id: "3", card: "b3" as Card, x: 2, y: 2, z: -1, selections: [] },
      })
      tile = db.get("1")!
    })

    it("detects overlap at the same level", () => {
      expect(overlaps(db, tile, 0)).not.toBeNull()
    })

    it("detects overlap above", () => {
      expect(overlaps(db, tile, 1)).not.toBeNull()
    })

    it("detects overlap below", () => {
      expect(overlaps(db, tile, -1)).not.toBeNull()
    })

    it("detects partial overlaps", () => {
      expect(overlaps(db, { x: 1, y: 1, z: 0 }, 0)).not.toBeNull()
      expect(overlaps(db, { x: 1, y: 2, z: 0 }, 0)).not.toBeNull()
      expect(overlaps(db, { x: 1, y: 3, z: 0 }, 0)).not.toBeNull()
      expect(overlaps(db, { x: 2, y: 1, z: 0 }, 0)).not.toBeNull()
      expect(overlaps(db, { x: 2, y: 2, z: 0 }, 0)).not.toBeNull()
      expect(overlaps(db, { x: 2, y: 3, z: 0 }, 0)).not.toBeNull()
      expect(overlaps(db, { x: 3, y: 1, z: 0 }, 0)).not.toBeNull()
      expect(overlaps(db, { x: 3, y: 2, z: 0 }, 0)).not.toBeNull()
      expect(overlaps(db, { x: 3, y: 3, z: 0 }, 0)).not.toBeNull()
    })

    it("should not detect overlap when there is none", () => {
      expect(overlaps(db, { x: 0, y: 0, z: 0 }, 0)).toBeNull()
      expect(overlaps(db, { x: 4, y: 4, z: 0 }, 0)).toBeNull()
      expect(overlaps(db, { x: 2, y: 4, z: 0 }, 0)).toBeNull()
      expect(overlaps(db, { x: 4, y: 2, z: 0 }, 0)).toBeNull()
    })
  })

  describe("isFree", () => {
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

    it("should identify blocked tiles", () => {
      expect(isFree(db, db.get("1")!)).toBe(false)
      expect(isFree(db, db.get("2")!)).toBe(false)
    })

    it("should identify free tiles", () => {
      expect(isFree(db, db.get("3")!)).toBe(true)
      expect(isFree(db, db.get("4")!)).toBe(true)
      expect(isFree(db, db.get("5")!)).toBe(true)
    })
  })

  describe("deleteTile", () => {
    it("should mark tile as deleted", () => {
      const db = initTileDb({
        "1": { id: "1", card: "b1" as Card, x: 0, y: 0, z: 0, selections: [] },
      })
      const tile = db.get("1")!
      deleteTile(db, tile, "player1")
      expect(db.get("1")!.deletedBy).toBe("player1")
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
      expect(calculatePoints(tiles)).toBe(12) // 6 + 4 + 2
    })

    it("should calculate points for special tiles", () => {
      const tiles: Tile[] = [
        { id: "1", card: "f1" as Card, x: 0, y: 0, z: 0, selections: [] }, // 12 points
        { id: "2", card: "s1" as Card, x: 0, y: 0, z: 0, selections: [] }, // 12 points
        { id: "3", card: "dc" as Card, x: 0, y: 0, z: 0, selections: [] }, // 8 points
        { id: "4", card: "wn" as Card, x: 0, y: 0, z: 0, selections: [] }, // 24 points
      ]
      expect(calculatePoints(tiles)).toBe(56) // 12 + 12 + 8 + 24
    })
  })
})
