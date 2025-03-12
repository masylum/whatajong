import { describe, it, expect, beforeEach } from "vitest"
import { initTileDb, type TileDb } from "./tile"
import {
  getFreeTiles,
  getAvailablePairs,
  gameOverCondition,
  didPlayerWin,
  type Game,
  getPoints,
  deleteTiles,
} from "./game"
import type { Card, Dragons } from "./deck"
import { initPowerupsDb, type PowerupDb } from "./powerups"
import { initPlayersDb, type PlayerDb } from "./player"
import { initSelectionsDb, type SelectionDb } from "./selection"

// Helper function to create tiles for testing
function createTile({
  id = "1",
  card,
  material = "bone",
  x = 0,
  y = 0,
  z = 0,
  deletedBy,
}: {
  id?: string
  card: Card
  material?: "bone" | "wood" | "glass" | "ivory" | "bronze" | "gold" | "jade"
  x?: number
  y?: number
  z?: number
  deletedBy?: string
}) {
  return {
    id,
    card,
    material,
    x,
    y,
    z,
    deletedBy,
  }
}

describe("game", () => {
  describe("getFreeTiles", () => {
    let db: TileDb
    let selectionsDb: SelectionDb

    beforeEach(() => {
      db = initTileDb({
        "1": { id: "1", card: "b1", x: 0, y: 0, z: 0, material: "bone" }, // covered by "5"
        "2": { id: "2", card: "b2", x: 2, y: 0, z: 0, material: "bone" }, // blocked
        "3": { id: "3", card: "b3", x: 4, y: 0, z: 0, material: "bone" },
        "4": { id: "4", card: "b4", x: 0, y: 2, z: 0, material: "bone" },
        "5": { id: "5", card: "b5", x: 0, y: 0, z: 1, material: "bone" },
      })
      selectionsDb = initSelectionsDb({})
    })

    it("returns tiles that are not covered nor blocked", () => {
      const ids = getFreeTiles(db).map((t) => t.id)
      expect(ids).toEqual(["3", "4", "5"])
    })

    it("does not return deleted tiles", () => {
      deleteTiles(db, selectionsDb, [db.get("5")!], "player1")
      const ids = getFreeTiles(db).map((t) => t.id)
      expect(ids).toEqual(["1", "3", "4"])
    })
  })

  describe("getAvailablePairs", () => {
    let db: TileDb

    it("should find matching free pairs", () => {
      db = initTileDb({
        "1": { id: "1", card: "b1", x: 0, y: 0, z: 0, material: "bone" },
        "2": { id: "2", card: "b2", x: 2, y: 0, z: 0, material: "bone" }, // blocked
        "3": { id: "3", card: "b4", x: 4, y: 0, z: 0, material: "bone" },
        "4": { id: "4", card: "b4", x: 0, y: 2, z: 0, material: "bone" },
        "5": { id: "5", card: "b5", x: 0, y: 0, z: 1, material: "bone" }, // covering "1"
      })

      const pairs = getAvailablePairs(db)
      expect(pairs.length).toBe(1)
      expect(pairs[0]![0].id).toBe("3")
      expect(pairs[0]![1].id).toBe("4")
    })
  })
})

describe("gameOverCondition", () => {
  let tileDb: TileDb
  let powerupsDb: PowerupDb

  beforeEach(() => {
    tileDb = initTileDb({})
    powerupsDb = initPowerupsDb({})
  })

  describe("when single player", () => {
    it("returns empty-board when no tiles are alive", () => {
      const tiles = Array.from(
        { length: 2 },
        (_, i) =>
          ({
            id: String(i + 1),
            card: "b1" as Card,
            x: i * 2,
            y: 0,
            z: 0,
            material: "bone",
            selections: [],
            deletedBy: "1",
          }) as const,
      )
      tileDb = initTileDb(
        Object.fromEntries(tiles.map((tile) => [tile.id, tile])),
      )

      expect(gameOverCondition(tileDb, powerupsDb, "1")).toBe("empty-board")
    })

    it("returns no-pairs when there are no available pairs", () => {
      tileDb = initTileDb({
        "1": { id: "1", card: "b1", x: 0, y: 0, z: 0, material: "bone" },
        "2": { id: "2", card: "b2", x: 2, y: 0, z: 0, material: "bone" },
      })

      expect(gameOverCondition(tileDb, powerupsDb, "1")).toBe("no-pairs")
    })
  })

  describe("when multiplayer", () => {
    it("returns empty-board when no tiles are alive", () => {
      const tiles = Array.from(
        { length: 2 },
        (_, i) =>
          ({
            id: String(i + 1),
            card: "b1" as Card,
            x: i * 2,
            y: 0,
            z: 0,
            material: "bone",
            selections: [],
            deletedBy: "1",
          }) as const,
      )
      tileDb = initTileDb(
        Object.fromEntries(tiles.map((tile) => [tile.id, tile])),
      )

      expect(gameOverCondition(tileDb, powerupsDb, "1")).toBe("empty-board")
    })

    it("returns no-pairs when there are no available pairs", () => {
      tileDb = initTileDb({
        "1": { id: "1", card: "b1", x: 0, y: 0, z: 0, material: "bone" },
        "2": { id: "2", card: "b2", x: 2, y: 0, z: 0, material: "bone" },
      })

      expect(gameOverCondition(tileDb, powerupsDb, "1")).toBe("no-pairs")
    })

    it("returns null when game is not over", () => {
      tileDb = initTileDb({
        "1": { id: "1", card: "b1", x: 0, y: 0, z: 0, material: "bone" },
        "2": { id: "2", card: "b1", x: 2, y: 0, z: 0, material: "bone" },
      })

      expect(gameOverCondition(tileDb, powerupsDb, "1")).toBe(null)
    })
  })
})

describe("didPlayerWin", () => {
  let playerDb: PlayerDb
  let game: Game

  beforeEach(() => {
    playerDb = initPlayersDb({
      "1": { id: "1", order: 0, points: 10 },
      "2": { id: "2", order: 1, points: 8 },
    })
    game = { map: "default" }
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

describe("getPoints", () => {
  let powerupsDb: PowerupDb
  let playerId: string

  // Helper to create a dragon powerup
  function createDragonPowerup(dragonCard: Dragons, combo: number) {
    const id = `dragon-${dragonCard}`
    powerupsDb.set(id, {
      id,
      playerId,
      card: dragonCard,
      combo,
    })
    return id
  }

  beforeEach(() => {
    powerupsDb = initPowerupsDb({})
    playerId = "player1"
  })

  describe("card points", () => {
    it("assigns correct base points to each card type", () => {
      // Standard cards = 1 point
      const standardTile = createTile({ card: "c1" })

      // Special cards with higher point values
      const dragonTile = createTile({ card: "dc" })
      const flowerTile = createTile({ card: "f1" })
      const seasonTile = createTile({ card: "s1" })
      const windTile = createTile({ card: "wn" })

      // Using bone material (adds 2 points) for all tests for consistency
      expect(getPoints(powerupsDb, playerId, standardTile)).toBe(6) // (1 + 2) * 2
      expect(getPoints(powerupsDb, playerId, dragonTile)).toBe(8) // (2 + 2) * 2
      expect(getPoints(powerupsDb, playerId, flowerTile)).toBe(12) // (4 + 2) * 2
      expect(getPoints(powerupsDb, playerId, seasonTile)).toBe(12) // (4 + 2) * 2
      expect(getPoints(powerupsDb, playerId, windTile)).toBe(20) // (8 + 2) * 2
    })
  })

  describe("material effects", () => {
    it("adds correct point values for different materials", () => {
      // Test with a standard card (c1) across different materials
      const ivoryTile = createTile({ card: "c1", material: "ivory" })
      const woodTile = createTile({ card: "c1", material: "wood" })
      const boneTile = createTile({ card: "c1", material: "bone" })
      const goldTile = createTile({ card: "c1", material: "gold" })

      // Materials with no multiplier
      expect(getPoints(powerupsDb, playerId, ivoryTile)).toBe(2) // (1 + 0) * 2
      expect(getPoints(powerupsDb, playerId, woodTile)).toBe(4) // (1 + 1) * 2
      expect(getPoints(powerupsDb, playerId, boneTile)).toBe(6) // (1 + 2) * 2
      expect(getPoints(powerupsDb, playerId, goldTile)).toBe(6) // (1 + 2) * 2
    })

    it("applies multipliers correctly for special materials", () => {
      // Test materials with multipliers
      const glassTile = createTile({ card: "c1", material: "glass" })
      const bronzeTile = createTile({ card: "c1", material: "bronze" })
      const jadeTile = createTile({ card: "c1", material: "jade" })

      // Materials with point multipliers
      expect(getPoints(powerupsDb, playerId, glassTile)).toBe(6) // (1 + 1) * (1 + 1)
      expect(getPoints(powerupsDb, playerId, bronzeTile)).toBe(6) // (1 + 1) * (1 + 1)
      expect(getPoints(powerupsDb, playerId, jadeTile)).toBe(16) // (1 + 3) * (1 + 2)
    })

    it("multiplies correctly for high-value cards", () => {
      // Test multiplier materials with a wind card
      const glassWindTile = createTile({ card: "wn", material: "glass" })
      const bronzeWindTile = createTile({ card: "wn", material: "bronze" })
      const jadeWindTile = createTile({ card: "wn", material: "jade" })

      expect(getPoints(powerupsDb, playerId, glassWindTile)).toBe(27) // (8 + 1) * (1 + 1)
      expect(getPoints(powerupsDb, playerId, bronzeWindTile)).toBe(27) // (8 + 1) * (1 + 1)
      expect(getPoints(powerupsDb, playerId, jadeWindTile)).toBe(44) // (8 + 3) * (1 + 2)
    })
  })

  describe("dragon powerups", () => {
    it("applies dragon multipliers to matching suits", () => {
      const circleTile = createTile({ card: "c1", material: "bone" })
      const bambooTile = createTile({ card: "b1", material: "bone" })

      // Add a circle dragon powerup with combo 3
      createDragonPowerup("dc", 3)

      // Circle card matches circle dragon
      expect(getPoints(powerupsDb, playerId, circleTile)).toBe(12)

      // Bamboo card doesn't match circle dragon
      expect(getPoints(powerupsDb, playerId, bambooTile)).toBe(6)
    })

    it("applies different dragons to their matching suits", () => {
      const bambooTile = createTile({ card: "b1", material: "bone" })

      // Add a bamboo dragon powerup with combo 2
      createDragonPowerup("df", 2)

      // Bamboo card matches bamboo dragon
      expect(getPoints(powerupsDb, playerId, bambooTile)).toBe(9)
    })

    it("combines material and dragon multipliers correctly", () => {
      // Set up a circle dragon powerup
      createDragonPowerup("dc", 2)

      // Circle card with jade material
      const jadeCircleTile = createTile({ card: "c1", material: "jade" })

      // Points: card (1) + jade (3) = 4
      // Multipliers: material (2) + dragon (2) = 4
      // Total: 4 * (1 + 4) = 20
      expect(getPoints(powerupsDb, playerId, jadeCircleTile)).toBe(20)
    })
  })
})

describe("deleteTiles", () => {
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
