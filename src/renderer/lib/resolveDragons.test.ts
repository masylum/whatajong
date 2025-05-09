import { describe, expect, it } from "vitest"
import { initTileDb } from "./game"
import { resolveDragons } from "./resolveDragons"
import { createGame, createTile } from "./test/utils"

describe("resolveDragons", () => {
  describe("resolveDragons", () => {
    it("initializes dragon run when dragon card is played with no active run", () => {
      const game = createGame()
      const dragonTile = createTile({ cardId: "dragonr" })
      const tileDb = initTileDb({})

      resolveDragons({ game, tile: dragonTile, tileDb })

      expect(game.dragonRun).toBeDefined()
      expect(game.dragonRun!.color).toBe("r")
      expect(game.dragonRun!.combo).toBe(1)
    })

    it("increases combo when matching suit is played", () => {
      const game = createGame({
        dragonRun: { color: "r", combo: 1 },
      })
      const matchingTile = createTile({ cardId: "crack3" })
      const tileDb = initTileDb({})

      resolveDragons({ game, tile: matchingTile, tileDb })

      expect(game.dragonRun!.combo).toBe(2)
    })

    it("maintains run but doesn't increase combo for special cards", () => {
      const game = createGame({
        dragonRun: { color: "r", combo: 2 },
      })

      const flowerTile = createTile({ cardId: "flower1" })
      const tileDb = initTileDb({})

      resolveDragons({ game, tile: flowerTile, tileDb })
      expect(game.dragonRun!.combo).toBe(3)

      // Joker doesn't increase combo but maintains run
      const jokerTile = createTile({ cardId: "joker" })
      resolveDragons({ game, tile: jokerTile, tileDb })
      expect(game.dragonRun!.combo).toBe(4)

      // Mutation doesn't increase combo but maintains run
      const mutationTile = createTile({ cardId: "mutation1" })
      resolveDragons({ game, tile: mutationTile, tileDb })

      expect(game.dragonRun!.combo).toBe(5)
    })

    it("resets run when non-matching card is played", () => {
      const game = createGame({
        dragonRun: { color: "r", combo: 3 },
      })
      const nonMatchingTile = createTile({ cardId: "bam2" })
      const tileDb = initTileDb({})

      resolveDragons({ game, tile: nonMatchingTile, tileDb })

      expect(game.dragonRun).toBeUndefined()
    })

    it("switches to new dragon when different dragon is played", () => {
      const game = createGame({
        dragonRun: { color: "r", combo: 3 },
      })
      const newDragonTile = createTile({ cardId: "dragonb" })
      const tileDb = initTileDb({})

      resolveDragons({ game, tile: newDragonTile, tileDb })

      expect(game.dragonRun!.color).toBe("b")
      expect(game.dragonRun!.combo).toBe(1)
    })

    it("maintains dragon if same dragon is played", () => {
      const game = createGame({
        dragonRun: { color: "r", combo: 3 },
      })
      const sameDragonTile = createTile({ cardId: "dragonr" })
      const tileDb = initTileDb({})

      resolveDragons({ game, tile: sameDragonTile, tileDb })

      expect(game.dragonRun!.color).toBe("r")
      expect(game.dragonRun!.combo).toBe(4)
    })
  })
})
