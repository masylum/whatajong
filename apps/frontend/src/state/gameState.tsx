import type { Game } from "@/lib/game"
import {
  createContext,
  createMemo,
  useContext,
  type ParentProps,
} from "solid-js"
import { createPersistantMutable } from "./persistantMutable"

const GAME_STATE_NAMESPACE = "game-state"

type CreateGameStateParams = { id: () => string }
export function createGameState(params: CreateGameStateParams) {
  return createPersistantMutable<Game>({
    namespace: GAME_STATE_NAMESPACE,
    id: params.id,
    init: () => ({
      startedAt: new Date().getTime(),
      points: 0,
    }),
  })
}

export function fetchGameState(id: string): Game | undefined {
  const item = localStorage.getItem(`${GAME_STATE_NAMESPACE}-${id}`)
  if (!item) return undefined

  return JSON.parse(item)
}

export function calculateSeconds(game: Game) {
  return Math.floor((game.endedAt! - game.startedAt!) / 1000)
}

export function started(game: Game) {
  return createMemo(() => {
    const time = game.startedAt
    if (!time) return false

    return time <= Date.now()
  })
}

const GameStateContext = createContext<Game | undefined>()

export function GameStateProvider(props: { game: Game } & ParentProps) {
  return (
    <GameStateContext.Provider value={props.game}>
      {props.children}
    </GameStateContext.Provider>
  )
}

export function useGameState() {
  const context = useContext(GameStateContext)
  if (!context) throw new Error("can't find GameStateContext")

  return context
}
