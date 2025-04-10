import { describe, expect, it } from "vitest"
import type { Game } from "./game"
import { cardMatchesDragon, resolveDragons } from "./resolveDragons"
import { createTile } from "./test/utils"

describe("resolveDragons", () => {
  describe("cardMatchesDragon", () => {
    it("matches cards with the correct suit", () => {
      expect(cardMatchesDragon("dc", "c1")).toBe(true)
      expect(cardMatchesDragon("dc", "c9")).toBe(true)
      expect(cardMatchesDragon("db", "b5")).toBe(true)
      expect(cardMatchesDragon("do", "o3")).toBe(true)
    })

    it("does not match cards with different suits", () => {
      expect(cardMatchesDragon("dc", "b1")).toBe(false)
      expect(cardMatchesDragon("db", "c5")).toBe(false)
      expect(cardMatchesDragon("do", "wn")).toBe(false)
    })

    it("does not match special cards", () => {
      expect(cardMatchesDragon("dc", "f1")).toBe(false)
      expect(cardMatchesDragon("db", "s2")).toBe(false)
      expect(cardMatchesDragon("do", "r3")).toBe(false)
      expect(cardMatchesDragon("dc", "j1")).toBe(false)
    })
  })

  describe("resolveDragons", () => {
    it("initializes dragon run when dragon card is played with no active run", () => {
      const game: Game = { points: 0 }
      const dragonTile = createTile({ card: "dc" })

      resolveDragons(game, dragonTile)

      expect(game.dragonRun).toBeDefined()
      expect(game.dragonRun!.card).toBe("dc")
      expect(game.dragonRun!.combo).toBe(0)
    })

    it("increases combo when matching suit is played", () => {
      const game: Game = {
        points: 0,
        dragonRun: { card: "dc", combo: 1 },
      }
      const matchingTile = createTile({ card: "c3" })

      resolveDragons(game, matchingTile)

      expect(game.dragonRun!.combo).toBe(2)
    })

    it("increases combo when rabbit is played", () => {
      const game: Game = {
        points: 0,
        dragonRun: { card: "dc", combo: 1 },
      }
      const rabbitTile = createTile({ card: "r1" })

      resolveDragons(game, rabbitTile)

      expect(game.dragonRun!.combo).toBe(2)
    })

    it("maintains run but doesn't increase combo for special cards", () => {
      const game: Game = {
        points: 0,
        dragonRun: { card: "dc", combo: 2 },
      }

      // Flower doesn't increase combo but maintains run
      const flowerTile = createTile({ card: "f1" })
      resolveDragons(game, flowerTile)
      expect(game.dragonRun!.combo).toBe(2)

      // Season doesn't increase combo but maintains run
      const seasonTile = createTile({ card: "s2" })
      resolveDragons(game, seasonTile)
      expect(game.dragonRun!.combo).toBe(2)

      // Joker doesn't increase combo but maintains run
      const jokerTile = createTile({ card: "j1" })
      resolveDragons(game, jokerTile)
      expect(game.dragonRun!.combo).toBe(2)

      // Mutation doesn't increase combo but maintains run
      const mutationTile = createTile({ card: "m1" })
      resolveDragons(game, mutationTile)
      expect(game.dragonRun!.combo).toBe(2)
    })

    it("resets run when non-matching card is played", () => {
      const game: Game = {
        points: 0,
        dragonRun: { card: "dc", combo: 3 },
      }
      const nonMatchingTile = createTile({ card: "b2" })

      resolveDragons(game, nonMatchingTile)

      expect(game.dragonRun).toBeUndefined()
    })

    it("switches to new dragon when different dragon is played", () => {
      const game: Game = {
        points: 0,
        dragonRun: { card: "dc", combo: 3 },
      }
      const newDragonTile = createTile({ card: "db" })

      resolveDragons(game, newDragonTile)

      expect(game.dragonRun!.card).toBe("db")
      expect(game.dragonRun!.combo).toBe(0)
    })

    it("maintains dragon if same dragon is played", () => {
      const game: Game = {
        points: 0,
        dragonRun: { card: "dc", combo: 3 },
      }
      const sameDragonTile = createTile({ card: "dc" })

      resolveDragons(game, sameDragonTile)

      expect(game.dragonRun!.card).toBe("dc")
      // Combo doesn't increase for dragon cards
      expect(game.dragonRun!.combo).toBe(3)
    })
  })
})
