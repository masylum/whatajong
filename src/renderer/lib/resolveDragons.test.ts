import { describe, expect, it } from "vitest"
import { cardMatchesDragon, resolveDragons } from "./resolveDragons"
import { createGame, createTile } from "./test/utils"

describe("resolveDragons", () => {
  describe("cardMatchesDragon", () => {
    it("matches cards with the correct color", () => {
      expect(cardMatchesDragon("r", "c1")).toBe(true)
      expect(cardMatchesDragon("r", "c9")).toBe(true)
      expect(cardMatchesDragon("g", "b5")).toBe(true)
      expect(cardMatchesDragon("b", "o3")).toBe(true)
      expect(cardMatchesDragon("r", "f1")).toBe(true)
      expect(cardMatchesDragon("g", "f2")).toBe(true)
      expect(cardMatchesDragon("r", "rr")).toBe(true)
      expect(cardMatchesDragon("r", "pr")).toBe(true)
      expect(cardMatchesDragon("g", "j1")).toBe(true)
      expect(cardMatchesDragon("k", "j1")).toBe(true)
      expect(cardMatchesDragon("k", "ww")).toBe(true)
    })

    it("does not match cards with different color", () => {
      expect(cardMatchesDragon("r", "b1")).toBe(false)
      expect(cardMatchesDragon("r", "b5")).toBe(false)
      expect(cardMatchesDragon("g", "wn")).toBe(false)
      expect(cardMatchesDragon("g", "rr")).toBe(false)
      expect(cardMatchesDragon("b", "dg")).toBe(false)
      expect(cardMatchesDragon("b", "pr")).toBe(false)
    })
  })

  describe("resolveDragons", () => {
    it("initializes dragon run when dragon card is played with no active run", () => {
      const game = createGame()
      const dragonTile = createTile({ cardId: "dr" })

      resolveDragons({ game, tile: dragonTile })

      expect(game.dragonRun).toBeDefined()
      expect(game.dragonRun!.color).toBe("r")
      expect(game.dragonRun!.combo).toBe(0)
    })

    it("increases combo when matching suit is played", () => {
      const game = createGame({
        dragonRun: { color: "r", combo: 1 },
      })
      const matchingTile = createTile({ cardId: "c3" })

      resolveDragons({ game, tile: matchingTile })

      expect(game.dragonRun!.combo).toBe(2)
    })

    it("maintains run but doesn't increase combo for special cards", () => {
      const game = createGame({
        dragonRun: { color: "r", combo: 2 },
      })

      const flowerTile = createTile({ cardId: "f1" })
      resolveDragons({ game, tile: flowerTile })
      expect(game.dragonRun!.combo).toBe(3)

      // Joker doesn't increase combo but maintains run
      const jokerTile = createTile({ cardId: "j1" })
      resolveDragons({ game, tile: jokerTile })
      expect(game.dragonRun!.combo).toBe(4)

      // Mutation doesn't increase combo but maintains run
      const mutationTile = createTile({ cardId: "m1" })
      resolveDragons({ game, tile: mutationTile })
      expect(game.dragonRun!.combo).toBe(5)
    })

    it("resets run when non-matching card is played", () => {
      const game = createGame({
        dragonRun: { color: "r", combo: 3 },
      })
      const nonMatchingTile = createTile({ cardId: "b2" })

      resolveDragons({ game, tile: nonMatchingTile })

      expect(game.dragonRun).toBeUndefined()
    })

    it("switches to new dragon when different dragon is played", () => {
      const game = createGame({
        dragonRun: { color: "r", combo: 3 },
      })
      const newDragonTile = createTile({ cardId: "db" })

      resolveDragons({ game, tile: newDragonTile })

      expect(game.dragonRun!.color).toBe("b")
      expect(game.dragonRun!.combo).toBe(0)
    })

    it("maintains dragon if same dragon is played", () => {
      const game = createGame({
        dragonRun: { color: "r", combo: 3 },
      })
      const sameDragonTile = createTile({ cardId: "dr" })

      resolveDragons({ game, tile: sameDragonTile })

      expect(game.dragonRun!.color).toBe("r")
      expect(game.dragonRun!.combo).toBe(4)
    })
  })
})
