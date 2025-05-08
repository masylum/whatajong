import { beforeEach, describe, expect, it } from "vitest"
import { type TileDb, initTileDb } from "./game"
import { resolveMutations } from "./resolveMutations"
import { createTile } from "./test/utils"

describe("resolveMutations", () => {
  let tileDb: TileDb

  beforeEach(() => {
    tileDb = initTileDb({
      "1": createTile({ id: "1", cardId: "bam1", x: 0, y: 0, z: 0 }),
      "2": createTile({ id: "2", cardId: "bam5", x: 1, y: 0, z: 0 }),
      "3": createTile({ id: "3", cardId: "bam9", x: 2, y: 0, z: 0 }),
      "4": createTile({ id: "4", cardId: "crack2", x: 0, y: 1, z: 0 }),
      "5": createTile({ id: "5", cardId: "crack5", x: 1, y: 1, z: 0 }),
      "6": createTile({ id: "6", cardId: "dot3", x: 0, y: 2, z: 0 }),
      "7": createTile({ id: "7", cardId: "dot8", x: 1, y: 2, z: 0 }),
    })
  })

  it("swaps dots and crack suits with m1 mutation", () => {
    // Add dot cards
    tileDb.set("8", createTile({ id: "8", cardId: "dot8", x: 2, y: 1, z: 0 }))

    const mutationTile = createTile({ cardId: "mutation2" })
    resolveMutations({ tileDb, tile: mutationTile })

    // Dot cards become crack cards
    expect(tileDb.get("8")!.cardId).toBe("crack8")

    // Crack cards become dot cards
    expect(tileDb.get("4")!.cardId).toBe("dot2")
    expect(tileDb.get("5")!.cardId).toBe("dot5")
  })

  it("swaps dot and bamboo suits with m2 mutation", () => {
    // Add dot cards
    tileDb.set("8", createTile({ id: "8", cardId: "dot8", x: 2, y: 1, z: 0 }))

    const mutationTile = createTile({ cardId: "mutation3" })
    resolveMutations({ tileDb, tile: mutationTile })

    // Dot cards become bamboo cards
    expect(tileDb.get("8")!.cardId).toBe("bam8")

    // Bamboo cards become dot cards
    expect(tileDb.get("1")!.cardId).toBe("dot1")
    expect(tileDb.get("2")!.cardId).toBe("dot5")
    expect(tileDb.get("3")!.cardId).toBe("dot9")
  })

  it("swaps bamboo and crack suits with m3 mutation", () => {
    const mutationTile = createTile({ cardId: "mutation1" })
    resolveMutations({ tileDb, tile: mutationTile })

    // Bamboo cards become crack cards
    expect(tileDb.get("1")!.cardId).toBe("crack1")
    expect(tileDb.get("2")!.cardId).toBe("crack5")
    expect(tileDb.get("3")!.cardId).toBe("crack9")

    // crack cards become bamboo cards
    expect(tileDb.get("4")!.cardId).toBe("bam2")
    expect(tileDb.get("5")!.cardId).toBe("bam5")
  })

  it("has no effect for non-mutation cards", () => {
    const originalCards = tileDb.all.map((tile) => ({
      id: tile.id,
      card: tile.cardId,
    }))

    const regularTile = createTile({ cardId: "bam1" })
    resolveMutations({ tileDb, tile: regularTile })

    // No cards should change
    for (const cardInfo of originalCards) {
      const tile = tileDb.get(cardInfo.id)!
      expect(tile.cardId).toBe(cardInfo.card)
    }
  })
})
