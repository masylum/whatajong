import type { GameState } from "./gameState"

export type Env = {
  GAME_STATE: DurableObjectNamespace<GameState>
  APP_URL: string
}

export type AppType = {
  Variables: { rateLimit: boolean }
  Bindings: Env
}
