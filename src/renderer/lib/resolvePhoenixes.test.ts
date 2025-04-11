import { describe, expect, it } from "vitest"
import type { Game } from "./game"
import { resolvePhoenixRun } from "./resolvePhoenixes"
import { createTile } from "./test/utils"

describe("resolvePhoenixRun", () => {
  it("initializes phoenix run when phoenix card is played with no active run", () => {
    const game: Game = { points: 0 }
    const phoenixTile = createTile({ card: "pb" })

    resolvePhoenixRun(game, phoenixTile)

    expect(game.phoenixRun).toBeDefined()
    expect(game.phoenixRun!.number).toBe(0)
    expect(game.phoenixRun!.combo).toBe(0)
  })

  it("sets the number to the tile rank when a suit card is played", () => {
    const game: Game = {
      points: 0,
      phoenixRun: { number: 2, combo: 0 },
    }
    const suitTile = createTile({ card: "b3" })

    resolvePhoenixRun(game, suitTile)

    expect(game.phoenixRun!.number).toBe(3)
    expect(game.phoenixRun!.combo).toBe(1)
  })

  it("increments the number when a rabbit is played", () => {
    const game: Game = {
      points: 0,
      phoenixRun: { number: 3, combo: 3 },
    }
    const rabbitTile = createTile({ card: "r1" })

    resolvePhoenixRun(game, rabbitTile)

    expect(game.phoenixRun!.number).toBe(4)
    expect(game.phoenixRun!.combo).toBe(4)
  })

  it("resets the run when a non-matching card is played", () => {
    const game: Game = {
      points: 0,
      phoenixRun: { number: 3, combo: 3 },
    }
    const nonMatchingTile = createTile({ card: "b5" }) // Should be b4 to match

    resolvePhoenixRun(game, nonMatchingTile)

    expect(game.phoenixRun).toBeUndefined()
  })

  it("wraps around the run when the number reaches 8", () => {
    const game: Game = {
      points: 0,
      phoenixRun: { number: 8, combo: 8 },
    }
    const anyTile = createTile({ card: "b9" })

    resolvePhoenixRun(game, anyTile)

    expect(game.phoenixRun!.number).toBe(0)
    expect(game.phoenixRun!.combo).toBe(9)
  })

  it("maintains the run for special cards", () => {
    const game: Game = {
      points: 0,
      phoenixRun: { number: 4, combo: 6 },
    }

    // Joker maintains the run
    resolvePhoenixRun(game, createTile({ card: "j1" }))
    expect(game.phoenixRun).toBeDefined()
    expect(game.phoenixRun!.combo).toBe(6)

    // Mutation maintains the run
    game.phoenixRun = { number: 4, combo: 6 }
    resolvePhoenixRun(game, createTile({ card: "m1" }))
    expect(game.phoenixRun).toBeDefined()
    expect(game.phoenixRun!.combo).toBe(6)

    // Dragon maintains the run
    game.phoenixRun = { number: 4, combo: 6 }
    resolvePhoenixRun(game, createTile({ card: "dc" }))
    expect(game.phoenixRun).toBeDefined()
    expect(game.phoenixRun!.combo).toBe(6)
  })

  it("resets to new phoenix when different phoenix is played", () => {
    const game: Game = {
      points: 0,
      phoenixRun: { number: 5, combo: 6 },
    }
    const newPhoenixTile = createTile({ card: "pc" })

    resolvePhoenixRun(game, newPhoenixTile)

    expect(game.phoenixRun!.number).toBe(0)
    expect(game.phoenixRun!.combo).toBe(0)
  })

  it("has no effect for non-phoenix cards when no run is active", () => {
    const game: Game = { points: 0 }
    const regularTile = createTile({ card: "b1" })

    resolvePhoenixRun(game, regularTile)

    expect(game.phoenixRun).toBeUndefined()
  })
})
