import type { Color, Material } from "@/lib/game"
import { type ParentProps, createContext, useContext } from "solid-js"
import { createPersistantMutable } from "./persistantMutable"

export const GAME_STATE_NAMESPACE = "game-state-v2"

const END_CONDITIONS = ["empty-board", "no-pairs"] as const

export type PhoenixRun = {
  number?: number
  combo: number
}

export type DragonRun = {
  color: Color
  combo: number
}
type EndConditions = (typeof END_CONDITIONS)[number]
export type Game = {
  points: number
  coins: number
  time: number
  pause: boolean
  endCondition?: EndConditions
  temporaryMaterial?: Exclude<Material, "bone">
  dragonRun?: DragonRun
  phoenixRun?: PhoenixRun
  joker?: boolean
}

type CreateGameStateParams = { id: () => string }
export function createGameState(params: CreateGameStateParams) {
  return createPersistantMutable<Game>({
    namespace: GAME_STATE_NAMESPACE,
    id: params.id,
    init: initialGameState,
  })
}

export function initialGameState() {
  return {
    points: 0,
    coins: 0,
    time: 0,
    pause: false,
  }
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
