import type { Game } from "@/state/gameState"
import { beforeEach, describe, expect, it } from "vitest"
import { resolveGems } from "./resolveGems"
import { createTile } from "./test/utils"
import { createGame } from "./test/utils"

describe("resolveGems", () => {
  let game: Game

  beforeEach(() => {
    game = createGame()
  })

  it("sets temporaryMaterial based on gem color", () => {
    resolveGems({ tile: createTile({ cardId: "gemr" }), game })
    expect(game.temporaryMaterial).toBe("garnet")

    resolveGems({ tile: createTile({ cardId: "gemg" }), game })
    expect(game.temporaryMaterial).toBe("jade")

    resolveGems({ tile: createTile({ cardId: "gemb" }), game })
    expect(game.temporaryMaterial).toBe("topaz")

    resolveGems({ tile: createTile({ cardId: "gemk" }), game })
    expect(game.temporaryMaterial).toBe("quartz")
  })

  it("unsets temporaryMaterial if not a gem tile", () => {
    game.temporaryMaterial = "garnet" // Pre-set a material
    resolveGems({ tile: createTile({ cardId: "bam1" }), game })
    expect(game.temporaryMaterial).toBeUndefined()
  })
})
