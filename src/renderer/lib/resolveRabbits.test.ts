import { describe, it, expect } from "vitest"
import { resolveRabbits } from "./resolveRabbits"
import { createTile } from "./test/utils"
import type { Game } from "./game"

describe("resolveRabbits", () => {
  it("initializes rabbit run when rabbit card is played with no active run", () => {
    const game: Game = { points: 0 }
    const rabbitTile = createTile({ card: "r1" })

    resolveRabbits(game, rabbitTile)

    expect(game.rabbitRun).toBeDefined()
    expect(game.rabbitRun!.card).toBe("r1")
    expect(game.rabbitRun!.combo).toBe(2)
    expect(game.rabbitRun!.score).toBe(false)
  })

  it("updates rabbit card and increases combo when another rabbit is played", () => {
    const game: Game = {
      points: 0,
      rabbitRun: { card: "r1", score: false, combo: 1 },
    }
    const rabbitTile = createTile({ card: "r2" })

    resolveRabbits(game, rabbitTile)

    expect(game.rabbitRun!.card).toBe("r2")
    expect(game.rabbitRun!.combo).toBe(3) // Increases by 2
    expect(game.rabbitRun!.score).toBe(false)
  })

  it("activates scoring when non-rabbit card is played", () => {
    const game: Game = {
      points: 0,
      rabbitRun: { card: "r3", score: false, combo: 3 },
    }
    const otherTile = createTile({ card: "b1" })

    resolveRabbits(game, otherTile)

    expect(game.rabbitRun!.card).toBe("r3")
    expect(game.rabbitRun!.combo).toBe(3) // Unchanged
    expect(game.rabbitRun!.score).toBe(true) // Now activated
  })

  it("ends rabbit run when a card is played after scoring is activated", () => {
    const game: Game = {
      points: 0,
      rabbitRun: { card: "r4", score: true, combo: 5 },
    }
    const anyTile = createTile({ card: "c1" })

    resolveRabbits(game, anyTile)

    expect(game.rabbitRun).toBeUndefined()
  })

  it("has no effect for non-rabbit cards when no run is active", () => {
    const game: Game = { points: 0 }
    const regularTile = createTile({ card: "b1" })

    resolveRabbits(game, regularTile)

    expect(game.rabbitRun).toBeUndefined()
  })

  it("works with different rabbit cards", () => {
    // Test with r1
    let game: Game = { points: 0 }
    resolveRabbits(game, createTile({ card: "r1" }))
    expect(game.rabbitRun!.card).toBe("r1")

    // Test with r2
    game = { points: 0 }
    resolveRabbits(game, createTile({ card: "r2" }))
    expect(game.rabbitRun!.card).toBe("r2")

    // Test with r3
    game = { points: 0 }
    resolveRabbits(game, createTile({ card: "r3" }))
    expect(game.rabbitRun!.card).toBe("r3")

    // Test with r4
    game = { points: 0 }
    resolveRabbits(game, createTile({ card: "r4" }))
    expect(game.rabbitRun!.card).toBe("r4")
  })
})
