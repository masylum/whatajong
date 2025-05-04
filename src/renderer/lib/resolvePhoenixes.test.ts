import { describe, expect, it } from "vitest"
import { resolvePhoenixRun } from "./resolvePhoenixes"
import { createGame, createTile } from "./test/utils"

describe("resolvePhoenixRun", () => {
  it("initializes phoenix run when phoenix card is played with no active run", () => {
    const game = createGame()
    const phoenixTile = createTile({ cardId: "pb" })

    resolvePhoenixRun({ game, tile: phoenixTile })

    expect(game.phoenixRun).toBeDefined()
    expect(game.phoenixRun!.number).toBe(undefined)
    expect(game.phoenixRun!.combo).toBe(0)
  })

  it("sets the number to the tile rank when a suit card is played", () => {
    const game = createGame({
      phoenixRun: { number: undefined, combo: 0 },
    })
    const suitTile = createTile({ cardId: "b3" })

    resolvePhoenixRun({ game, tile: suitTile })

    expect(game.phoenixRun!.number).toBe(3)
    expect(game.phoenixRun!.combo).toBe(1)
  })

  it("resets the run when a non-matching card is played", () => {
    const game = createGame({
      phoenixRun: { number: 3, combo: 3 },
    })
    const nonMatchingTile = createTile({ cardId: "b5" }) // Should be b4 to match

    resolvePhoenixRun({ game, tile: nonMatchingTile })

    expect(game.phoenixRun).toBeUndefined()
  })

  it("maintains the run when a the first card is not a suit", () => {
    const game = createGame({
      phoenixRun: { number: undefined, combo: 0 },
    })
    const jokerTile = createTile({ cardId: "j1" })

    resolvePhoenixRun({ game, tile: jokerTile })

    expect(game.phoenixRun!.number).toBe(undefined)
    expect(game.phoenixRun!.combo).toBe(0)

    const suitTile = createTile({ cardId: "b3" })

    resolvePhoenixRun({ game, tile: suitTile })

    expect(game.phoenixRun!.number).toBe(3)
    expect(game.phoenixRun!.combo).toBe(1)
  })

  it("wraps around the run when the number reaches 9", () => {
    const game = createGame({
      phoenixRun: { number: 9, combo: 8 },
    })
    const anyTile = createTile({ cardId: "b1" })

    resolvePhoenixRun({ game, tile: anyTile })

    expect(game.phoenixRun!.number).toBe(1)
    expect(game.phoenixRun!.combo).toBe(9)
  })

  it("maintains the run for special cards", () => {
    const game = createGame({
      phoenixRun: { number: 4, combo: 6 },
    })

    // Joker maintains the run
    resolvePhoenixRun({ game, tile: createTile({ cardId: "j1" }) })
    expect(game.phoenixRun).toBeDefined()
    expect(game.phoenixRun!.combo).toBe(6)

    // Mutation maintains the run
    resolvePhoenixRun({ game, tile: createTile({ cardId: "m1" }) })
    expect(game.phoenixRun).toBeDefined()
    expect(game.phoenixRun!.combo).toBe(6)

    // Dragon maintains the run
    resolvePhoenixRun({ game, tile: createTile({ cardId: "dr" }) })
    expect(game.phoenixRun).toBeDefined()
    expect(game.phoenixRun!.combo).toBe(6)
  })

  it("resets to new phoenix when different phoenix is played", () => {
    const game = createGame({
      phoenixRun: { number: 5, combo: 6 },
    })
    const newPhoenixTile = createTile({ cardId: "pr" })

    resolvePhoenixRun({ game, tile: newPhoenixTile })

    expect(game.phoenixRun!.number).toBe(undefined)
    expect(game.phoenixRun!.combo).toBe(0)
  })

  it("has no effect for non-phoenix cards when no run is active", () => {
    const game = createGame()
    const regularTile = createTile({ cardId: "b1" })

    resolvePhoenixRun({ game, tile: regularTile })

    expect(game.phoenixRun).toBeUndefined()
  })
})
