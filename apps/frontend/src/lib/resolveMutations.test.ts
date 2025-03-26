import { describe, it, expect, beforeEach } from "vitest"
import { resolveMutations } from "./resolveMutations"
import { createTile } from "./test/utils"
import { initTileDb, type TileDb } from "./game"

describe("resolveMutations", () => {
  let tileDb: TileDb

  beforeEach(() => {
    tileDb = initTileDb({
      "1": createTile({ id: "1", card: "b1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", card: "b5", x: 1, y: 0, z: 0 }),
      "3": createTile({ id: "3", card: "b9", x: 2, y: 0, z: 0 }),
      "4": createTile({ id: "4", card: "c2", x: 0, y: 1, z: 0 }),
      "5": createTile({ id: "5", card: "c5", x: 1, y: 1, z: 0 }),
      "6": createTile({ id: "6", card: "o3", x: 0, y: 2, z: 0 }),
      "7": createTile({ id: "7", card: "o8", x: 1, y: 2, z: 0 }),
    })
  })

  it("increases all suit ranks by 1 with m4 mutation", () => {
    const mutationTile = createTile({ card: "m4" })
    resolveMutations(tileDb, mutationTile)

    // Check that each suit card rank increased by 1
    expect(tileDb.get("1")!.card).toBe("b2") // b1 -> b2
    expect(tileDb.get("2")!.card).toBe("b6") // b5 -> b6
    expect(tileDb.get("3")!.card).toBe("b9") // b9 stays b9 (max)
    expect(tileDb.get("4")!.card).toBe("c3") // c2 -> c3
    expect(tileDb.get("5")!.card).toBe("c6") // c5 -> c6
    expect(tileDb.get("6")!.card).toBe("o4") // o3 -> o4
    expect(tileDb.get("7")!.card).toBe("o9") // o8 -> o9
  })

  it("decreases all suit ranks by 1 with m5 mutation", () => {
    const mutationTile = createTile({ card: "m5" })
    resolveMutations(tileDb, mutationTile)

    // Check that each suit card rank decreased by 1
    expect(tileDb.get("1")!.card).toBe("b1") // b1 stays b1 (min)
    expect(tileDb.get("2")!.card).toBe("b4") // b5 -> b4
    expect(tileDb.get("3")!.card).toBe("b8") // b9 -> b8
    expect(tileDb.get("4")!.card).toBe("c1") // c2 -> c1
    expect(tileDb.get("5")!.card).toBe("c4") // c5 -> c4
    expect(tileDb.get("6")!.card).toBe("o2") // o3 -> o2
    expect(tileDb.get("7")!.card).toBe("o7") // o8 -> o7
  })

  it("swaps dots and crack suits with m1 mutation", () => {
    // Add dot cards
    tileDb.set("8", createTile({ id: "8", card: "o1", x: 2, y: 1, z: 0 }))

    const mutationTile = createTile({ card: "m1" })
    resolveMutations(tileDb, mutationTile)

    // Dot cards become crack cards
    expect(tileDb.get("8")!.card).toBe("c1")

    // Crack cards become dot cards
    expect(tileDb.get("4")!.card).toBe("o2")
    expect(tileDb.get("5")!.card).toBe("o5")
  })

  it("swaps dot and bamboo suits with m2 mutation", () => {
    // Add dot cards
    tileDb.set("8", createTile({ id: "8", card: "o1", x: 2, y: 1, z: 0 }))

    const mutationTile = createTile({ card: "m2" })
    resolveMutations(tileDb, mutationTile)

    // Dot cards become bamboo cards
    expect(tileDb.get("8")!.card).toBe("b1")

    // Bamboo cards become dot cards
    expect(tileDb.get("1")!.card).toBe("o1")
    expect(tileDb.get("2")!.card).toBe("o5")
    expect(tileDb.get("3")!.card).toBe("o9")
  })

  it("swaps bamboo and crack suits with m3 mutation", () => {
    const mutationTile = createTile({ card: "m3" })
    resolveMutations(tileDb, mutationTile)

    // Bamboo cards become crack cards
    expect(tileDb.get("1")!.card).toBe("c1")
    expect(tileDb.get("2")!.card).toBe("c5")
    expect(tileDb.get("3")!.card).toBe("c9")

    // Crack cards become bamboo cards
    expect(tileDb.get("4")!.card).toBe("b2")
    expect(tileDb.get("5")!.card).toBe("b5")
  })

  it("has no effect for non-mutation cards", () => {
    const originalCards = tileDb.all.map((tile) => ({
      id: tile.id,
      card: tile.card,
    }))

    const regularTile = createTile({ card: "b1" })
    resolveMutations(tileDb, regularTile)

    // No cards should change
    for (const cardInfo of originalCards) {
      const tile = tileDb.get(cardInfo.id)!
      expect(tile.card).toBe(cardInfo.card)
    }
  })

  it("only affects suit cards when changing ranks", () => {
    // Add non-suit cards
    tileDb.set("8", createTile({ id: "8", card: "wn", x: 2, y: 1, z: 0 }))
    tileDb.set("9", createTile({ id: "9", card: "f1", x: 2, y: 2, z: 0 }))

    const mutationTile = createTile({ card: "m4" }) // +1 mutation
    resolveMutations(tileDb, mutationTile)

    // Non-suit cards shouldn't change
    expect(tileDb.get("8")!.card).toBe("wn")
    expect(tileDb.get("9")!.card).toBe("f1")
  })
})
