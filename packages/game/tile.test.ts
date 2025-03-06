import { describe, it, expect, beforeEach } from "vitest"
import {
  initTileDb,
  overlaps,
  isFree,
  deleteTiles,
  type Tile,
  type TileDb,
} from "./tile"
import type { Card } from "./deck"
import { initSelectionsDb } from "./selection"

describe("tile", () => {
  describe("initTileDb", () => {
    it("initializes empty database", () => {
      const db = initTileDb({})
      expect(db.size).toBe(0)
    })

    it("initializes database with tiles", () => {
      const db = initTileDb({
        "1": {
          id: "1",
          card: "b1" as Card,
          x: 0,
          y: 0,
          z: 0,
          material: "bone",
        },
        "2": {
          id: "2",
          card: "b2" as Card,
          x: 1,
          y: 0,
          z: 0,
          material: "bone",
        },
      })
      expect(db.size).toBe(2)
    })
  })

  describe("overlaps", () => {
    let db: TileDb
    let tile: Tile

    beforeEach(() => {
      db = initTileDb({
        "1": {
          id: "1",
          card: "b1" as Card,
          x: 2,
          y: 2,
          z: 0,
          material: "bone",
        },
        "2": {
          id: "2",
          card: "b2" as Card,
          x: 2,
          y: 2,
          z: 1,
          material: "bone",
        },
        "3": {
          id: "3",
          card: "b3" as Card,
          x: 2,
          y: 2,
          z: -1,
          material: "bone",
        },
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
        "1": { id: "1", card: "b1", x: 0, y: 0, z: 0, material: "bone" }, // covered by "5"
        "2": { id: "2", card: "b2", x: 2, y: 0, z: 0, material: "bone" }, // blocked
        "3": { id: "3", card: "b3", x: 4, y: 0, z: 0, material: "bone" },
        "4": { id: "4", card: "b4", x: 0, y: 2, z: 0, material: "bone" },
        "5": { id: "5", card: "b5", x: 0, y: 0, z: 1, material: "bone" },
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
        "1": {
          id: "1",
          card: "b1" as Card,
          x: 0,
          y: 0,
          z: 0,
          material: "bone",
        },
      })
      const selectionsDb = initSelectionsDb({})
      const tile = db.get("1")!
      deleteTiles(db, selectionsDb, [tile], "player1")
      expect(db.get("1")!.deletedBy).toBe("player1")
    })

    it("should delete selection", () => {
      const db = initTileDb({
        "1": {
          id: "1",
          card: "b1" as Card,
          x: 0,
          y: 0,
          z: 0,
          material: "bone",
        },
      })
      const selectionsDb = initSelectionsDb({
        "1": { id: "1", tileId: "1", playerId: "player1" },
      })
      const tile = db.get("1")!
      deleteTiles(db, selectionsDb, [tile], "player1")
      expect(selectionsDb.get("1")).toBeNull()
    })
  })
})
