import { beforeEach, describe, expect, it } from "vitest"
import {
  type Color,
  type Game,
  type Tile,
  type TileDb,
  cardsMatch,
  deleteTiles,
  fullyOverlaps,
  gameOverCondition,
  getAvailablePairs,
  getCoins,
  getFreeTiles,
  getMaterial,
  getPoints,
  initTileDb,
  isBam,
  isCrack,
  isDot,
  isDragon,
  isFlower,
  isFree,
  isJoker,
  isPhoenix,
  isRabbit,
  isWind,
  mapGet,
  mapGetHeight,
  mapGetLevels,
  mapGetWidth,
  overlaps,
  selectTile,
} from "./game"
import { RESPONSIVE_MAP } from "./maps/responsive"
import { createTile } from "./test/utils"

describe("map", () => {
  describe("mapGet", () => {
    it("should return null for negative coordinates", () => {
      expect(mapGet(RESPONSIVE_MAP, -1, 0, 0)).toBeNull()
      expect(mapGet(RESPONSIVE_MAP, 0, -1, 0)).toBeNull()
      expect(mapGet(RESPONSIVE_MAP, 0, 0, -1)).toBeNull()
    })

    it("should return null for out of bounds coordinates", () => {
      expect(mapGet(RESPONSIVE_MAP, mapGetWidth(), 0, 0)).toBeNull()
      expect(mapGet(RESPONSIVE_MAP, 0, mapGetHeight(), 0)).toBeNull()
      expect(mapGet(RESPONSIVE_MAP, 0, 0, mapGetLevels())).toBeNull()
    })

    it("should return null for empty spaces", () => {
      expect(mapGet(RESPONSIVE_MAP, 0, 2, 0)).toBeNull()
    })

    it("should return tile id as string for valid positions", () => {
      expect(mapGet(RESPONSIVE_MAP, 2, 0, 0)).toBe("2")
      expect(mapGet(RESPONSIVE_MAP, 3, 0, 0)).toBe("2")
    })
  })
})

describe("game", () => {
  describe("getFreeTiles", () => {
    let db: TileDb

    beforeEach(() => {
      db = initTileDb({
        "1": createTile({ id: "1", cardId: "b1", x: 0, y: 0, z: 0 }), // covered by "5"
        "2": createTile({ id: "2", cardId: "b2", x: 2, y: 0, z: 0 }), // blocked
        "3": createTile({ id: "3", cardId: "b3", x: 4, y: 0, z: 0 }),
        "4": createTile({ id: "4", cardId: "b4", x: 0, y: 2, z: 0 }),
        "5": createTile({ id: "5", cardId: "b5", x: 0, y: 0, z: 1 }),
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
        "1": createTile({ id: "1", cardId: "b1", x: 0, y: 0, z: 0 }),
        "2": createTile({ id: "2", cardId: "b2", x: 2, y: 0, z: 0 }), // blocked
        "3": createTile({ id: "3", cardId: "b4", x: 4, y: 0, z: 0 }),
        "4": createTile({ id: "4", cardId: "b4", x: 0, y: 2, z: 0 }),
        "5": createTile({ id: "5", cardId: "b5", x: 0, y: 0, z: 1 }), // covering "1"
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
        cardId: "b1",
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
      "1": createTile({ id: "1", cardId: "b1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", cardId: "b2", x: 2, y: 0, z: 0 }),
    })

    expect(gameOverCondition(tileDb)).toBe("no-pairs")
  })
})

describe("getPoints", () => {
  const game: Game = { points: 0 }
  let tileDb: TileDb

  beforeEach(() => {
    // Initialize a basic tileDb for each test
    tileDb = initTileDb({
      t1: createTile({ id: "t1", cardId: "b1", x: 10, y: 10 }), // Some default tiles
      t2: createTile({ id: "t2", cardId: "b2", x: 12, y: 10 }),
    })
    // Reset game state
    game.points = 0
    game.dragonRun = undefined
    game.phoenixRun = undefined
    game.temporaryMaterial = undefined
  })

  function createDragonPowerup(color: Color, combo: number) {
    game.dragonRun = { color, combo }
  }

  it("assigns correct base points to each card type", () => {
    const standardTile = createTile({ cardId: "c1" })
    const dragonTile = createTile({ cardId: "dr" })
    const flowerTile = createTile({ cardId: "f1" })
    const windTile = createTile({ cardId: "wn" })

    expect(getPoints({ game, tile: standardTile, tileDb })).toBe(1)
    expect(getPoints({ game, tile: dragonTile, tileDb })).toBe(2)
    expect(getPoints({ game, tile: flowerTile, tileDb })).toBe(2)
    expect(getPoints({ game, tile: windTile, tileDb })).toBe(4)
  })

  it("accepts two tiles", () => {
    const boneTile = createTile({ cardId: "c1", material: "bone" })
    const jadeTile = createTile({ cardId: "c1", material: "jade" })
    const rubyTile = createTile({ cardId: "c1", material: "ruby" })
    const rubyWindTile = createTile({ cardId: "wn", material: "ruby" })

    expect(getPoints({ game, tile: boneTile, tileDb })).toBe(1)
    expect(getPoints({ game, tile: rubyTile, tileDb })).toBe(25)
    expect(getPoints({ game, tile: rubyWindTile, tileDb })).toBe(28)
    expect(getPoints({ game, tile: jadeTile, tileDb })).toBe(7)
  })

  it("adds correct point values for different materials", () => {
    const topazTile = createTile({ cardId: "c1", material: "topaz" })
    const obsidianTile = createTile({ cardId: "c1", material: "obsidian" })
    const jadeTile = createTile({ cardId: "c1", material: "jade" })
    const emeraldTile = createTile({ cardId: "c1", material: "emerald" })
    const garnetTile = createTile({ cardId: "c1", material: "garnet" })
    const rubyTile = createTile({ cardId: "c1", material: "ruby" })

    expect(getPoints({ game, tile: topazTile, tileDb })).toBe(3)
    expect(getPoints({ game, tile: obsidianTile, tileDb })).toBe(25)
    expect(getPoints({ game, tile: jadeTile, tileDb })).toBe(7)
    expect(getPoints({ game, tile: emeraldTile, tileDb })).toBe(73)
    expect(getPoints({ game, tile: garnetTile, tileDb })).toBe(3)
    expect(getPoints({ game, tile: rubyTile, tileDb })).toBe(25)
  })

  it("applies dragon multipliers to matching suits", () => {
    const circleTile = createTile({ cardId: "c1", material: "bone" })
    const bambooTile = createTile({ cardId: "b1", material: "bone" })

    createDragonPowerup("r", 3)

    expect(getPoints({ game, tile: circleTile, tileDb })).toBe(4)
    expect(getPoints({ game, tile: bambooTile, tileDb })).toBe(4)
  })

  it("applies different dragons to their matching suits", () => {
    const bambooTile = createTile({ cardId: "b1", material: "bone" })
    createDragonPowerup("g", 2)

    expect(getPoints({ game, tile: bambooTile, tileDb })).toBe(3)
  })

  it("combines material and dragon multipliers correctly", () => {
    createDragonPowerup("r", 2)
    const jadeCircleTile = createTile({ cardId: "c1", material: "jade" })

    // (6 + 1) * (1 + 2) = 21
    expect(getPoints({ game, tile: jadeCircleTile, tileDb })).toBe(21)
  })

  it("when 2 matching elements are free, add 2 mult", () => {
    const circleTile = createTile({ cardId: "c1", material: "bone" })
    tileDb = initTileDb({
      e1: createTile({ id: "e1", cardId: "er", x: 0, y: 0 }),
      e2: createTile({ id: "e2", cardId: "er", x: 2, y: 0 }),
    })

    // (1 + 2) * (1 + 2) = 9
    expect(getPoints({ game, tile: circleTile, tileDb })).toBe(9)
  })

  it("it takes into account the color of the elements", () => {
    const circleTile = createTile({ cardId: "c1", material: "bone" })
    tileDb = initTileDb({
      e1: createTile({ id: "e1", cardId: "er", x: 0, y: 0 }),
      e2: createTile({ id: "e2", cardId: "eg", x: 2, y: 0 }),
    })

    // (1 + 1) * (1 + 1) = 4
    expect(getPoints({ game, tile: circleTile, tileDb })).toBe(4)
  })

  it("when 3 elements are free, add 2 mult", () => {
    const circleTile = createTile({ cardId: "c1", material: "bone" })
    tileDb = initTileDb({
      e1: createTile({ id: "e1", cardId: "er", x: 0, y: 0 }),
      e2: createTile({ id: "e2", cardId: "er", x: 2, y: 0 }),
      e3: createTile({ id: "e3", cardId: "er", x: 0, y: 2 }),
    })

    // (1 + 3) * (1 + 3) = 16
    expect(getPoints({ game, tile: circleTile, tileDb })).toBe(16)
  })

  it("when 4 elements are free, add 2 mult", () => {
    const circleTile = createTile({ cardId: "c1", material: "bone" })
    tileDb = initTileDb({
      e1: createTile({ id: "e1", cardId: "er", x: 0, y: 0 }),
      e2: createTile({ id: "e2", cardId: "er", x: 2, y: 0 }),
      e3: createTile({ id: "e3", cardId: "er", x: 0, y: 2 }),
      e4: createTile({ id: "e4", cardId: "er", x: 2, y: 2 }),
    })

    // (1 + 4) * (1 + 4) = 25
    expect(getPoints({ game, tile: circleTile, tileDb })).toBe(25)
  })

  it("combines elements, dragon, and material correctly", () => {
    createDragonPowerup("r", 2)
    const jadeCircleTile = createTile({ cardId: "b1", material: "emerald" })
    tileDb = initTileDb({
      e1: createTile({ id: "er", cardId: "er", x: 0, y: 0 }),
      e2: createTile({ id: "er", cardId: "er", x: 2, y: 0 }),
      e3: createTile({ id: "er", cardId: "er", x: 4, y: 0 }),
    })

    // (72 + 1) * (1 + 2 + 2) = 100
    expect(getPoints({ game, tile: jadeCircleTile, tileDb })).toBe(219)
  })
})

describe("cardsMatch", () => {
  it("should match identical cards", () => {
    expect(cardsMatch("b1", "b1")).toBe(true)
    expect(cardsMatch("c5", "c5")).toBe(true)
    expect(cardsMatch("wn", "wn")).toBe(true)
    expect(cardsMatch("dr", "dr")).toBe(true)
  })

  it("should match any flower with any flower", () => {
    expect(cardsMatch("f1", "f2")).toBe(true)
    expect(cardsMatch("f2", "f3")).toBe(true)
  })

  it("should not match different non-flower/season cards", () => {
    expect(cardsMatch("b1", "b2")).toBe(false)
    expect(cardsMatch("c5", "c6")).toBe(false)
    expect(cardsMatch("b1", "c1")).toBe(false)
    expect(cardsMatch("wn", "ws")).toBe(false)
    expect(cardsMatch("wn", "dr")).toBe(false)
  })
})

describe("deleteTiles", () => {
  it("should mark tile as deleted", () => {
    const db = initTileDb({
      "1": createTile({ id: "1", cardId: "b1" }),
    })
    const tile = db.get("1")!
    deleteTiles(db, [tile])
    expect(db.get("1")!.deleted).toBe(true)
  })

  it("should delete selection", () => {
    const db = initTileDb({
      "1": createTile({ id: "1", cardId: "b1" }),
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
        "1": createTile({ id: "1", cardId: "b1" }),
        "2": createTile({ id: "2", cardId: "b2", x: 1, y: 0, z: 0 }),
      })
      expect(db.size).toBe(2)
    })
  })

  describe("overlaps", () => {
    let db: TileDb
    let tile: Tile

    beforeEach(() => {
      db = initTileDb({
        "1": createTile({ id: "1", cardId: "b1", x: 2, y: 2, z: 0 }),
        "2": createTile({ id: "2", cardId: "b2", x: 2, y: 2, z: 1 }),
        "3": createTile({ id: "3", cardId: "b3", x: 2, y: 2, z: -1 }),
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
        "1": createTile({ id: "1", cardId: "b1", x: 0, y: 0, z: 0 }), // covered by "5"
        "2": createTile({ id: "2", cardId: "b2", x: 2, y: 0, z: 0 }), // blocked
        "3": createTile({ id: "3", cardId: "b3", x: 4, y: 0, z: 0 }),
        "4": createTile({ id: "4", cardId: "b4", x: 0, y: 2, z: 0 }),
        "5": createTile({ id: "5", cardId: "b5", x: 0, y: 0, z: 1 }),
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
    expect(isFlower("f1")?.id).toBe("f1")
    expect(isFlower("b1")).toBeNull()

    expect(isDragon("dr")?.id).toBe("dr")
    expect(isDragon("b1")).toBeNull()

    expect(isWind("wn")?.id).toBe("wn")
    expect(isWind("b1")).toBeNull()

    expect(isBam("b1")?.id).toBe("b1")
    expect(isBam("c1")).toBeNull()

    expect(isCrack("c1")?.id).toBe("c1")
    expect(isCrack("b1")).toBeNull()

    expect(isDot("o1")?.id).toBe("o1")
    expect(isDot("b1")).toBeNull()

    expect(isRabbit("rb")?.id).toBe("rb")
    expect(isRabbit("b1")).toBeNull()

    expect(isJoker("j1")?.id).toBe("j1")
    expect(isJoker("b1")).toBeNull()

    expect(isPhoenix("pb")?.id).toBe("pb")
    expect(isPhoenix("b1")).toBeNull()
  })
})

describe("getMaterial", () => {
  it("should return the tile's material when no game is provided", () => {
    const boneTile = createTile({ id: "1", cardId: "b1", material: "bone" })
    const jadeTile = createTile({ id: "2", cardId: "b1", material: "jade" })

    expect(getMaterial(boneTile)).toBe("bone")
    expect(getMaterial(jadeTile)).toBe("jade")
  })

  it("returns the temporary material when it is free", () => {
    const boneTile = createTile({
      id: "1",
      cardId: "b1",
      material: "bone",
      x: 0,
    })
    const jadeTile = createTile({
      id: "2",
      cardId: "b1",
      material: "jade",
      x: 2,
    })
    const garnetTile = createTile({
      id: "3",
      cardId: "c1",
      material: "garnet",
      x: 4,
    })
    const game: Game = { points: 0, temporaryMaterial: "topaz" }

    expect(getMaterial(boneTile, game)).toBe("topaz")
    expect(getMaterial(jadeTile, game)).toBe("topaz")
    expect(getMaterial(garnetTile, game)).toBe("topaz")
  })
})

describe("fullyOverlaps", () => {
  let db: TileDb

  beforeEach(() => {
    db = initTileDb({
      "1": createTile({ id: "1", cardId: "b1", x: 2, y: 2, z: 0 }),
      "2": createTile({ id: "2", cardId: "b2", x: 1, y: 1, z: 0 }),
      "3": createTile({ id: "3", cardId: "b3", x: 3, y: 3, z: 0 }),
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

describe("selectTile", () => {
  let tileDb: TileDb
  let game: Game

  beforeEach(() => {
    game = { points: 0 }
    tileDb = initTileDb({
      "1": createTile({ id: "1", cardId: "b1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", cardId: "b1", x: 2, y: 0, z: 0 }),
      "3": createTile({ id: "3", cardId: "b2", x: 6, y: 0, z: 0 }),
      "4": createTile({ id: "4", cardId: "c1", x: 0, y: 2, z: 0 }),
      "5": createTile({ id: "5", cardId: "f1", x: 2, y: 2, z: 0 }),
      "6": createTile({ id: "6", cardId: "f2", x: 6, y: 2, z: 0 }),
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
      "1": createTile({ id: "1", cardId: "b1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", cardId: "b1", x: 2, y: 0, z: 0 }),
    })

    selectTile({ tileDb, game, tileId: "1" })
    selectTile({ tileDb, game, tileId: "2" })

    // Game should not have ended
    expect(game.endCondition).toBe("empty-board")

    // Delete all but one tile to force no-pairs condition
    tileDb = initTileDb({
      "1": createTile({ id: "1", cardId: "b1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", cardId: "b2", x: 2, y: 0, z: 0 }),
      "3": createTile({ id: "3", cardId: "b1", x: 4, y: 0, z: 0 }),
    })

    selectTile({ tileDb, game, tileId: "1" })
    selectTile({ tileDb, game, tileId: "3" })

    // Game should have ended with no-pairs
    expect(game.endCondition).toBe("no-pairs")
  })

  it("ends the game when board is empty", () => {
    // Create a DB with only one matching pair
    tileDb = initTileDb({
      "1": createTile({ id: "1", cardId: "b1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", cardId: "b1", x: 2, y: 0, z: 0 }),
    })

    selectTile({ tileDb, game, tileId: "1" })
    selectTile({ tileDb, game, tileId: "2" })

    // Game should have ended with empty-board
    expect(game.endCondition).toBe("empty-board")
    expect(game.endedAt).toBeDefined()
  })
})

describe("getCoins", () => {
  it("adds material and rabbit coins", () => {
    const bronzeTile = createTile({ cardId: "b1", material: "garnet" })
    const rubyTile = createTile({ cardId: "b1", material: "ruby" })
    const rabbitTile = createTile({ cardId: "rr", material: "bone" })
    const rabbitRubyTile = createTile({ cardId: "rr", material: "ruby" })

    expect(getCoins({ tile: bronzeTile })).toBe(1)
    expect(getCoins({ tile: rubyTile })).toBe(3)
    expect(getCoins({ tile: rabbitTile })).toBe(1)
    expect(getCoins({ tile: rabbitRubyTile })).toBe(4)
  })
})
