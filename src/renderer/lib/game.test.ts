import type { Game } from "@/state/gameState"
import { beforeEach, describe, expect, it } from "vitest"
import {
  type Color,
  type Tile,
  type TileDb,
  cardMatchesColor,
  cardsMatch,
  deleteTiles,
  fullyOverlaps,
  gameOverCondition,
  getAvailablePairs,
  getCoins,
  getFinder,
  getFreeTiles,
  getMaterial,
  getPoints,
  getTaijituMultiplier,
  initTileDb,
  isBam,
  isCrack,
  isDot,
  isDragon,
  isElement,
  isFlower,
  isFree,
  isFrog,
  isGem,
  isJoker,
  isMutation,
  isPhoenix,
  isRabbit,
  isSparrow,
  isTaijitu,
  isWind,
  mapGet,
  mapGetHeight,
  mapGetLevels,
  mapGetWidth,
  overlaps,
  resolveBlackMaterials,
  selectTile,
} from "./game"
import { RESPONSIVE_MAP } from "./maps/responsive"
import { createGame, createTile } from "./test/utils"

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
      expect(mapGet(RESPONSIVE_MAP, 2, 0, 0)).toBe("1")
      expect(mapGet(RESPONSIVE_MAP, 3, 0, 0)).toBe("1")
    })
  })
})

describe("game", () => {
  describe("getFreeTiles", () => {
    let db: TileDb

    beforeEach(() => {
      db = initTileDb({
        "1": createTile({ id: "1", cardId: "bam1", x: 0, y: 0, z: 0 }), // covered by "5"
        "2": createTile({ id: "2", cardId: "bam2", x: 2, y: 0, z: 0 }), // blocked
        "3": createTile({ id: "3", cardId: "bam3", x: 4, y: 0, z: 0 }),
        "4": createTile({ id: "4", cardId: "bam4", x: 0, y: 2, z: 0 }),
        "5": createTile({ id: "5", cardId: "bam5", x: 0, y: 0, z: 1 }),
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
        "1": createTile({ id: "1", cardId: "bam1", x: 0, y: 0, z: 0 }),
        "2": createTile({ id: "2", cardId: "bam2", x: 2, y: 0, z: 0 }), // blocked
        "3": createTile({ id: "3", cardId: "bam4", x: 4, y: 0, z: 0 }),
        "4": createTile({ id: "4", cardId: "bam4", x: 0, y: 2, z: 0 }),
        "5": createTile({ id: "5", cardId: "bam5", x: 0, y: 0, z: 1 }), // covering "1"
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
        cardId: "bam1",
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
      "1": createTile({ id: "1", cardId: "bam1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", cardId: "bam2", x: 2, y: 0, z: 0 }),
    })

    expect(gameOverCondition(tileDb)).toBe("no-pairs")
  })
})

describe("getPoints", () => {
  const game = createGame()
  let tileDb: TileDb

  beforeEach(() => {
    // Initialize a basic tileDb for each test
    tileDb = initTileDb({
      t1: createTile({ id: "t1", cardId: "bam1", x: 10, y: 10 }), // Some default tiles
      t2: createTile({ id: "t2", cardId: "bam2", x: 12, y: 10 }),
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
    const standardTile = createTile({ cardId: "crack1" })
    const dragonTile = createTile({ cardId: "dragonr" })
    const flowerTile = createTile({ cardId: "flower1" })
    const windTile = createTile({ cardId: "windn" })

    expect(getPoints({ game, tile: standardTile, tileDb })).toBe(1)
    expect(getPoints({ game, tile: dragonTile, tileDb })).toBe(2)
    expect(getPoints({ game, tile: flowerTile, tileDb })).toBe(1)
    expect(getPoints({ game, tile: windTile, tileDb })).toBe(3)
  })

  it("accepts two tiles", () => {
    const boneTile = createTile({ cardId: "crack1", material: "bone" })
    const jadeTile = createTile({ cardId: "crack1", material: "jade" })
    const rubyTile = createTile({ cardId: "crack1", material: "ruby" })
    const rubyWindTile = createTile({ cardId: "windn", material: "ruby" })

    expect(getPoints({ game, tile: boneTile, tileDb })).toBe(1)
    expect(getPoints({ game, tile: rubyTile, tileDb })).toBe(25)
    expect(getPoints({ game, tile: rubyWindTile, tileDb })).toBe(27)
    expect(getPoints({ game, tile: jadeTile, tileDb })).toBe(3)
  })

  it("adds correct point values for different materials", () => {
    const topazTile = createTile({ cardId: "crack1", material: "topaz" })
    const obsidianTile = createTile({ cardId: "crack1", material: "obsidian" })
    const jadeTile = createTile({ cardId: "crack1", material: "jade" })
    const emeraldTile = createTile({ cardId: "crack1", material: "emerald" })
    const garnetTile = createTile({ cardId: "crack1", material: "garnet" })
    const rubyTile = createTile({ cardId: "crack1", material: "ruby" })

    expect(getPoints({ game, tile: topazTile, tileDb })).toBe(2)
    expect(getPoints({ game, tile: obsidianTile, tileDb })).toBe(25)
    expect(getPoints({ game, tile: jadeTile, tileDb })).toBe(3)
    expect(getPoints({ game, tile: emeraldTile, tileDb })).toBe(49)
    expect(getPoints({ game, tile: garnetTile, tileDb })).toBe(2)
    expect(getPoints({ game, tile: rubyTile, tileDb })).toBe(25)
  })

  it("applies dragon multipliers to matching suits", () => {
    const circleTile = createTile({ cardId: "crack1", material: "bone" })
    const bambooTile = createTile({ cardId: "bam1", material: "bone" })

    createDragonPowerup("r", 3)

    expect(getPoints({ game, tile: circleTile, tileDb })).toBe(3)
    expect(getPoints({ game, tile: bambooTile, tileDb })).toBe(3)
  })

  it("applies different dragons to their matching suits", () => {
    const bambooTile = createTile({ cardId: "bam1", material: "bone" })
    createDragonPowerup("g", 2)

    expect(getPoints({ game, tile: bambooTile, tileDb })).toBe(2)
  })

  it("combines material and dragon multipliers correctly", () => {
    createDragonPowerup("r", 2)
    const jadeCircleTile = createTile({ cardId: "crack1", material: "jade" })

    // (2 + 1) * 2 = 6
    expect(getPoints({ game, tile: jadeCircleTile, tileDb })).toBe(6)
  })

  it("when 2 matching elements are free, add 2 mult", () => {
    const circleTile = createTile({ cardId: "crack1", material: "bone" })
    tileDb = initTileDb({
      e1: createTile({ id: "e1", cardId: "elementr", x: 0, y: 0 }),
      e2: createTile({ id: "e2", cardId: "elementr", x: 2, y: 0 }),
    })

    // (1 + 2) * 2 = 6
    expect(getPoints({ game, tile: circleTile, tileDb })).toBe(6)
  })

  it("it takes into account the color of the elements", () => {
    const circleTile = createTile({ cardId: "crack1", material: "bone" })
    tileDb = initTileDb({
      e1: createTile({ id: "e1", cardId: "elementr", x: 0, y: 0 }),
      e2: createTile({ id: "e2", cardId: "elementg", x: 2, y: 0 }),
    })

    // (1 + 1) * 1 = 2
    expect(getPoints({ game, tile: circleTile, tileDb })).toBe(2)
  })

  it("when 3 elements are free, add 3 mult", () => {
    const circleTile = createTile({ cardId: "crack1", material: "bone" })
    tileDb = initTileDb({
      e1: createTile({ id: "e1", cardId: "elementr", x: 0, y: 0 }),
      e2: createTile({ id: "e2", cardId: "elementr", x: 2, y: 0 }),
      e3: createTile({ id: "e3", cardId: "elementr", x: 0, y: 2 }),
    })

    // (1 + 3) * 3 = 12
    expect(getPoints({ game, tile: circleTile, tileDb })).toBe(12)
  })

  it("when 4 elements are free, add 2 mult", () => {
    const circleTile = createTile({ cardId: "crack1", material: "bone" })
    tileDb = initTileDb({
      e1: createTile({ id: "e1", cardId: "elementr", x: 0, y: 0 }),
      e2: createTile({ id: "e2", cardId: "elementr", x: 2, y: 0 }),
      e3: createTile({ id: "e3", cardId: "elementr", x: 0, y: 2 }),
      e4: createTile({ id: "e4", cardId: "elementr", x: 2, y: 2 }),
    })

    // (1 + 4) * 4 = 20
    expect(getPoints({ game, tile: circleTile, tileDb })).toBe(20)
  })

  it("combines elements, dragon, and material correctly", () => {
    createDragonPowerup("r", 2)
    const jadeCircleTile = createTile({ cardId: "bam1", material: "emerald" })
    tileDb = initTileDb({
      e1: createTile({ id: "er1", cardId: "elementg", x: 0, y: 0 }),
      e2: createTile({ id: "er2", cardId: "elementg", x: 2, y: 0 }),
      e3: createTile({ id: "er3", cardId: "elementg", x: 4, y: 0 }),
    })

    // (49 + 3) * (2 + 2) = 204
    expect(getPoints({ game, tile: jadeCircleTile, tileDb })).toBe(208)
  })
})

describe("cardMatchesColor", () => {
  it("matches cards with the correct color", () => {
    const tileDb = initTileDb({})

    expect(cardMatchesColor("r", "crack1", tileDb)).toBe(true)
    expect(cardMatchesColor("r", "crack9", tileDb)).toBe(true)
    expect(cardMatchesColor("g", "bam5", tileDb)).toBe(true)
    expect(cardMatchesColor("b", "dot3", tileDb)).toBe(true)
    expect(cardMatchesColor("r", "flower1", tileDb)).toBe(true)
    expect(cardMatchesColor("g", "flower2", tileDb)).toBe(true)
    expect(cardMatchesColor("r", "rabbitr", tileDb)).toBe(true)
    expect(cardMatchesColor("g", "mutation1", tileDb)).toBe(true)
    expect(cardMatchesColor("k", "windw", tileDb)).toBe(true)
  })

  it("does not match cards with different color", () => {
    const tileDb = initTileDb({})

    expect(cardMatchesColor("r", "bam1", tileDb)).toBe(false)
    expect(cardMatchesColor("r", "bam5", tileDb)).toBe(false)
    expect(cardMatchesColor("g", "windw", tileDb)).toBe(false)
    expect(cardMatchesColor("g", "rabbitr", tileDb)).toBe(false)
    expect(cardMatchesColor("b", "dragonr", tileDb)).toBe(false)
    expect(cardMatchesColor("b", "phoenix", tileDb)).toBe(false)
  })
})

describe("cardsMatch", () => {
  it("should match identical cards", () => {
    expect(cardsMatch("bam1", "bam1")).toBe(true)
    expect(cardsMatch("crack5", "crack5")).toBe(true)
    expect(cardsMatch("windn", "windn")).toBe(true)
    expect(cardsMatch("dragonr", "dragonr")).toBe(true)
  })

  it("should match any flower with any flower", () => {
    expect(cardsMatch("flower1", "flower2")).toBe(true)
    expect(cardsMatch("flower2", "flower3")).toBe(true)
  })

  it("should not match different non-flower/season cards", () => {
    expect(cardsMatch("bam1", "bam2")).toBe(false)
    expect(cardsMatch("crack5", "crack6")).toBe(false)
    expect(cardsMatch("bam1", "crack1")).toBe(false)
    expect(cardsMatch("windn", "winds")).toBe(false)
    expect(cardsMatch("windn", "dragonr")).toBe(false)
  })
})

describe("deleteTiles", () => {
  it("should mark tile as deleted", () => {
    const db = initTileDb({
      "1": createTile({ id: "1", cardId: "bam1" }),
    })
    const tile = db.get("1")!
    deleteTiles(db, [tile])
    expect(db.get("1")!.deleted).toBe(true)
  })

  it("should delete selection", () => {
    const db = initTileDb({
      "1": createTile({ id: "1", cardId: "bam1" }),
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
        "1": createTile({ id: "1", cardId: "bam1" }),
        "2": createTile({ id: "2", cardId: "bam2", x: 1, y: 0, z: 0 }),
      })
      expect(db.size).toBe(2)
    })
  })

  describe("overlaps", () => {
    let db: TileDb
    let tile: Tile

    beforeEach(() => {
      db = initTileDb({
        "1": createTile({ id: "1", cardId: "bam1", x: 2, y: 2, z: 0 }),
        "2": createTile({ id: "2", cardId: "bam2", x: 2, y: 2, z: 1 }),
        "3": createTile({ id: "3", cardId: "bam3", x: 2, y: 2, z: -1 }),
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
        "1": createTile({ id: "1", cardId: "bam1", x: 0, y: 0, z: 0 }), // covered by "5"
        "2": createTile({ id: "2", cardId: "bam2", x: 2, y: 0, z: 0 }), // blocked
        "3": createTile({ id: "3", cardId: "bam3", x: 4, y: 0, z: 0 }),
        "4": createTile({ id: "4", cardId: "bam4", x: 0, y: 2, z: 0 }),
        "5": createTile({ id: "5", cardId: "bam5", x: 0, y: 0, z: 1 }),
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
    expect(isFlower("flower1")?.id).toBe("flower1")
    expect(isFlower("bam1")).toBeNull()

    expect(isDragon("dragonr")?.id).toBe("dragonr")
    expect(isDragon("bam1")).toBeNull()

    expect(isWind("windn")?.id).toBe("windn")
    expect(isWind("bam1")).toBeNull()

    expect(isBam("bam1")?.id).toBe("bam1")
    expect(isBam("crack1")).toBeNull()

    expect(isCrack("crack1")?.id).toBe("crack1")
    expect(isCrack("bam1")).toBeNull()

    expect(isDot("dot1")?.id).toBe("dot1")
    expect(isDot("bam1")).toBeNull()

    expect(isRabbit("rabbitr")?.id).toBe("rabbitr")
    expect(isRabbit("bam1")).toBeNull()

    expect(isJoker("joker")?.id).toBe("joker")
    expect(isJoker("bam1")).toBeNull()

    expect(isPhoenix("phoenix")?.id).toBe("phoenix")
    expect(isPhoenix("bam1")).toBeNull()

    expect(isMutation("mutation1")?.id).toBe("mutation1")
    expect(isMutation("bam1")).toBeNull()

    expect(isElement("elementr")?.id).toBe("elementr")
    expect(isElement("bam1")).toBeNull()

    expect(isFrog("frogr")?.id).toBe("frogr")
    expect(isFrog("bam1")).toBeNull()

    expect(isGem("gemr")?.id).toBe("gemr")
    expect(isGem("bam1")).toBeNull()

    expect(isSparrow("sparrowr")?.id).toBe("sparrowr")
    expect(isSparrow("bam1")).toBeNull()

    expect(isTaijitu("taijitur")?.id).toBe("taijitur")
    expect(isTaijitu("bam1")).toBeNull()
  })
})

describe("getMaterial", () => {
  it("should return the tile's material when no game is provided", () => {
    const boneTile = createTile({ id: "1", cardId: "bam1", material: "bone" })
    const jadeTile = createTile({ id: "2", cardId: "bam1", material: "jade" })
    const tileDb = initTileDb({})

    expect(getMaterial({ tile: boneTile, tileDb })).toBe("bone")
    expect(getMaterial({ tile: jadeTile, tileDb })).toBe("jade")
  })

  it("returns the temporary material when it matches the color", () => {
    const boneTile = createTile({
      id: "1",
      cardId: "bam1",
      material: "bone",
      x: 0,
    })
    const jadeTile = createTile({
      id: "2",
      cardId: "dot1",
      material: "jade",
      x: 2,
    })
    const garnetTile = createTile({
      id: "3",
      cardId: "crack3",
      material: "garnet",
      x: 4,
    })
    const game = createGame({ temporaryMaterial: "topaz" })
    const tileDb = initTileDb({})

    expect(getMaterial({ tile: boneTile, tileDb, game })).toBe("bone")
    expect(getMaterial({ tile: jadeTile, tileDb, game })).toBe("topaz")
    expect(getMaterial({ tile: garnetTile, tileDb, game })).toBe("garnet")
  })
})

describe("fullyOverlaps", () => {
  let db: TileDb

  beforeEach(() => {
    db = initTileDb({
      "1": createTile({ id: "1", cardId: "bam1", x: 2, y: 2, z: 0 }),
      "2": createTile({ id: "2", cardId: "bam2", x: 1, y: 1, z: 0 }),
      "3": createTile({ id: "3", cardId: "bam3", x: 3, y: 3, z: 0 }),
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
    game = createGame()
    tileDb = initTileDb({
      "1": createTile({ id: "1", cardId: "bam1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", cardId: "bam1", x: 2, y: 0, z: 0 }),
      "3": createTile({ id: "3", cardId: "bam2", x: 6, y: 0, z: 0 }),
      "4": createTile({ id: "4", cardId: "crack1", x: 0, y: 2, z: 0 }),
      "5": createTile({ id: "5", cardId: "flower1", x: 2, y: 2, z: 0 }),
      "6": createTile({ id: "6", cardId: "flower2", x: 6, y: 2, z: 0 }),
      "7": createTile({ id: "7", cardId: "gemr", x: 0, y: 4, z: 0 }),
      "8": createTile({ id: "8", cardId: "gemg", x: 2, y: 4, z: 0 }),
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
      "1": createTile({ id: "1", cardId: "bam1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", cardId: "bam1", x: 2, y: 0, z: 0 }),
    })

    selectTile({ tileDb, game, tileId: "1" })
    selectTile({ tileDb, game, tileId: "2" })

    // Game should not have ended
    expect(game.endCondition).toBe("empty-board")

    // Delete all but one tile to force no-pairs condition
    tileDb = initTileDb({
      "1": createTile({ id: "1", cardId: "bam1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", cardId: "bam2", x: 2, y: 0, z: 0 }),
      "3": createTile({ id: "3", cardId: "bam1", x: 4, y: 0, z: 0 }),
    })

    selectTile({ tileDb, game, tileId: "1" })
    selectTile({ tileDb, game, tileId: "3" })

    // Game should have ended with no-pairs
    expect(game.endCondition).toBe("no-pairs")
  })

  it("ends the game when board is empty", () => {
    // Create a DB with only one matching pair
    tileDb = initTileDb({
      "1": createTile({ id: "1", cardId: "bam1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", cardId: "bam1", x: 2, y: 0, z: 0 }),
    })

    selectTile({ tileDb, game, tileId: "1" })
    selectTile({ tileDb, game, tileId: "2" })

    // Game should have ended with empty-board
    expect(game.endCondition).toBe("empty-board")
  })
})

describe("getCoins", () => {
  it("adds material and rabbit coins", () => {
    const game = createGame()
    const garnetTile = createTile({ cardId: "bam1", material: "garnet" })
    const rubyTile = createTile({ cardId: "bam1", material: "ruby" })
    const rabbitTile = createTile({ cardId: "rabbitr", material: "bone" })
    const rabbitRubyTile = createTile({ cardId: "rabbitr", material: "ruby" })
    const tileDb = initTileDb({})

    expect(getCoins({ tile: garnetTile, tileDb, game })).toBe(1)
    expect(getCoins({ tile: rubyTile, tileDb, game })).toBe(3)
    expect(getCoins({ tile: rabbitTile, tileDb, game })).toBe(1)
    expect(getCoins({ tile: rabbitRubyTile, tileDb, game })).toBe(4)
  })

  it("applies temporary material coins", () => {
    const game = createGame({ temporaryMaterial: "garnet" })
    const garnetTile = createTile({ cardId: "crack1" })
    const tileDb = initTileDb({})

    expect(getCoins({ tile: garnetTile, tileDb, game })).toBe(1)
  })
})

describe("getTaijituMultiplier", () => {
  it("returns 3 for adjacent tiles on the same z-level", () => {
    const tile1 = createTile({ id: "1", cardId: "taijitur", x: 0, y: 0, z: 0 })
    const tile2 = createTile({ id: "2", cardId: "taijitur", x: 2, y: 0, z: 0 })
    const tile3 = createTile({ id: "3", cardId: "taijitur", x: 0, y: 2, z: 0 })
    expect(getTaijituMultiplier([tile1, tile2])).toBe(3)
    expect(getTaijituMultiplier([tile1, tile3])).toBe(3)
  })

  it("returns 1 for non-adjacent tiles on the same z-level", () => {
    const tile1 = createTile({ id: "1", cardId: "bam1", x: 0, y: 0, z: 0 })
    const tile2 = createTile({ id: "2", cardId: "bam1", x: 4, y: 0, z: 0 })
    expect(getTaijituMultiplier([tile1, tile2])).toBe(1)
  })

  it("returns 1 for tiles on different z-levels", () => {
    const tile1 = createTile({ id: "1", cardId: "bam1", x: 0, y: 0, z: 0 })
    const tile2 = createTile({ id: "2", cardId: "bam1", x: 2, y: 0, z: 1 })
    expect(getTaijituMultiplier([tile1, tile2])).toBe(1)
  })

  it("returns 1 for non-taijitu tiles", () => {
    const tile1 = createTile({ id: "1", cardId: "bam1", x: 0, y: 0, z: 0 })
    const tile2 = createTile({ id: "2", cardId: "bam1", x: 2, y: 0, z: 0 })
    expect(getTaijituMultiplier([tile1, tile2])).toBe(1)
  })
})

describe("getFinder", () => {
  let db: TileDb
  const basePosition = { x: 2, y: 2, z: 1 }

  beforeEach(() => {
    db = initTileDb({
      t1: createTile({ id: "t1", cardId: "bam1", ...basePosition }),
      t2: createTile({ id: "t2", cardId: "bam2", x: 3, y: 2, z: 1 }),
      t3: createTile({ id: "t3", cardId: "bam3", x: 2, y: 2, z: 2 }),
      t4: createTile({
        id: "t4",
        cardId: "bam4",
        x: 0,
        y: 0,
        z: 0,
        deleted: true,
      }),
    })
  })

  it("returns a function", () => {
    expect(typeof getFinder(db, basePosition)).toBe("function")
  })

  it("returned function finds tile at relative coordinates", () => {
    const find = getFinder(db, basePosition)
    expect(find(0, 0, 0)?.id).toBe("t1")
    expect(find(1, 0, 0)?.id).toBe("t2")
    expect(find(0, 0, 1)?.id).toBe("t3")
  })

  it("returned function returns null if no tile exists", () => {
    const find = getFinder(db, basePosition)
    expect(find(10, 10, 10)).toBeNull()
  })

  it("returned function returns null if tile is deleted", () => {
    const find = getFinder(db, { x: 0, y: 0, z: 0 })
    expect(find(0, 0, 0)).toBeNull() // t4 is deleted
  })
})

describe("resolveBlackMaterials", () => {
  let game: Game
  let tileDb: TileDb

  beforeEach(() => {
    game = createGame()
    tileDb = initTileDb({})
  })

  it("pauses the game if material is obsidian", () => {
    resolveBlackMaterials({
      tile: createTile({ cardId: "bam1", material: "obsidian" }),
      tileDb,
      game,
    })
    expect(game.pause).toBe(true)
  })

  it("pauses the game if material is quartz", () => {
    resolveBlackMaterials({
      tile: createTile({ cardId: "bam1", material: "quartz" }),
      tileDb,
      game,
    })
    expect(game.pause).toBe(true)
  })

  it("does not pause the game for other materials", () => {
    game.pause = false // Ensure it's not already paused
    resolveBlackMaterials({
      tile: createTile({ cardId: "bam1", material: "bone" }),
      tileDb,
      game,
    })
    expect(game.pause).toBe(false)

    resolveBlackMaterials({
      tile: createTile({ cardId: "bam1", material: "ruby" }),
      tileDb,
      game,
    })
    expect(game.pause).toBe(false)
  })
})
