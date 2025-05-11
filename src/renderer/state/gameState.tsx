import type { Color, Material } from "@/lib/game"
import { type ParentProps, createContext, useContext } from "solid-js"
import { createPersistantMutable } from "./persistantMutable"
import { TUTORIAL_SEED } from "./runState"

export const GAME_STATE_NAMESPACE = "game-state-v3"

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
  tutorialStep?: number
}

type CreateGameStateParams = { id: () => string }
export function createGameState(params: CreateGameStateParams) {
  return createPersistantMutable<Game>({
    namespace: GAME_STATE_NAMESPACE,
    init: () => initialGameState(params.id()),
  })
}

export function initialGameState(id: string) {
  return {
    points: 0,
    coins: 0,
    time: 0,
    pause: false,
    tutorialStep: id === `${TUTORIAL_SEED}-1` ? 1 : undefined,
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
