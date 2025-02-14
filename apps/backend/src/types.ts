import type { GameState } from "./gameState"

export type Env = {
  GAME_STATE: DurableObjectNamespace<GameState>
}

export type AppType = {
  Variables: { rateLimit: boolean }
  Bindings: Env
}
