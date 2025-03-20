import { describe, it, expect, beforeEach } from "vitest"
import {
  cardsMatch,
  deleteTiles,
  gameOverCondition,
  getAvailablePairs,
  getFreeTiles,
  getPoints,
  getRank,
  getStandardDeck,
  getSuit,
  initTileDb,
  isFree,
  mapGet,
  mapGetHeight,
  mapGetLevels,
  mapGetWidth,
  matchesSuit,
  overlaps,
  type Card,
  type Dragon,
  type Game,
  type Tile,
  type TileDb,
  isFlower,
  isSeason,
  isDragon,
  isWind,
  isBam,
  isCrack,
  isDot,
  isRabbit,
  isAnimal,
  isJoker,
  isTransport,
  isPhoenix,
  suitName,
  cardName,
  getMaterial,
  getCardPoints,
  getMaterialPoints,
  getMaterialMultiplier,
  getCoins,
  getMaterialCoins,
  getDragonMultiplier,
  getAnimalMultiplier,
  resolveDragons,
  resolveFlowersAndSeasons,
  resolveAnimals,
  resolveRabbits,
  isTransparent,
  getRunPairs,
  fullyOverlaps,
  getMap,
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
      expect(mapGet(PROGRESSIVE_MAP, 2, 0, 0)).toBe("134")
      expect(mapGet(PROGRESSIVE_MAP, 3, 0, 0)).toBe("134")
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
      expect(cardsMatch("s1", "s4")).toBe(true)
      expect(cardsMatch("s2", "s3")).toBe(true)
      expect(cardsMatch("s3", "s2")).toBe(true)
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

  beforeEach(() => {
    tileDb = initTileDb({})
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

    expect(gameOverCondition(tileDb)).toBe("empty-board")
  })

  it("returns no-pairs when there are no available pairs", () => {
    tileDb = initTileDb({
      "1": createTile({ id: "1", card: "b1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", card: "b2", x: 2, y: 0, z: 0 }),
    })

    expect(gameOverCondition(tileDb)).toBe("no-pairs")
  })
})

describe("getPoints", () => {
  const game: Game = { points: 0 }

  function createDragonPowerup(card: Dragon, combo: number) {
    game.dragonRun = { card, combo }
  }

  it("assigns correct base points to each card type", () => {
    const standardTile = createTile({ card: "c1" })
    const dragonTile = createTile({ card: "dc" })
    const flowerTile = createTile({ card: "f1" })
    const seasonTile = createTile({ card: "s1" })
    const windTile = createTile({ card: "wn" })

    expect(getPoints({ game, tiles: [standardTile] })).toBe(1)
    expect(getPoints({ game, tiles: [dragonTile] })).toBe(0)
    expect(getPoints({ game, tiles: [flowerTile] })).toBe(2)
    expect(getPoints({ game, tiles: [seasonTile] })).toBe(2)
    expect(getPoints({ game, tiles: [windTile] })).toBe(4)
  })

  it("accepts two tiles", () => {
    const boneTile = createTile({ card: "c1", material: "bone" })
    const jadeTile = createTile({ card: "c1", material: "jade" })
    const goldTile = createTile({ card: "c1", material: "gold" })
    const goldWindTile = createTile({ card: "wn", material: "gold" })

    expect(getPoints({ game, tiles: [boneTile, jadeTile] })).toBe(36)
    expect(getPoints({ game, tiles: [goldTile, goldTile] })).toBe(330)
    expect(getPoints({ game, tiles: [goldWindTile, goldWindTile] })).toBe(360)
  })

  it("adds correct point values for different materials", () => {
    const glassTile = createTile({ card: "c1", material: "glass" })
    const jadeTile = createTile({ card: "c1", material: "jade" })
    const bronzeTile = createTile({ card: "c1", material: "bronze" })
    const goldTile = createTile({ card: "c1", material: "gold" })

    expect(getPoints({ game, tiles: [glassTile] })).toBe(9)
    expect(getPoints({ game, tiles: [jadeTile] })).toBe(34)
    expect(getPoints({ game, tiles: [bronzeTile] })).toBe(34)
    expect(getPoints({ game, tiles: [goldTile] })).toBe(99)
  })

  it("applies multipliers correctly for special materials", () => {
    const glassTile = createTile({ card: "c1", material: "glass" })
    const bronzeTile = createTile({ card: "c1", material: "bronze" })
    const jadeTile = createTile({ card: "c1", material: "jade" })

    expect(getPoints({ game, tiles: [glassTile] })).toBe(9)
    expect(getPoints({ game, tiles: [bronzeTile] })).toBe(34)
    expect(getPoints({ game, tiles: [jadeTile] })).toBe(34)
  })

  it("multiplies correctly for high-value cards", () => {
    const glassWindTile = createTile({ card: "wn", material: "glass" })
    const bronzeWindTile = createTile({ card: "wn", material: "bronze" })
    const jadeWindTile = createTile({ card: "wn", material: "jade" })

    expect(getPoints({ game, tiles: [glassWindTile] })).toBe(12)
    expect(getPoints({ game, tiles: [bronzeWindTile] })).toBe(40)
    expect(getPoints({ game, tiles: [jadeWindTile] })).toBe(40)
  })

  it("applies dragon multipliers to matching suits", () => {
    const circleTile = createTile({ card: "c1", material: "bone" })
    const bambooTile = createTile({ card: "b1", material: "bone" })

    createDragonPowerup("dc", 3)

    expect(getPoints({ game, tiles: [circleTile] })).toBe(4)
    expect(getPoints({ game, tiles: [bambooTile] })).toBe(1)
  })

  it("applies different dragons to their matching suits", () => {
    const bambooTile = createTile({ card: "b1", material: "bone" })
    createDragonPowerup("df", 2)

    expect(getPoints({ game, tiles: [bambooTile] })).toBe(3)
  })

  it("combines material and dragon multipliers correctly", () => {
    createDragonPowerup("dc", 2)
    const jadeCircleTile = createTile({ card: "c1", material: "jade" })

    expect(getPoints({ game, tiles: [jadeCircleTile] })).toBe(68)
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

describe("card type checkers", () => {
  it("should correctly identify card types", () => {
    expect(isFlower("f1")).toBe("f1")
    expect(isFlower("b1")).toBeNull()

    expect(isSeason("s1")).toBe("s1")
    expect(isSeason("b1")).toBeNull()

    expect(isDragon("dc")).toBe("dc")
    expect(isDragon("b1")).toBeNull()

    expect(isWind("wn")).toBe("wn")
    expect(isWind("b1")).toBeNull()

    expect(isBam("b1")).toBe("b1")
    expect(isBam("c1")).toBeNull()

    expect(isCrack("c1")).toBe("c1")
    expect(isCrack("b1")).toBeNull()

    expect(isDot("o1")).toBe("o1")
    expect(isDot("b1")).toBeNull()

    expect(isRabbit("r1")).toBe("r1")
    expect(isRabbit("b1")).toBeNull()

    expect(isAnimal("a1")).toBe("a1")
    expect(isAnimal("b1")).toBeNull()

    expect(isJoker("j1")).toBe("j1")
    expect(isJoker("b1")).toBeNull()

    expect(isTransport("tn")).toBe("tn")
    expect(isTransport("b1")).toBeNull()

    expect(isPhoenix("p1")).toBe("p1")
    expect(isPhoenix("b1")).toBeNull()
  })
})

describe("card naming", () => {
  describe("suitName", () => {
    it("should return correct suit names", () => {
      expect(suitName("f1")).toBe("flower")
      expect(suitName("s1")).toBe("season")
      expect(suitName("b1")).toBe("bamb")
      expect(suitName("c1")).toBe("crack")
      expect(suitName("o1")).toBe("dot")
      expect(suitName("dc")).toBe("dragon")
      expect(suitName("wn")).toBe("wind")
      expect(suitName("r1")).toBe("rabbit")
      expect(suitName("p1")).toBe("phoenix")
      expect(suitName("a1")).toBe("animal")
      expect(suitName("j1")).toBe("joker")
      expect(suitName("tn")).toBe("transport")
      expect(suitName("x1")).toBe("unknown") // Uses the dummy suit as an example of "unknown" return
    })
  })

  describe("cardName", () => {
    it("should return correct card names", () => {
      expect(cardName("f1")).toBe("flower 1")
      expect(cardName("s2")).toBe("season 2")
      expect(cardName("b3")).toBe("bamb 3")
      expect(cardName("c4")).toBe("crack 4")
      expect(cardName("o5")).toBe("dot 5")
      expect(cardName("wn")).toBe("wind n")
    })

    it("should handle dragon cards specially", () => {
      expect(cardName("dc")).toBe("crack dragon")
      expect(cardName("df")).toBe("bamb dragon")
      expect(cardName("dp")).toBe("dot dragon")
    })
  })
})

describe("getMaterial", () => {
  it("should return the tile's material when no game is provided", () => {
    const boneTile = createTile({ card: "b1", material: "bone" })
    const jadeTile = createTile({ card: "b1", material: "jade" })

    expect(getMaterial(boneTile)).toBe("bone")
    expect(getMaterial(jadeTile)).toBe("jade")
  })

  it("should return bamboo when flower or season powerup is active", () => {
    const boneTile = createTile({ card: "b1", material: "bone" })
    const jadeTile = createTile({ card: "b1", material: "jade" })
    const game: Game = { points: 0, flowerOrSeason: "f1" }

    expect(getMaterial(boneTile, game)).toBe("bamboo")
    expect(getMaterial(jadeTile, game)).toBe("bamboo")
  })
})

describe("isTransparent", () => {
  it("should identify transparent materials", () => {
    expect(isTransparent("glass")).toBe(true)
    expect(isTransparent("jade")).toBe(true)
    expect(isTransparent("bone")).toBe(false)
    expect(isTransparent("bronze")).toBe(false)
    expect(isTransparent("gold")).toBe(false)
    expect(isTransparent("bamboo")).toBe(false)
  })
})

describe("card points calculations", () => {
  describe("getCardPoints", () => {
    it("should return correct point values for different card types", () => {
      expect(getCardPoints("b1")).toBe(1) // Regular numbered card
      expect(getCardPoints("c5")).toBe(1)
      expect(getCardPoints("o9")).toBe(1)

      expect(getCardPoints("dc")).toBe(0) // Dragon
      expect(getCardPoints("df")).toBe(0)

      expect(getCardPoints("f1")).toBe(2) // Flower
      expect(getCardPoints("s2")).toBe(2) // Season
      expect(getCardPoints("r3")).toBe(2) // Rabbit

      expect(getCardPoints("wn")).toBe(4) // Wind
      expect(getCardPoints("a1")).toBe(4) // Animal

      expect(getCardPoints("j1")).toBe(8) // Joker
      expect(getCardPoints("tn")).toBe(8) // Transport
    })
  })

  describe("getMaterialPoints", () => {
    it("should return correct point values for different materials", () => {
      expect(getMaterialPoints("bone")).toBe(0)
      expect(getMaterialPoints("bamboo")).toBe(4)
      expect(getMaterialPoints("glass")).toBe(8)
      expect(getMaterialPoints("jade")).toBe(16)
      expect(getMaterialPoints("bronze")).toBe(16)
      expect(getMaterialPoints("gold")).toBe(32)
    })
  })

  describe("getMaterialMultiplier", () => {
    it("should return correct multiplier values for different materials", () => {
      expect(getMaterialMultiplier("bone")).toBe(0)
      expect(getMaterialMultiplier("bamboo")).toBe(0)
      expect(getMaterialMultiplier("glass")).toBe(0)
      expect(getMaterialMultiplier("jade")).toBe(1)
      expect(getMaterialMultiplier("bronze")).toBe(1)
      expect(getMaterialMultiplier("gold")).toBe(2)
    })
  })
})

describe("getCoins and getMaterialCoins", () => {
  it("getMaterialCoins should return correct coin values for different materials", () => {
    expect(getMaterialCoins("bone")).toBe(0)
    expect(getMaterialCoins("bamboo")).toBe(0)
    expect(getMaterialCoins("glass")).toBe(0)
    expect(getMaterialCoins("jade")).toBe(0)
    expect(getMaterialCoins("bronze")).toBe(5)
    expect(getMaterialCoins("gold")).toBe(20)
  })

  it("getCoins should calculate coins correctly based on points and materials", () => {
    const boneTile = createTile({ card: "b1", material: "bone" })
    const bronzeTile = createTile({ card: "b1", material: "bronze" })
    const goldTile = createTile({ card: "b1", material: "gold" })
    const game: Game = { points: 0 }

    // Without animal multiplier
    expect(getCoins({ tiles: [boneTile], game, newPoints: 10 })).toBe(0)
    expect(getCoins({ tiles: [bronzeTile], game, newPoints: 10 })).toBe(5)
    expect(getCoins({ tiles: [goldTile], game, newPoints: 10 })).toBe(20)
    expect(
      getCoins({ tiles: [bronzeTile, goldTile], game, newPoints: 10 }),
    ).toBe(25)

    // With animal multiplier
    game.animal = "a1"
    expect(getCoins({ tiles: [boneTile], game, newPoints: 10 })).toBe(10)
    expect(getCoins({ tiles: [bronzeTile], game, newPoints: 10 })).toBe(15)
    expect(getCoins({ tiles: [goldTile], game, newPoints: 10 })).toBe(30)
  })
})

describe("card powerup modifiers", () => {
  describe("getDragonMultiplier", () => {
    it("should return 0 when no dragon run is active", () => {
      const game: Game = { points: 0 }
      expect(getDragonMultiplier(game, "c1")).toBe(0)
    })

    it("should return combo value when matching card is played during a dragon run", () => {
      const game: Game = { points: 0, dragonRun: { card: "dc", combo: 3 } }

      // Dragon "dc" matches crack suit "c"
      expect(getDragonMultiplier(game, "c1")).toBe(3)
      expect(getDragonMultiplier(game, "c5")).toBe(3)

      // Other suits don't match
      expect(getDragonMultiplier(game, "b1")).toBe(0)
      expect(getDragonMultiplier(game, "o1")).toBe(0)
    })

    it("should handle different dragon types correctly", () => {
      const game: Game = { points: 0, dragonRun: { card: "df", combo: 2 } }

      // Dragon "df" matches bamboo suit "b"
      expect(getDragonMultiplier(game, "b1")).toBe(2)
      expect(getDragonMultiplier(game, "c1")).toBe(0)

      game.dragonRun = { card: "dp", combo: 1 }

      // Dragon "dp" matches dot suit "o"
      expect(getDragonMultiplier(game, "o1")).toBe(1)
      expect(getDragonMultiplier(game, "b1")).toBe(0)
    })
  })

  describe("getAnimalMultiplier", () => {
    it("should return 0 when no animal powerup is active", () => {
      const game: Game = { points: 0 }
      expect(getAnimalMultiplier(game)).toBe(0)
    })

    it("should return 1 when animal powerup is active", () => {
      const game: Game = { points: 0, animal: "a1" }
      expect(getAnimalMultiplier(game)).toBe(1)
    })
  })
})

describe("special card resolution functions", () => {
  describe("resolveDragons", () => {
    let game: Game

    beforeEach(() => {
      game = { points: 0 }
    })

    it("should start a new dragon run when a dragon is played", () => {
      const dragonTile = createTile({ card: "dc" })
      resolveDragons(game, dragonTile)

      expect(game.dragonRun).toBeDefined()
      expect(game.dragonRun?.card).toBe("dc")
      expect(game.dragonRun?.combo).toBe(0)
    })

    it("should increment combo when matching card is played during a run", () => {
      game.dragonRun = { card: "dc", combo: 1 }
      const crackTile = createTile({ card: "c5" })

      resolveDragons(game, crackTile)

      expect(game.dragonRun?.combo).toBe(2)
    })

    it("should end the run when non-matching card is played", () => {
      game.dragonRun = { card: "dc", combo: 1 }
      const bambooTile = createTile({ card: "b5" })

      resolveDragons(game, bambooTile)

      expect(game.dragonRun).toBeUndefined()
    })
  })

  describe("resolveFlowersAndSeasons", () => {
    it("should toggle flowerOrSeason flag when a flower is played", () => {
      const game: Game = { points: 0 }

      const flowerTile = createTile({ card: "f1" })
      resolveFlowersAndSeasons(game, flowerTile)
      expect(game.flowerOrSeason).toBe("f1")

      const seasonTile = createTile({ card: "s1" })
      resolveFlowersAndSeasons(game, seasonTile)
      expect(game.flowerOrSeason).toBe("s1")
    })

    it("should toggle flowerOrSeason flag when a season is played", () => {
      const game: Game = { points: 0 }

      const seasonTile = createTile({ card: "s1" })
      resolveFlowersAndSeasons(game, seasonTile)
      expect(game.flowerOrSeason).toBe("s1")
    })

    it("should not change the flag for other card types", () => {
      const game: Game = { points: 0 }

      const bambooTile = createTile({ card: "b1" })
      resolveFlowersAndSeasons(game, bambooTile)
      expect(game.flowerOrSeason).toBeUndefined()
    })
  })

  describe("resolveAnimals", () => {
    it("should set animal flag when an animal card is played", () => {
      const game: Game = { points: 0 }

      const animalTile = createTile({ card: "a1" })
      resolveAnimals(game, animalTile)
      expect(game.animal).toBe("a1")
    })

    it("should not change the flag for other card types", () => {
      const game: Game = { points: 0 }

      const bambooTile = createTile({ card: "b1" })
      resolveAnimals(game, bambooTile)
      expect(game.animal).toBeUndefined()
    })
  })

  describe("resolveRabbits", () => {
    it("should start a rabbit combo when a rabbit is played", () => {
      const game: Game = { points: 0 }

      const rabbitTile = createTile({ card: "r1" })
      resolveRabbits(game, rabbitTile)

      expect(game.rabbit).toBeDefined()
      expect(game.rabbit?.combo).toBe(0)
      expect(typeof game.rabbit?.timestamp).toBe("number")
    })
  })
})

describe("getRunPairs", () => {
  it("should return correct number of pairs", () => {
    const pairs = getRunPairs()
    // Regular tiles: 9 bams + 9 cracks + 9 dots + 4 winds + 3 dragons = 34 types
    // One pair each = 34 pairs
    expect(pairs.length).toBe(34)
  })

  it("should include regular tiles as pairs", () => {
    const pairs = getRunPairs()

    // Check for some sample cards
    expect(pairs.some(([a, b]) => a === "b1" && b === "b1")).toBe(true)
    expect(pairs.some(([a, b]) => a === "c5" && b === "c5")).toBe(true)
    expect(pairs.some(([a, b]) => a === "o9" && b === "o9")).toBe(true)
    expect(pairs.some(([a, b]) => a === "wn" && b === "wn")).toBe(true)
    expect(pairs.some(([a, b]) => a === "dc" && b === "dc")).toBe(true)
  })
})

describe("fullyOverlaps", () => {
  let db: TileDb

  beforeEach(() => {
    db = initTileDb({
      "1": createTile({ id: "1", card: "b1", x: 2, y: 2, z: 0 }),
      "2": createTile({ id: "2", card: "b2", x: 1, y: 1, z: 0 }),
      "3": createTile({ id: "3", card: "b3", x: 3, y: 3, z: 0 }),
    })
  })

  it("should detect when a position is fully overlapped", () => {
    // Tile fully covered by other tiles
    expect(fullyOverlaps(db, { x: 2, y: 2, z: 0 }, 0)).toBe(true)
  })

  it("should detect when a position is not fully overlapped", () => {
    // Tile with only partial overlap
    expect(fullyOverlaps(db, { x: 4, y: 2, z: 0 }, 0)).toBe(false)
    expect(fullyOverlaps(db, { x: 0, y: 0, z: 0 }, 0)).toBe(false)
  })
})

describe("getMap", () => {
  it("should limit tiles based on the count parameter", () => {
    // This test is a simplified version as we don't know the full structure of PROGRESSIVE_MAP
    const map50 = getMap(50)
    const map100 = getMap(100)

    // Map with higher tile count should have more non-null values
    const countNonNull = (map: any) => {
      let count = 0
      for (const level of map) {
        for (const row of level) {
          for (const tile of row) {
            if (tile !== null) count++
          }
        }
      }
      return count
    }

    expect(countNonNull(map50)).toBeLessThanOrEqual(countNonNull(map100))
  })
})
