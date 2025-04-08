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
  isJoker,
  isTransport,
  isPhoenix,
  suitName,
  getMaterial,
  getCardPoints,
  getMaterialCoins,
  resolveFlowersAndSeasons,
  isTransparent,
  getRunPairs,
  fullyOverlaps,
  getMap,
  selectTile,
  getCoins,
} from "./game"
import { createTile } from "./test/utils"
import { PROGRESSIVE_MAP } from "./maps/progressive"

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
      expect(cardsMatch("dc", "db")).toBe(false)
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

    expect(getPoints({ game, tiles: [boneTile, jadeTile] })).toBe(102)
    expect(getPoints({ game, tiles: [goldTile, goldTile] })).toBe(170)
    expect(getPoints({ game, tiles: [goldWindTile, goldWindTile] })).toBe(200)
    expect(getPoints({ game, tiles: [jadeTile, jadeTile] })).toBe(330)
  })

  it("adds correct point values for different materials", () => {
    const glassTile = createTile({ card: "c1", material: "glass" })
    const diamondTile = createTile({ card: "c1", material: "diamond" })
    const ivoryTile = createTile({ card: "c1", material: "ivory" })
    const jadeTile = createTile({ card: "c1", material: "jade" })
    const bronzeTile = createTile({ card: "c1", material: "bronze" })
    const goldTile = createTile({ card: "c1", material: "gold" })

    expect(getPoints({ game, tiles: [glassTile] })).toBe(7.5)
    expect(getPoints({ game, tiles: [diamondTile] })).toBe(51)
    expect(getPoints({ game, tiles: [ivoryTile] })).toBe(13.5)
    expect(getPoints({ game, tiles: [jadeTile] })).toBe(99)
    expect(getPoints({ game, tiles: [bronzeTile] })).toBe(7.5)
    expect(getPoints({ game, tiles: [goldTile] })).toBe(51)
  })

  it("applies multipliers correctly for special materials", () => {
    const glassTile = createTile({ card: "c1", material: "glass" })
    const diamondTile = createTile({ card: "c1", material: "diamond" })
    const ivoryTile = createTile({ card: "c1", material: "ivory" })
    const jadeTile = createTile({ card: "c1", material: "jade" })
    const bronzeTile = createTile({ card: "c1", material: "bronze" })
    const goldTile = createTile({ card: "c1", material: "gold" })

    expect(getPoints({ game, tiles: [glassTile] })).toBe(7.5)
    expect(getPoints({ game, tiles: [diamondTile] })).toBe(51)
    expect(getPoints({ game, tiles: [ivoryTile] })).toBe(13.5)
    expect(getPoints({ game, tiles: [jadeTile] })).toBe(99)
    expect(getPoints({ game, tiles: [bronzeTile] })).toBe(7.5)
    expect(getPoints({ game, tiles: [goldTile] })).toBe(51)
  })

  it("multiplies correctly for high-value cards", () => {
    const glassWindTile = createTile({ card: "wn", material: "glass" })
    const diamondWindTile = createTile({ card: "wn", material: "diamond" })
    const bronzeWindTile = createTile({ card: "wn", material: "bronze" })
    const goldWindTile = createTile({ card: "wn", material: "gold" })
    const ivoryWindTile = createTile({ card: "wn", material: "ivory" })
    const jadeWindTile = createTile({ card: "wn", material: "jade" })

    expect(getPoints({ game, tiles: [glassWindTile] })).toBe(12)
    expect(getPoints({ game, tiles: [diamondWindTile] })).toBe(60)
    expect(getPoints({ game, tiles: [bronzeWindTile] })).toBe(12)
    expect(getPoints({ game, tiles: [goldWindTile] })).toBe(60)
    expect(getPoints({ game, tiles: [ivoryWindTile] })).toBe(18)
    expect(getPoints({ game, tiles: [jadeWindTile] })).toBe(108)
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
    createDragonPowerup("db", 2)

    expect(getPoints({ game, tiles: [bambooTile] })).toBe(3)
  })

  it("combines material and dragon multipliers correctly", () => {
    createDragonPowerup("dc", 2)
    const jadeCircleTile = createTile({ card: "c1", material: "jade" })

    expect(getPoints({ game, tiles: [jadeCircleTile] })).toBe(165)
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

    expect(isJoker("j1")).toBe("j1")
    expect(isJoker("b1")).toBeNull()

    expect(isTransport("tn")).toBe("tn")
    expect(isTransport("b1")).toBeNull()

    expect(isPhoenix("pb")).toBe("pb")
    expect(isPhoenix("b1")).toBeNull()
  })
})

describe("card naming", () => {
  describe("suitName", () => {
    it("should return correct suit names", () => {
      expect(suitName("f1")).toBe("flower")
      expect(suitName("s1")).toBe("season")
      expect(suitName("b1")).toBe("bam")
      expect(suitName("c1")).toBe("crack")
      expect(suitName("o1")).toBe("dot")
      expect(suitName("dc")).toBe("dragon")
      expect(suitName("wn")).toBe("wind")
      expect(suitName("r1")).toBe("rabbit")
      expect(suitName("pb")).toBe("phoenix")
      expect(suitName("j1")).toBe("joker")
      expect(suitName("tn")).toBe("transport")
    })
  })
})

describe("getMaterial", () => {
  it("should return the tile's material when no game is provided", () => {
    const boneTile = createTile({ id: "1", card: "b1", material: "bone" })
    const jadeTile = createTile({ id: "2", card: "b1", material: "jade" })
    const tileDb = initTileDb({ "1": boneTile, "2": jadeTile })

    expect(getMaterial(tileDb, boneTile)).toBe("bone")
    expect(getMaterial(tileDb, jadeTile)).toBe("jade")
  })

  it("should return wood when flower or season powerup is active and the tile is free", () => {
    const boneTile = createTile({ id: "1", card: "b1", material: "bone", x: 0 })
    const jadeTile = createTile({ id: "2", card: "b1", material: "jade", x: 2 })
    const game: Game = { points: 0, flowerOrSeason: "f1" }
    const tileDb = initTileDb({ "1": boneTile, "2": jadeTile })

    expect(getMaterial(tileDb, boneTile, game)).toBe("wood")
    expect(getMaterial(tileDb, jadeTile, game)).toBe("wood")
  })
})

describe("isTransparent", () => {
  it("should identify transparent materials", () => {
    expect(isTransparent("glass")).toBe(true)
    expect(isTransparent("jade")).toBe(false)
    expect(isTransparent("bone")).toBe(false)
    expect(isTransparent("bronze")).toBe(false)
    expect(isTransparent("gold")).toBe(false)
    expect(isTransparent("wood")).toBe(false)
    expect(isTransparent("ivory")).toBe(false)
    expect(isTransparent("diamond")).toBe(true)
  })
})

describe("card points calculations", () => {
  describe("getCardPoints", () => {
    it("should return correct point values for different card types", () => {
      expect(getCardPoints("b1")).toBe(1) // Regular numbered card
      expect(getCardPoints("c5")).toBe(1)
      expect(getCardPoints("o9")).toBe(1)

      expect(getCardPoints("dc")).toBe(0) // Dragon
      expect(getCardPoints("db")).toBe(0)
      expect(getCardPoints("do")).toBe(0)

      expect(getCardPoints("f1")).toBe(2) // Flower
      expect(getCardPoints("s2")).toBe(2) // Season
      expect(getCardPoints("r3")).toBe(2) // Rabbit

      expect(getCardPoints("wn")).toBe(4) // Wind

      expect(getCardPoints("j1")).toBe(8) // Joker
      expect(getCardPoints("tn")).toBe(8) // Transport
    })
  })
})

describe("getCoins and getMaterialCoins", () => {
  it("getMaterialCoins should return correct coin values for different materials", () => {
    expect(getMaterialCoins("bone")).toBe(0)
    expect(getMaterialCoins("wood")).toBe(0)
    expect(getMaterialCoins("glass")).toBe(0)
    expect(getMaterialCoins("jade")).toBe(5)
    expect(getMaterialCoins("bronze")).toBe(5)
    expect(getMaterialCoins("gold")).toBe(20)
  })
})

describe("special card resolution functions", () => {
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
})

describe("getRunPairs", () => {
  it("should return correct number of pairs", () => {
    const pairs = getRunPairs()
    expect(pairs.length).toBe(34)
  })

  it("should include regular tiles as pairs", () => {
    const pairs = getRunPairs()

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
    expect(fullyOverlaps(db, { x: 2, y: 2, z: 0 }, 0)).toBe(true)
  })

  it("should detect when a position is not fully overlapped", () => {
    expect(fullyOverlaps(db, { x: 4, y: 2, z: 0 }, 0)).toBe(false)
    expect(fullyOverlaps(db, { x: 0, y: 0, z: 0 }, 0)).toBe(false)
  })
})

describe("getMap", () => {
  it("should limit tiles based on the count parameter", () => {
    const map50 = getMap(50)
    const map100 = getMap(100)

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

describe("selectTile", () => {
  let tileDb: TileDb
  let game: Game

  beforeEach(() => {
    game = { points: 0 }
    tileDb = initTileDb({
      "1": createTile({ id: "1", card: "b1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", card: "b1", x: 2, y: 0, z: 0 }),
      "3": createTile({ id: "3", card: "b2", x: 6, y: 0, z: 0 }),
      "4": createTile({ id: "4", card: "c1", x: 0, y: 2, z: 0 }),
      "5": createTile({ id: "5", card: "f1", x: 2, y: 2, z: 0 }),
      "6": createTile({ id: "6", card: "f2", x: 6, y: 2, z: 0 }),
    })
  })

  it("selects a single tile when clicked", () => {
    selectTile({ tileDb, game, tileId: "1" })
    expect(tileDb.get("1")!.selected).toBe(true)
    expect(tileDb.filterBy({ selected: true }).length).toBe(1)
  })

  it("deselects a tile when clicked again", () => {
    selectTile({ tileDb, game, tileId: "1" })
    expect(tileDb.get("1")!.selected).toBe(true)

    selectTile({ tileDb, game, tileId: "1" })
    expect(tileDb.get("1")!.selected).toBe(false)
  })

  it("matches and removes matching tiles", () => {
    selectTile({ tileDb, game, tileId: "1" })
    selectTile({ tileDb, game, tileId: "2" })

    // Both tiles should be deleted
    expect(tileDb.get("1")!.deleted).toBe(true)
    expect(tileDb.get("2")!.deleted).toBe(true)

    // Both tiles should not be selected
    expect(tileDb.get("1")!.selected).toBe(false)
    expect(tileDb.get("2")!.selected).toBe(false)

    // Points should be awarded
    expect(game.points).toBeGreaterThan(0)
  })

  it("matches flower tiles", () => {
    selectTile({ tileDb, game, tileId: "5" })
    selectTile({ tileDb, game, tileId: "6" })

    // Both tiles should be deleted
    expect(tileDb.get("5")!.deleted).toBe(true)
    expect(tileDb.get("6")!.deleted).toBe(true)

    // Flower power should be activated
    expect(game.flowerOrSeason).toBeDefined()
  })

  it("does not match different tiles", () => {
    selectTile({ tileDb, game, tileId: "1" })
    selectTile({ tileDb, game, tileId: "3" })

    // No tiles should be deleted
    expect(tileDb.get("1")!.deleted).toBe(false)
    expect(tileDb.get("3")!.deleted).toBe(false)

    // No tile should be selected
    expect(tileDb.filterBy({ selected: true }).length).toBe(0)

    // No points should be awarded
    expect(game.points).toBe(0)
  })

  it("ends the game when no pairs left", () => {
    // Create a DB with only non-matching tiles
    tileDb = initTileDb({
      "1": createTile({ id: "1", card: "b1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", card: "b1", x: 2, y: 0, z: 0 }),
    })

    selectTile({ tileDb, game, tileId: "1" })
    selectTile({ tileDb, game, tileId: "2" })

    // Game should not have ended
    expect(game.endCondition).toBe("empty-board")

    // Delete all but one tile to force no-pairs condition
    tileDb = initTileDb({
      "1": createTile({ id: "1", card: "b1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", card: "b2", x: 2, y: 0, z: 0 }),
      "3": createTile({ id: "3", card: "b1", x: 4, y: 0, z: 0 }),
    })

    selectTile({ tileDb, game, tileId: "1" })
    selectTile({ tileDb, game, tileId: "3" })

    // Game should have ended with no-pairs
    expect(game.endCondition).toBe("no-pairs")
  })

  it("ends the game when board is empty", () => {
    // Create a DB with only one matching pair
    tileDb = initTileDb({
      "1": createTile({ id: "1", card: "b1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", card: "b1", x: 2, y: 0, z: 0 }),
    })

    selectTile({ tileDb, game, tileId: "1" })
    selectTile({ tileDb, game, tileId: "2" })

    // Game should have ended with empty-board
    expect(game.endCondition).toBe("empty-board")
    expect(game.endedAt).toBeDefined()
  })
})

describe("getCoins", () => {
  it("adds no coins when there is no rabbit run", () => {
    const game: Game = { points: 0 }
    const boneTile = createTile({ card: "b1", material: "bone" })

    expect(getCoins({ tiles: [boneTile], game, newPoints: 10 })).toBe(0)
  })

  it("adds material coins", () => {
    const game: Game = { points: 0 }
    const bronzeTile = createTile({ card: "b1", material: "bronze" })
    const goldTile = createTile({ card: "b1", material: "gold" })

    expect(getCoins({ tiles: [bronzeTile], game, newPoints: 10 })).toBe(5)
    expect(getCoins({ tiles: [goldTile], game, newPoints: 10 })).toBe(20)
    expect(
      getCoins({ tiles: [bronzeTile, goldTile], game, newPoints: 10 }),
    ).toBe(25)
  })

  it("applies rabbit multiplier to points but not material coins", () => {
    const game: Game = {
      points: 0,
      rabbitRun: { card: "r1", score: true, combo: 3 },
    }
    const bronzeTile = createTile({ card: "b1", material: "bronze" })

    // 10 points * 3 (rabbit multiplier) + 5 bronze coins = 35
    expect(getCoins({ tiles: [bronzeTile], game, newPoints: 10 })).toBe(35)
  })

  it("handles rabbit run without score", () => {
    const game: Game = {
      points: 0,
      rabbitRun: { card: "r1", score: false, combo: 3 },
    }
    const bronzeTile = createTile({ card: "b1", material: "bronze" })

    expect(getCoins({ tiles: [bronzeTile], game, newPoints: 10 })).toBe(5)
  })
})
