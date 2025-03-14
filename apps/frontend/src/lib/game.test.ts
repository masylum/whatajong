import { describe, it, expect, beforeEach } from "vitest"
import {
  cardsMatch,
  deleteTiles,
  gameOverCondition,
  getAvailablePairs,
  getFreeTiles,
  getPoints,
  getPowerups,
  getRank,
  getStandardDeck,
  getSuit,
  initPowerupsDb,
  initTileDb,
  isFree,
  mapGet,
  mapGetHeight,
  mapGetLevels,
  mapGetWidth,
  matchesSuit,
  overlaps,
  type Card,
  type Dragons,
  type PowerupDb,
  type Tile,
  type TileDb,
} from "./game"
import { PROGRESSIVE_MAP } from "./maps/progressive"

function createTile({
  card,
  id = "1",
  material = "bone",
  x = 0,
  y = 0,
  z = 0,
  deleted = false,
  selected = false,
}: Partial<Tile> & { card: Card }): Tile {
  return { id, card, material, x, y, z, deleted, selected }
}

describe("map", () => {
  describe("mapGet", () => {
    it("should return null for negative coordinates", () => {
      expect(mapGet(PROGRESSIVE_MAP, -1, 0, 0)).toBeNull()
      expect(mapGet(PROGRESSIVE_MAP, 0, -1, 0)).toBeNull()
      expect(mapGet(PROGRESSIVE_MAP, 0, 0, -1)).toBeNull()
    })

    it("should return null for out of bounds coordinates", () => {
      expect(mapGet(PROGRESSIVE_MAP, mapGetWidth(), 0, 0)).toBeNull()
      expect(mapGet(PROGRESSIVE_MAP, 0, mapGetHeight(), 0)).toBeNull()
      expect(mapGet(PROGRESSIVE_MAP, 0, 0, mapGetLevels())).toBeNull()
    })

    it("should return null for empty spaces", () => {
      expect(mapGet(PROGRESSIVE_MAP, 0, 0, 0)).toBeNull()
    })

    it("should return tile id as string for valid positions", () => {
      expect(mapGet(PROGRESSIVE_MAP, 2, 0, 0)).toBe("12")
      expect(mapGet(PROGRESSIVE_MAP, 3, 0, 0)).toBe("12")
    })
  })
})

describe("deck", () => {
  it("should generate correct number of pairs", () => {
    const deck = getStandardDeck()

    expect(deck.length).toBe(144 / 2)
  })

  describe("card utility functions", () => {
    it("should extract suit correctly", () => {
      expect(getSuit("b1")).toBe("b")
      expect(getSuit("c5")).toBe("c")
      expect(getSuit("wn")).toBe("w")
      expect(getSuit("dc")).toBe("d")
    })

    it("should extract number correctly", () => {
      expect(getRank("b1")).toBe("1")
      expect(getRank("c5")).toBe("5")
      expect(getRank("wn")).toBe("n")
      expect(getRank("dc")).toBe("c")
    })

    it("should match suits correctly", () => {
      expect(matchesSuit("b1", "b")).toBe(true)
      expect(matchesSuit("c5", "b")).toBe(false)
      expect(matchesSuit("wn", "w")).toBe(true)
      expect(matchesSuit("dc", "c")).toBe(false)
    })
  })

  describe("cardsMatch", () => {
    it("should match identical cards", () => {
      expect(cardsMatch("b1", "b1")).toBe(true)
      expect(cardsMatch("c5", "c5")).toBe(true)
      expect(cardsMatch("wn", "wn")).toBe(true)
      expect(cardsMatch("dc", "dc")).toBe(true)
    })

    it("should match any flower with any flower", () => {
      expect(cardsMatch("f1", "f2")).toBe(true)
      expect(cardsMatch("f2", "f3")).toBe(true)
      expect(cardsMatch("f3", "f4")).toBe(true)
      expect(cardsMatch("f4", "f1")).toBe(true)
    })

    it("should match any season with any season", () => {
      expect(cardsMatch("s1", "s2")).toBe(true)
      expect(cardsMatch("s2", "s3")).toBe(true)
      expect(cardsMatch("s3", "s4")).toBe(true)
      expect(cardsMatch("s4", "s1")).toBe(true)
    })

    it("should not match different non-flower/season cards", () => {
      expect(cardsMatch("b1", "b2")).toBe(false)
      expect(cardsMatch("c5", "c6")).toBe(false)
      expect(cardsMatch("wn", "ws")).toBe(false)
      expect(cardsMatch("dc", "df")).toBe(false)
    })

    it("should not match cards of different types", () => {
      expect(cardsMatch("b1", "c1")).toBe(false)
      expect(cardsMatch("f1", "s1")).toBe(false)
      expect(cardsMatch("wn", "dc")).toBe(false)
    })
  })
})

describe("game", () => {
  describe("getFreeTiles", () => {
    let db: TileDb

    beforeEach(() => {
      db = initTileDb({
        "1": createTile({ id: "1", card: "b1", x: 0, y: 0, z: 0 }), // covered by "5"
        "2": createTile({ id: "2", card: "b2", x: 2, y: 0, z: 0 }), // blocked
        "3": createTile({ id: "3", card: "b3", x: 4, y: 0, z: 0 }),
        "4": createTile({ id: "4", card: "b4", x: 0, y: 2, z: 0 }),
        "5": createTile({ id: "5", card: "b5", x: 0, y: 0, z: 1 }),
      })
    })

    it("returns tiles that are not covered nor blocked", () => {
      const ids = getFreeTiles(db).map((t) => t.id)
      expect(ids).toEqual(["3", "4", "5"])
    })

    it("does not return deleted tiles", () => {
      deleteTiles(db, [db.get("5")!])
      const ids = getFreeTiles(db).map((t) => t.id)
      expect(ids).toEqual(["1", "3", "4"])
    })
  })

  describe("getAvailablePairs", () => {
    let db: TileDb

    it("should find matching free pairs", () => {
      db = initTileDb({
        "1": createTile({ id: "1", card: "b1", x: 0, y: 0, z: 0 }),
        "2": createTile({ id: "2", card: "b2", x: 2, y: 0, z: 0 }), // blocked
        "3": createTile({ id: "3", card: "b4", x: 4, y: 0, z: 0 }),
        "4": createTile({ id: "4", card: "b4", x: 0, y: 2, z: 0 }),
        "5": createTile({ id: "5", card: "b5", x: 0, y: 0, z: 1 }), // covering "1"
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

  it("returns empty-board when no tiles are alive", () => {
    const tiles = Array.from({ length: 2 }, (_, i) =>
      createTile({
        id: String(i + 1),
        card: "b1" as Card,
        x: i * 2,
        deleted: true,
      }),
    )
    tileDb = initTileDb(
      Object.fromEntries(tiles.map((tile) => [tile.id, tile])),
    )

    expect(gameOverCondition(tileDb, powerupsDb)).toBe("empty-board")
  })

  it("returns no-pairs when there are no available pairs", () => {
    tileDb = initTileDb({
      "1": createTile({ id: "1", card: "b1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", card: "b2", x: 2, y: 0, z: 0 }),
    })

    expect(gameOverCondition(tileDb, powerupsDb)).toBe("no-pairs")
  })
})

describe("getPoints", () => {
  let powerupsDb: PowerupDb

  function createDragonPowerup(dragonCard: Dragons, combo: number) {
    const id = `dragon-${dragonCard}`
    powerupsDb.set(id, {
      id,
      card: dragonCard,
      combo,
    })
    return id
  }

  beforeEach(() => {
    powerupsDb = initPowerupsDb({})
  })

  it("assigns correct base points to each card type", () => {
    const standardTile = createTile({ card: "c1" })
    const dragonTile = createTile({ card: "dc" })
    const flowerTile = createTile({ card: "f1" })
    const seasonTile = createTile({ card: "s1" })
    const windTile = createTile({ card: "wn" })

    expect(getPoints(powerupsDb, [standardTile])).toBe(2)
    expect(getPoints(powerupsDb, [dragonTile])).toBe(4)
    expect(getPoints(powerupsDb, [flowerTile])).toBe(8)
    expect(getPoints(powerupsDb, [seasonTile])).toBe(8)
    expect(getPoints(powerupsDb, [windTile])).toBe(16)
  })

  it("accepts two tiles", () => {
    const boneTile = createTile({ card: "c1", material: "bone" })
    const jadeTile = createTile({ card: "c1", material: "jade" })

    expect(getPoints(powerupsDb, [boneTile, jadeTile])).toBe(8)
  })

  it("adds correct point values for different materials", () => {
    const glassTile = createTile({ card: "c1", material: "glass" })
    const jadeTile = createTile({ card: "c1", material: "jade" })
    const bronzeTile = createTile({ card: "c1", material: "bronze" })
    const goldTile = createTile({ card: "c1", material: "gold" })

    expect(getPoints(powerupsDb, [glassTile])).toBe(4)
    expect(getPoints(powerupsDb, [jadeTile])).toBe(20)
    expect(getPoints(powerupsDb, [bronzeTile])).toBe(9)
    expect(getPoints(powerupsDb, [goldTile])).toBe(45)
  })

  it("applies multipliers correctly for special materials", () => {
    const glassTile = createTile({ card: "c1", material: "glass" })
    const bronzeTile = createTile({ card: "c1", material: "bronze" })
    const jadeTile = createTile({ card: "c1", material: "jade" })

    expect(getPoints(powerupsDb, [glassTile])).toBe(4)
    expect(getPoints(powerupsDb, [bronzeTile])).toBe(9)
    expect(getPoints(powerupsDb, [jadeTile])).toBe(20)
  })

  it("multiplies correctly for high-value cards", () => {
    const glassWindTile = createTile({ card: "wn", material: "glass" })
    const bronzeWindTile = createTile({ card: "wn", material: "bronze" })
    const jadeWindTile = createTile({ card: "wn", material: "jade" })

    expect(getPoints(powerupsDb, [glassWindTile])).toBe(18)
    expect(getPoints(powerupsDb, [bronzeWindTile])).toBe(30)
    expect(getPoints(powerupsDb, [jadeWindTile])).toBe(48)
  })

  it("applies dragon multipliers to matching suits", () => {
    const circleTile = createTile({ card: "c1", material: "bone" })
    const bambooTile = createTile({ card: "b1", material: "bone" })

    createDragonPowerup("dc", 3)

    expect(getPoints(powerupsDb, [circleTile])).toBe(5)
    expect(getPoints(powerupsDb, [bambooTile])).toBe(2)
  })

  it("applies different dragons to their matching suits", () => {
    const bambooTile = createTile({ card: "b1", material: "bone" })
    createDragonPowerup("df", 2)

    expect(getPoints(powerupsDb, [bambooTile])).toBe(4)
  })

  it("combines material and dragon multipliers correctly", () => {
    createDragonPowerup("dc", 2)
    const jadeCircleTile = createTile({ card: "c1", material: "jade" })

    expect(getPoints(powerupsDb, [jadeCircleTile])).toBe(25)
  })
})

describe("deleteTiles", () => {
  it("should mark tile as deleted", () => {
    const db = initTileDb({
      "1": createTile({ id: "1", card: "b1" }),
    })
    const tile = db.get("1")!
    deleteTiles(db, [tile])
    expect(db.get("1")!.deleted).toBe(true)
  })

  it("should delete selection", () => {
    const db = initTileDb({
      "1": createTile({ id: "1", card: "b1" }),
    })
    const tile = db.get("1")!
    deleteTiles(db, [tile])
    expect(tile.selected).toBe(false)
    expect(tile.deleted).toBe(true)
  })
})

describe("powerups", () => {
  let powerupsDb: PowerupDb

  beforeEach(() => {
    powerupsDb = initPowerupsDb({})
  })

  describe("starting with no powerups", () => {
    it("should add a dragon powerup when playing a dragon", () => {
      getPowerups(powerupsDb, createTile({ card: "dc" }))
      const powerups = powerupsDb.all
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("dc")
      expect(powerups[0]?.combo).toBe(0)
    })

    it("should add a joker powerup when playing a flower", () => {
      getPowerups(powerupsDb, createTile({ card: "f1" }))
      const powerups = powerupsDb.all
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("f1")
      expect(powerups[0]?.combo).toBe(0)
    })

    it("should add a joker powerup when playing a season", () => {
      getPowerups(powerupsDb, createTile({ card: "s1" }))
      const powerups = powerupsDb.all
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("s1")
      expect(powerups[0]?.combo).toBe(0)
    })
  })

  describe("with dragon powerup", () => {
    beforeEach(() => {
      getPowerups(powerupsDb, createTile({ card: "dc" }))
    })

    it("should increase combo when playing matching suit", () => {
      getPowerups(powerupsDb, createTile({ card: "c1" }))
      const powerups = powerupsDb.all
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("dc")
      expect(powerups[0]?.combo).toBe(1)
    })

    it("should remove dragon when playing non-matching suit", () => {
      getPowerups(powerupsDb, createTile({ card: "b1" }))
      const powerups = powerupsDb.all
      expect(powerups).toHaveLength(0)
    })

    it("should replace dragon when playing another dragon", () => {
      getPowerups(powerupsDb, createTile({ card: "df" }))
      const powerups = powerupsDb.all
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("df")
      expect(powerups[0]?.combo).toBe(0)
    })

    it("should add joker and increase combo when playing flower", () => {
      getPowerups(powerupsDb, createTile({ card: "f1" }))
      const powerups = powerupsDb.all
      expect(powerups).toHaveLength(2)
      expect(powerups.find((p) => p.card === "dc")?.combo).toBe(1)
      expect(powerups.find((p) => p.card === "f1")).toBeTruthy()
    })

    it("should add joker and increase combo when playing season", () => {
      getPowerups(powerupsDb, createTile({ card: "s1" }))
      const powerups = powerupsDb.all
      expect(powerups).toHaveLength(2)
      expect(powerups.find((p) => p.card === "dc")?.combo).toBe(1)
      expect(powerups.find((p) => p.card === "s1")).toBeTruthy()
    })
  })

  describe("with joker powerup", () => {
    beforeEach(() => {
      getPowerups(powerupsDb, createTile({ card: "f1" }))
    })

    it("should replace joker when playing another joker", () => {
      getPowerups(powerupsDb, createTile({ card: "s1" }))
      const powerups = powerupsDb.all
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("s1")
      expect(powerups[0]?.combo).toBe(0)
    })

    it("should remove joker and add dragon when playing dragon", () => {
      getPowerups(powerupsDb, createTile({ card: "dc" }))
      const powerups = powerupsDb.all
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("dc")
      expect(powerups[0]?.combo).toBe(0)
    })

    it("should remove joker when playing regular tile", () => {
      getPowerups(powerupsDb, createTile({ card: "c1" }))
      const powerups = powerupsDb.all
      expect(powerups).toHaveLength(0)
    })
  })

  describe("with both dragon and joker", () => {
    beforeEach(() => {
      getPowerups(powerupsDb, createTile({ card: "dc" }))
      getPowerups(powerupsDb, createTile({ card: "f1" }))
    })

    it("should remove both when playing non-matching suit", () => {
      getPowerups(powerupsDb, createTile({ card: "b1" }))
      const powerups = powerupsDb.all
      expect(powerups).toHaveLength(0)
    })

    it("should remove joker and increase combo when playing matching suit", () => {
      getPowerups(powerupsDb, createTile({ card: "c1" }))
      const powerups = powerupsDb.all
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("dc")
      expect(powerups[0]?.combo).toBe(2)
    })

    it("should replace joker and increase combo when playing another joker", () => {
      getPowerups(powerupsDb, createTile({ card: "s1" }))
      const powerups = powerupsDb.all
      expect(powerups).toHaveLength(2)
      expect(powerups.find((p) => p.card === "dc")?.combo).toBe(2)
      expect(powerups.find((p) => p.card === "s1")).toBeTruthy()
    })

    it("should replace dragon and remove joker when playing another dragon", () => {
      getPowerups(powerupsDb, createTile({ card: "df" }))
      const powerups = powerupsDb.all
      expect(powerups).toHaveLength(1)
      expect(powerups[0]?.card).toBe("df")
      expect(powerups[0]?.combo).toBe(0)
    })
  })
})

describe("tile", () => {
  describe("initTileDb", () => {
    it("initializes empty database", () => {
      const db = initTileDb({})
      expect(db.size).toBe(0)
    })

    it("initializes database with tiles", () => {
      const db = initTileDb({
        "1": createTile({ id: "1", card: "b1" }),
        "2": createTile({ id: "2", card: "b2", x: 1, y: 0, z: 0 }),
      })
      expect(db.size).toBe(2)
    })
  })

  describe("overlaps", () => {
    let db: TileDb
    let tile: Tile

    beforeEach(() => {
      db = initTileDb({
        "1": createTile({ id: "1", card: "b1", x: 2, y: 2, z: 0 }),
        "2": createTile({ id: "2", card: "b2", x: 2, y: 2, z: 1 }),
        "3": createTile({ id: "3", card: "b3", x: 2, y: 2, z: -1 }),
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
        "1": createTile({ id: "1", card: "b1", x: 0, y: 0, z: 0 }), // covered by "5"
        "2": createTile({ id: "2", card: "b2", x: 2, y: 0, z: 0 }), // blocked
        "3": createTile({ id: "3", card: "b3", x: 4, y: 0, z: 0 }),
        "4": createTile({ id: "4", card: "b4", x: 0, y: 2, z: 0 }),
        "5": createTile({ id: "5", card: "b5", x: 0, y: 0, z: 1 }),
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
})
