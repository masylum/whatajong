import { beforeEach, describe, expect, it } from "vitest"
import { initPowerupsDb, type PowerupDb } from "./powerups"
import type { Tile } from "./tile"
import { getPowerups, getPointsWithCombo } from "./powerups"
import type { Card } from "./deck"

describe("powerups", () => {
  const playerId = "player1"
  let powerupsDb: PowerupDb

  function createTile(card: Card): Tile {
    return { id: "tile1", card, x: 0, y: 0, z: 0, selections: [] }
  }

  beforeEach(() => {
    powerupsDb = initPowerupsDb({})
  })

  describe("starting with no powerups", () => {
    it("should add a dragon powerup when playing a dragon", () => {
      getPowerups(powerupsDb, playerId, createTile("dc"))
      const powerups = powerupsDb.filterBy({ playerId })
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("dc")
      expect(powerups[0]?.combo).toBe(0)
    })

    it("should add a joker powerup when playing a flower", () => {
      getPowerups(powerupsDb, playerId, createTile("f1"))
      const powerups = powerupsDb.filterBy({ playerId })
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("f1")
      expect(powerups[0]?.combo).toBe(0)
    })

    it("should add a joker powerup when playing a season", () => {
      getPowerups(powerupsDb, playerId, createTile("s1"))
      const powerups = powerupsDb.filterBy({ playerId })
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("s1")
      expect(powerups[0]?.combo).toBe(0)
    })
  })

  describe("with dragon powerup", () => {
    beforeEach(() => {
      getPowerups(powerupsDb, playerId, createTile("dc"))
    })

    it("should increase combo when playing matching suit", () => {
      getPowerups(powerupsDb, playerId, createTile("c1"))
      const powerups = powerupsDb.filterBy({ playerId })
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("dc")
      expect(powerups[0]?.combo).toBe(1)
    })

    it("should remove dragon when playing non-matching suit", () => {
      getPowerups(powerupsDb, playerId, createTile("b1"))
      const powerups = powerupsDb.filterBy({ playerId })
      expect(powerups).toHaveLength(0)
    })

    it("should replace dragon when playing another dragon", () => {
      getPowerups(powerupsDb, playerId, createTile("df"))
      const powerups = powerupsDb.filterBy({ playerId })
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("df")
      expect(powerups[0]?.combo).toBe(0)
    })

    it("should add joker and increase combo when playing flower", () => {
      getPowerups(powerupsDb, playerId, createTile("f1"))
      const powerups = powerupsDb.filterBy({ playerId })
      expect(powerups).toHaveLength(2)
      expect(powerups.find((p) => p.card === "dc")?.combo).toBe(1)
      expect(powerups.find((p) => p.card === "f1")).toBeTruthy()
    })

    it("should add joker and increase combo when playing season", () => {
      getPowerups(powerupsDb, playerId, createTile("s1"))
      const powerups = powerupsDb.filterBy({ playerId })
      expect(powerups).toHaveLength(2)
      expect(powerups.find((p) => p.card === "dc")?.combo).toBe(1)
      expect(powerups.find((p) => p.card === "s1")).toBeTruthy()
    })
  })

  describe("with joker powerup", () => {
    beforeEach(() => {
      getPowerups(powerupsDb, playerId, createTile("f1"))
    })

    it("should replace joker when playing another joker", () => {
      getPowerups(powerupsDb, playerId, createTile("s1"))
      const powerups = powerupsDb.filterBy({ playerId })
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("s1")
      expect(powerups[0]?.combo).toBe(0)
    })

    it("should remove joker and add dragon when playing dragon", () => {
      getPowerups(powerupsDb, playerId, createTile("dc"))
      const powerups = powerupsDb.filterBy({ playerId })
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("dc")
      expect(powerups[0]?.combo).toBe(0)
    })

    it("should remove joker when playing regular tile", () => {
      getPowerups(powerupsDb, playerId, createTile("c1"))
      const powerups = powerupsDb.filterBy({ playerId })
      expect(powerups).toHaveLength(0)
    })
  })

  describe("with both dragon and joker", () => {
    beforeEach(() => {
      getPowerups(powerupsDb, playerId, createTile("dc"))
      getPowerups(powerupsDb, playerId, createTile("f1"))
    })

    it("should remove both when playing non-matching suit", () => {
      getPowerups(powerupsDb, playerId, createTile("b1"))
      const powerups = powerupsDb.filterBy({ playerId })
      expect(powerups).toHaveLength(0)
    })

    it("should remove joker and increase combo when playing matching suit", () => {
      getPowerups(powerupsDb, playerId, createTile("c1"))
      const powerups = powerupsDb.filterBy({ playerId })
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("dc")
      expect(powerups[0]?.combo).toBe(2)
    })

    it("should replace joker and increase combo when playing another joker", () => {
      getPowerups(powerupsDb, playerId, createTile("s1"))
      const powerups = powerupsDb.filterBy({ playerId })
      expect(powerups).toHaveLength(2)
      expect(powerups.find((p) => p.card === "dc")?.combo).toBe(2)
      expect(powerups.find((p) => p.card === "s1")).toBeTruthy()
    })

    it("should replace dragon and remove joker when playing another dragon", () => {
      getPowerups(powerupsDb, playerId, createTile("df"))
      const powerups = powerupsDb.filterBy({ playerId })
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("df")
      expect(powerups[0]?.combo).toBe(0)
    })
  })

  describe("points calculation", () => {
    it("should return base points with no powerup", () => {
      const points = getPointsWithCombo(powerupsDb, playerId, createTile("c1"))
      expect(points).toBe(2)
    })

    it("should multiply points by combo multiplier with matching dragon", () => {
      getPowerups(powerupsDb, playerId, createTile("dc"))
      getPowerups(powerupsDb, playerId, createTile("c1")) // combo 1
      getPowerups(powerupsDb, playerId, createTile("c2")) // combo 2
      const points = getPointsWithCombo(powerupsDb, playerId, createTile("c3"))
      expect(points).toBe(8)
    })

    it("should not multiply points with non-matching dragon", () => {
      getPowerups(powerupsDb, playerId, createTile("dc"))
      const points = getPointsWithCombo(powerupsDb, playerId, createTile("b1"))
      expect(points).toBe(2)
    })
  })
})
